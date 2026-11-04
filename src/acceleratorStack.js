// "Built with" logos for each accelerator, taken from what each description in accelerators.js names.
// TODO: confirm the stack with Nataraj together with the accelerator content.
// `key` is a logo key from logoMap.js and must be a simple-icons brand (these sit on the home page,
// where the AWS / Microsoft artwork is not allowed). Items without a key show a generic icon.
export const ACCELERATOR_STACK = {
  prometheus: [
    { key: "qlik", label: "Qlik Enterprise Manager" },
    { key: "prometheus", label: "Prometheus" },
    { key: "grafana", label: "Grafana" },
  ],
  nprinting: [
    { key: "qlik", label: "Qlik Sense" },
    { kind: "server", label: "NPrinting REST API" },
  ],
  "pdf-export": [
    { key: "qlik", label: "Qlik Sense" },
    { kind: "file", label: "PDF" },
  ],
  "log-scraping": [
    { key: "qlik", label: "Qlik Replicate" },
    { kind: "file", label: "System logs" },
  ],
  "adls-logs": [
    { key: "qlik", label: "Qlik logs" },
    { kind: "cloud", label: "ADLS Gen2" },
  ],
};
