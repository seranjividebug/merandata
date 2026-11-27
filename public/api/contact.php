<?php
declare(strict_types=1);

/**
 * Meridanta contact form endpoint (Hostinger, PHP 7.4 or newer).
 *
 *   POST /api/contact.php   JSON in, JSON out.
 *
 * Request body (application/json):
 *   name, email, company (optional), interest (optional), message,
 *   website (honeypot, must stay empty), turnstileToken, page (optional URL)
 *
 * Status codes:
 *   200 {"ok":true}                      sent (also returned, silently, for honeypot hits)
 *   400 {"ok":false,"error":"bad_request"}        body is not valid JSON
 *   403 {"ok":false,"error":"verification_failed"} Turnstile check failed
 *   405 {"ok":false,"error":"method_not_allowed"}  anything except POST
 *   413 {"ok":false,"error":"too_large"}           body over 16 KB
 *   415 {"ok":false,"error":"unsupported_media_type"}
 *   422 {"ok":false,"error":"validation","errors":{field:message}}
 *   429 {"ok":false,"error":"rate_limited"}        more than 5 requests per hour per IP
 *   502 {"ok":false,"error":"send_failed"}         Resend or Turnstile could not be reached or refused
 *   503 {"ok":false,"error":"unavailable"}         config file missing or incomplete
 *   500 {"ok":false,"error":"server_error"}        unexpected error
 *
 * Secrets are read from ../meridanta-config.php (one level above public_html), never from this folder.
 * Rate-limit data and the log live in ../meridanta-data/ (also outside public_html).
 * Internal details are only written to the log, never returned to the visitor.
 */

const MAX_BODY_BYTES = 16384;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 3600;
const MAX_LOG_BYTES = 5242880;
const SITE_ORIGIN = 'https://meridanta.com';

// Keep in sync with INTERESTS in src/data.js (the build fails if a label is missing here).
const INTERESTS = [
    "AI Solutions & Services",
    "Data Engineering & Analytics",
    "Qlik Solutions & Accelerators",
    "Healthcare Insights",
    "Cloud & Modernisation",
    "Consulting & Delivery",
    "Other",
];

ini_set('display_errors', '0');
error_reporting(E_ALL);

