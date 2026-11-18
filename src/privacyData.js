// Text of the privacy policy page (/privacy/). It is read by the page, by llms-full.txt and by the checks, so it
// exists in one place only.
//
// DRAFT: Sri to review (see docs/CONTENT_REVIEW.md). The wording is a basic policy based on how the site works
// today; the retention period, the statement about trackers and any legal wording need his confirmation.
import { COMPANY, addressLine } from "./company";

export const PRIVACY_UPDATED = "November 2026";

export const PRIVACY_INTRO =
  "This policy explains what personal information Meridanta collects through this website, why we collect it, and how you can contact us about it.";

export const PRIVACY_SECTIONS = [
  {
    heading: "What we collect",
    paragraphs: ["When you contact us through the website or by email, we collect the details you choose to give us:"],
    items: [
      "your name",
      "your business email address",
      "your company name (optional)",
      "the area of interest you select (optional)",
      "the message you write",
    ],
    after: [
      "We do not ask for any other personal information.",
      "When the website's contact form is in use, it also checks that you are a person (using Cloudflare Turnstile), and our server briefly keeps an anonymous code made from your connection address, only to limit repeated submissions and block spam.",
    ],
  },
  {
    heading: "Why we use it",
    paragraphs: ["We use your details only to respond to your enquiry and to follow up on it."],
  },
  {
    heading: "Who can see it",
    paragraphs: [
      "Your enquiry is read by the Meridanta team. When you use the contact form, it is delivered to us by email through an email delivery service (Resend).",
      "We do not sell your personal information, and we do not share it with anyone for their own marketing.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: ["We keep your enquiry for as long as we need it to handle your request and for ordinary business records."],
  },
  {
    heading: "Cookies and tracking",
    paragraphs: ["This website does not use advertising or analytics trackers."],
  },
  {
    heading: "Your choices",
    paragraphs: [`You can ask us to show you, correct or delete the personal information we hold about you by writing to ${COMPANY.email}.`],
  },
  {
    heading: "Contact us",
    paragraphs: [`Email: ${COMPANY.email}`, `${COMPANY.addressLabel}: ${addressLine()}`],
  },
  {
    heading: "Changes to this policy",
    paragraphs: ["We may update this policy from time to time. The date at the top of this page shows when it was last changed."],
  },
];

/** The whole policy as plain text, for llms-full.txt. */
export const privacyText = () =>
  [PRIVACY_INTRO, ...PRIVACY_SECTIONS.flatMap((s) => [`### ${s.heading}`, ...s.paragraphs, ...(s.items ?? []).map((i) => `- ${i}`), ...(s.after ?? [])])].join("\n\n");
