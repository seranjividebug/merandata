import { COMPANY, addressLine, hasContactDetails } from "../company";

/** Email, phone and registered office from src/company.js. Renders nothing for details that are not set. */
export default function ContactDetails({ className = "" }) {
  if (!hasContactDetails()) return null;
  const address = addressLine();
  return (
    <address className={"contact-details " + className}>
      {COMPANY.email && <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>}
      {COMPANY.phone && <a href={`tel:${COMPANY.phone.replace(/[^+\d]/g, "")}`}>{COMPANY.phone}</a>}
      {address && <span><strong>{COMPANY.addressLabel + ":"}</strong> {address}</span>}
    </address>
  );
}
