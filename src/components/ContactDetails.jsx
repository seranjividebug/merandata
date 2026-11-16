import { COMPANY, addressLine, hasContactDetails } from "../company";

/** Email, phone and address from src/company.js. Renders nothing until those details are confirmed. */
export default function ContactDetails({ className = "" }) {
  if (!hasContactDetails()) return null;
  const address = addressLine();
  return (
    <address className={"contact-details " + className}>
      {COMPANY.email && <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>}
      {COMPANY.phone && <a href={`tel:${COMPANY.phone.replace(/[^+\d]/g, "")}`}>{COMPANY.phone}</a>}
      {address && <span>{address}</span>}
    </address>
  );
}