/** Sends a JSON response and stops. */
function respond(int $status, array $body, array $headers = []): void
{
    if (!headers_sent()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        header('X-Content-Type-Options: nosniff');
        header('X-Robots-Tag: noindex');
        foreach ($headers as $name => $value) {
            header($name . ': ' . $value);
        }
    }
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Default folder for the rate-limit files and the log: one level above public_html. */
function default_data_dir(): string
{
    return dirname(__DIR__, 2) . '/meridanta-data';
}

function ensure_dir(string $dir): bool
{
    if (is_dir($dir)) {
        return true;
    }
    return @mkdir($dir, 0700, true) || is_dir($dir);
}

/** Appends one line to the log. Never throws, never logs secrets or message text. */
function log_event(string $level, string $event, array $context = [], ?string $dataDir = null): void
{
    $dir = $dataDir ?? default_data_dir();
    $line = gmdate('c') . ' ' . $level . ' ' . $event . ' ' . json_encode($context, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE) . "\n";
    if (ensure_dir($dir)) {
        $file = $dir . '/contact.log';
        if (is_file($file) && filesize($file) > MAX_LOG_BYTES) {
            @rename($file, $file . '.1');
        }
        if (@file_put_contents($file, $line, FILE_APPEND | LOCK_EX) !== false) {
            return;
        }
    }
    error_log('meridanta-contact ' . $line);
}

/** Loads ../meridanta-config.php. Returns null while it is missing or incomplete. */
function load_config(): ?array
{
    $path = dirname(__DIR__, 2) . '/meridanta-config.php';
    if (!is_file($path) || !is_readable($path)) {
        return null;
    }
    $loaded = require $path;
    if (!is_array($loaded)) {
        return null;
    }
    foreach (['RESEND_API_KEY', 'TURNSTILE_SECRET_KEY'] as $key) {
        if (!isset($loaded[$key]) || !is_string($loaded[$key]) || trim($loaded[$key]) === '' || strpos($loaded[$key], 'PASTE_') === 0) {
            return null;
        }
    }
    $defaults = [
        'mail_to' => 'srivatsans@meridanta.com',
        'mail_from' => 'Meridanta Website <noreply@send.meridanta.com>',
        'data_dir' => default_data_dir(),
        'ip_header' => 'REMOTE_ADDR',
        'resend_api_url' => 'https://api.resend.com/emails',
        'turnstile_verify_url' => 'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    ];
    $config = array_merge($defaults, $loaded);
    $config['salt'] = hash('sha256', 'meridanta-contact|' . $config['RESEND_API_KEY']);
    return $config;
}

/** The visitor's IP. Uses the header named in the config (default REMOTE_ADDR); falls back to REMOTE_ADDR. */
function client_ip(array $config): string
{
    $header = (string) $config['ip_header'];
    $value = isset($_SERVER[$header]) ? (string) $_SERVER[$header] : '';
    if (strpos($value, ',') !== false) {
        // A list such as X-Forwarded-For: the first entry can be written by the visitor, the last one is added by
        // the server's own proxy, so use the last.
        $parts = explode(',', $value);
        $value = trim((string) end($parts));
    }
    if (filter_var($value, FILTER_VALIDATE_IP)) {
        return $value;
    }
    $fallback = isset($_SERVER['REMOTE_ADDR']) ? (string) $_SERVER['REMOTE_ADDR'] : '0.0.0.0';
    return filter_var($fallback, FILTER_VALIDATE_IP) ? $fallback : '0.0.0.0';
}

/** Short anonymous id for an IP, safe to put in the log. */
function ip_id(string $ip, array $config): string
{
    return substr(hash('sha256', $config['salt'] . $ip), 0, 12);
}

/** Deletes rate-limit files that are older than two windows. Runs on about 2% of requests. */
function prune_rate_files(string $dir): void
{
    if (mt_rand(1, 50) !== 1) {
        return;
    }
    $cutoff = time() - 2 * RATE_LIMIT_WINDOW_SECONDS;
    foreach (glob($dir . '/*.json') ?: [] as $file) {
        if (is_file($file) && filemtime($file) < $cutoff) {
            @unlink($file);
        }
    }
}

/**
 * Counts this request for the IP. Returns null when it is allowed, or the number of
 * seconds to wait when the IP already made 5 requests in the last hour.
 * If the storage cannot be used the request is allowed (Turnstile still protects the form) and an error is logged.
 */
function rate_limit_hit(string $ip, array $config): ?int
{
    $dir = $config['data_dir'] . '/ratelimit';
    if (!ensure_dir($dir)) {
        log_event('ERROR', 'ratelimit_dir_unwritable', [], $config['data_dir']);
        return null;
    }
    prune_rate_files($dir);
    $handle = @fopen($dir . '/' . hash('sha256', $config['salt'] . $ip) . '.json', 'c+');
    if ($handle === false) {
        log_event('ERROR', 'ratelimit_file_unwritable', [], $config['data_dir']);
        return null;
    }
    flock($handle, LOCK_EX);
    $stored = json_decode((string) stream_get_contents($handle), true);
    $now = time();
    $recent = [];
    foreach (is_array($stored) ? $stored : [] as $time) {
        if (is_int($time) && $time > $now - RATE_LIMIT_WINDOW_SECONDS) {
            $recent[] = $time;
        }
    }
    if (count($recent) >= RATE_LIMIT_MAX) {
        flock($handle, LOCK_UN);
        fclose($handle);
        return max(1, $recent[0] + RATE_LIMIT_WINDOW_SECONDS - $now);
    }
    $recent[] = $now;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($recent));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return null;
}

/** Reads and decodes the JSON body. Stops with 413, 415 or 400 when it is not acceptable. */
function read_json_body(): array
{
    $type = isset($_SERVER['CONTENT_TYPE']) ? strtolower((string) $_SERVER['CONTENT_TYPE']) : '';
    if (strpos($type, 'application/json') !== 0) {
        respond(415, ['ok' => false, 'error' => 'unsupported_media_type']);
    }
    $length = isset($_SERVER['CONTENT_LENGTH']) ? (int) $_SERVER['CONTENT_LENGTH'] : 0;
    if ($length > MAX_BODY_BYTES) {
        respond(413, ['ok' => false, 'error' => 'too_large']);
    }
    $raw = (string) file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
    if (strlen($raw) > MAX_BODY_BYTES) {
        respond(413, ['ok' => false, 'error' => 'too_large']);
    }
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        respond(400, ['ok' => false, 'error' => 'bad_request']);
    }
    return $data;
}

