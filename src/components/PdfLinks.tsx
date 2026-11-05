import { ghost } from "./ui";
/** "View PDF" opens the PDF in a new tab; "Download PDF" saves it. Both come from /api/documents. */
export default function PdfLinks({ kind, id }: { kind: "invoice" | "credit-note" | "receipt" | "purchase-order" | "bill"; id: string }) {
  const base = `/api/documents/${kind}/${id}`;
  return <><a href={base} target="_blank" rel="noopener noreferrer" className={`${ghost} print:hidden`}>View PDF</a><a href={`${base}?download=1`} className={`${ghost} print:hidden`}>Download PDF</a></>;
}