/** Number of characters (not bytes). */
function char_count(string $text): int
{
    return function_exists('mb_strlen') ? mb_strlen($text, 'UTF-8') : (int) preg_match_all('/./su', $text);
}

/** Trimmed string without control characters. Line breaks are kept only when $multiline is true. */
function clean_text($value, bool $multiline = false): string
{
    if (!is_string($value) || !preg_match('//u', $value)) {
        return '';
    }
    $value = str_replace(["\r\n", "\r"], "\n", $value);
    $pattern = $multiline ? '/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u' : '/[\x00-\x1F\x7F]/u';
    return trim((string) preg_replace($pattern, $multiline ? '' : ' ', $value));
}

/** Validates the fields. Returns [cleaned values, errors keyed by field]. */
function validate_input(array $input): array
{
    $clean = [
        'name' => clean_text($input['name'] ?? ''),
        'email' => clean_text($input['email'] ?? ''),
        'company' => clean_text($input['company'] ?? ''),
        'interest' => clean_text($input['interest'] ?? ''),
        'message' => clean_text($input['message'] ?? '', true),
        'page' => clean_text($input['page'] ?? ''),
    ];
    $errors = [];
    if ($clean['name'] === '' || char_count($clean['name']) > 100) {
        $errors['name'] = 'Enter your name (up to 100 characters).';
    }
    // Plain addresses only: quoted local parts ("a b"@x.com) are valid for PHP but never needed here.
    if ($clean['email'] === '' || strlen($clean['email']) > 254 || strpbrk($clean['email'], "\"'") !== false || !filter_var($clean['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'Enter an email in the format name@company.com.';
    }
    if (char_count($clean['company']) > 150) {
        $errors['company'] = 'Company name is too long (up to 150 characters).';
    }
    if ($clean['interest'] !== '' && !in_array($clean['interest'], INTERESTS, true)) {
        $errors['interest'] = 'Choose one of the listed areas.';
    }
    $messageLength = char_count($clean['message']);
    if ($messageLength < 10 || $messageLength > 4000) {
        $errors['message'] = 'Write between 10 and 4000 characters.';
    }
    // The page URL is only shown in the email; accept it only when it is on this site.
    $onSite = $clean['page'] === SITE_ORIGIN || strpos($clean['page'], SITE_ORIGIN . '/') === 0;
    if ($clean['page'] === '' || !$onSite || strlen($clean['page']) > 300) {
        $clean['page'] = SITE_ORIGIN . '/';
    }
    return [$clean, $errors];
}

/**
 * Sends a POST with curl and returns [HTTP status, response body], or [0, ''] when the request failed.
 */
function http_post(string $url, array $headers, string $body): array
{
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $response = curl_exec($curl);
    $status = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    return $response === false ? [0, ''] : [$status, (string) $response];
}

/** Checks the Turnstile token. Returns true, false (refused) or null (Cloudflare could not be reached). */
function verify_turnstile(string $token, string $ip, array $config): ?bool
{
    if ($token === '' || strlen($token) > 2048) {
        return false;
    }
    $fields = http_build_query(['secret' => $config['TURNSTILE_SECRET_KEY'], 'response' => $token, 'remoteip' => $ip]);
    [$status, $body] = http_post($config['turnstile_verify_url'], ['Content-Type: application/x-www-form-urlencoded'], $fields);
    if ($status !== 200) {
        log_event('ERROR', 'turnstile_unreachable', ['status' => $status], $config['data_dir']);
        return null;
    }
    $result = json_decode($body, true);
    if (!is_array($result) || empty($result['success'])) {
        $codes = is_array($result) && isset($result['error-codes']) ? $result['error-codes'] : [];
        log_event('WARN', 'turnstile_refused', ['codes' => $codes], $config['data_dir']);
        return false;
    }
    return true;
}

function html(string $text): string
{
    return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Builds the email subject, subject line, HTML and plain-text bodies. */
function build_email(array $clean, string $sentAt): array
{
    $area = $clean['interest'] !== '' ? $clean['interest'] : 'General';
    $company = $clean['company'] !== '' ? $clean['company'] : 'No company given';
    $subject = 'New website enquiry: ' . $area . ' – ' . $company;
    $rows = [
        'Name' => $clean['name'],
        'Email' => $clean['email'],
        'Company' => $clean['company'] !== '' ? $clean['company'] : '-',
        'Area of interest' => $clean['interest'] !== '' ? $clean['interest'] : '-',
    ];
    $htmlRows = '';
    $textRows = '';
    foreach ($rows as $label => $value) {
        $htmlRows .= '<tr><td style="padding:6px 16px 6px 0;color:#555;white-space:nowrap"><strong>' . html($label) . '</strong></td><td style="padding:6px 0">' . html($value) . '</td></tr>';
        $textRows .= $label . ': ' . $value . "\n";
    }
    $htmlBody = '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111">'
        . '<h2 style="margin:0 0 12px">New website enquiry</h2>'
        . '<table style="border-collapse:collapse">' . $htmlRows . '</table>'
        . '<h3 style="margin:20px 0 6px">Message</h3>'
        . '<div style="white-space:pre-wrap;border-left:3px solid #ccc;padding-left:12px">' . html($clean['message']) . '</div>'
        . '<p style="margin-top:20px;color:#555">Sent from ' . html($clean['page']) . '<br>' . html($sentAt) . '</p></div>';
    $textBody = "New website enquiry\n\n" . $textRows . "\nMessage:\n" . $clean['message'] . "\n\nSent from " . $clean['page'] . "\n" . $sentAt . "\n";
    return [$subject, $htmlBody, $textBody];
}

/** Sends the enquiry through the Resend API. Returns true when Resend accepted it. */
function send_enquiry(array $clean, array $config): bool
{
    $sentAt = gmdate('Y-m-d H:i:s') . ' UTC';
    [$subject, $htmlBody, $textBody] = build_email($clean, $sentAt);
    $payload = json_encode([
        'from' => $config['mail_from'],
        'to' => [$config['mail_to']],
        'reply_to' => $clean['email'],
        'subject' => $subject,
        'html' => $htmlBody,
        'text' => $textBody,
    ], JSON_UNESCAPED_UNICODE);
    [$status, $body] = http_post($config['resend_api_url'], [
        'Authorization: Bearer ' . $config['RESEND_API_KEY'],
        'Content-Type: application/json',
        'User-Agent: meridanta-contact/1.0',
    ], (string) $payload);
    if ($status < 200 || $status >= 300) {
        // Log the status and the error name only: Resend's reply can repeat the visitor's address.
        $reply = json_decode($body, true);
        $errorName = is_array($reply) && isset($reply['name']) && is_string($reply['name']) ? substr($reply['name'], 0, 60) : '';
        log_event('ERROR', 'resend_failed', ['status' => $status, 'error' => $errorName], $config['data_dir']);
        return false;
    }
    return true;
}

set_exception_handler(function (Throwable $error): void {
    log_event('ERROR', 'exception', ['type' => get_class($error), 'message' => $error->getMessage(), 'file' => basename($error->getFile()), 'line' => $error->getLine()]);
    respond(500, ['ok' => false, 'error' => 'server_error']);
});

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'method_not_allowed'], ['Allow' => 'POST']);
}

$config = load_config();
if ($config === null) {
    log_event('ERROR', 'config_missing_or_incomplete');
    respond(503, ['ok' => false, 'error' => 'unavailable']);
}

$input = read_json_body();
$ip = client_ip($config);
$who = ip_id($ip, $config);

$wait = rate_limit_hit($ip, $config);
if ($wait !== null) {
    log_event('INFO', 'rate_limited', ['ip' => $who], $config['data_dir']);
    respond(429, ['ok' => false, 'error' => 'rate_limited'], ['Retry-After' => (string) $wait]);
}

// Honeypot: real visitors never fill this hidden field. Pretend it worked and send nothing.
if (isset($input['website']) && trim((string) (is_scalar($input['website']) ? $input['website'] : 'x')) !== '') {
    log_event('INFO', 'honeypot', ['ip' => $who], $config['data_dir']);
    respond(200, ['ok' => true]);
}

[$clean, $errors] = validate_input($input);
if ($errors !== []) {
    respond(422, ['ok' => false, 'error' => 'validation', 'errors' => $errors]);
}

$token = clean_text($input['turnstileToken'] ?? '');
$verified = verify_turnstile($token, $ip, $config);
if ($verified === null) {
    respond(502, ['ok' => false, 'error' => 'send_failed']);
}
if ($verified === false) {
    respond(403, ['ok' => false, 'error' => 'verification_failed']);
}

if (!send_enquiry($clean, $config)) {
    respond(502, ['ok' => false, 'error' => 'send_failed']);
}

log_event('INFO', 'sent', ['ip' => $who, 'interest' => $clean['interest']], $config['data_dir']);
respond(200, ['ok' => true]);
