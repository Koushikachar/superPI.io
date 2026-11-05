import { Doc, COL, W, M, BODY, money, type Col } from "./engine";
export type Party = { name: string; lines?: string[]; gstin?: string | null; state?: string | null };
export type Spec = {
  title: string; number: string; filename: string; author: string;
  status?: { text: string; tone: "ok" | "warn" | "muted" };
  seller: Party; billLabel: string; bill: Party; billExtra?: [string, string][];
  meta: [string, string][];
  columns: Col[]; rows: string[][];
  taxSummary?: { head: string[]; rows: string[][] };
  totals: [string, string, ("bold" | "big" | "muted")?][];
  words?: string; payments?: { head: string[]; rows: string[][]; title: string }; notes?: string[];
  footer: string;
};
const tone = (t: "ok" | "warn" | "muted") => (t === "ok" ? COL.ok : t === "warn" ? COL.warn : COL.muted);
/** One layout for every document: sales invoice, credit note, plan invoice, purchase order, supplier bill. */
export async function renderDocument(s: Spec): Promise<Uint8Array> {
  const d = await Doc.create({ title: `${s.title} ${s.number}`, author: s.author, footer: s.footer });
  // ---- header: who is selling (left), what this is (right)
  const half = BODY / 2 - 10; d.text(s.seller.name, M, d.y, { size: 15, bold: true, color: COL.ink });
  let h = 21 + d.para((s.seller.lines ?? []).filter(Boolean).join(" || "), M, d.y + 21, half, { size: 8.5, color: COL.text });
  if (s.seller.gstin) { d.text(`GSTIN: ${s.seller.gstin}`, M, d.y + h + 2, { size: 8.5, bold: true, color: COL.ink }); h += 13; }
  if (s.seller.state) { d.text(`State: ${s.seller.state}`, M, d.y + h + 2, { size: 8.5 }); h += 13; }
  d.text(s.title, W - M, d.y, { size: 20, bold: true, color: COL.brand, align: "r" }); d.text(`# ${s.number}`, W - M, d.y + 27, { size: 10.5, bold: true, color: COL.ink, align: "r" });
  let ry = d.y + 46; if (s.status) { const tw = d.w(s.status.text, 9, true) + 20, c = tone(s.status.tone); d.rect(W - M - tw, ry, tw, 18, { stroke: c, width: 1.1 }); d.text(s.status.text, W - M - tw, ry + 5, { size: 9, bold: true, color: c, align: "c", width: tw }); ry += 24; }
  d.y = Math.max(d.y + h + 10, ry + 4); d.hr(d.y, M, W - M, COL.brand, 1.6); d.y += 14;
  // ---- bill to (left) and the document's own details (right)
  const top = d.y; d.text(s.billLabel.toUpperCase(), M, top, { size: 7.5, bold: true, color: COL.muted }); d.text(s.bill.name, M, top + 12, { size: 10.5, bold: true, color: COL.ink });
  let ly = 12 + d.para((s.bill.lines ?? []).filter(Boolean).join(" || "), M, top + 26, half, { size: 8.5 }) + 14; if (s.bill.gstin) { d.text(`GSTIN: ${s.bill.gstin}`, M, top + ly, { size: 8.5, bold: true, color: COL.ink }); ly += 12; }
  for (const [k, v] of s.billExtra ?? []) { if (!v) continue; d.text(`${k}: ${v}`, M, top + ly, { size: 8.5 }); ly += 12; }
  let my = 0; for (const [k, v] of s.meta) { if (!v) continue; d.text(k, W / 2 + 20, top + my, { size: 8.5, color: COL.muted }); d.text(v, W - M, top + my, { size: 8.5, bold: true, color: COL.ink, align: "r" }); my += 13.5; }
  d.y = top + Math.max(ly, my) + 12;
  // ---- items
  d.table(s.columns, s.rows); d.y += 12;
  // ---- left: amount in words + tax summary; right: totals
  const leftW = BODY * 0.52, totW = BODY * 0.4, tx = W - M - totW, start = d.y; d.need(120 + s.totals.length * 4); const y0 = d.y;
  let lh = 0; if (s.words) { d.text("TOTAL IN WORDS", M, y0, { size: 7.5, bold: true, color: COL.muted }); lh = 12 + d.para(s.words, M, y0 + 12, leftW, { size: 9, bold: true, color: COL.ink }) + 8; }
  if (s.taxSummary) { const ts = s.taxSummary, n = ts.head.length, cw = leftW / n; d.text("TAX SUMMARY", M, y0 + lh, { size: 7.5, bold: true, color: COL.muted }); lh += 12; d.rect(M, y0 + lh, leftW, 15, { fill: COL.soft }); ts.head.forEach((t, i) => d.text(t, i ? M + (i + 1) * cw - 4 : M + 4, y0 + lh + 4, { size: 7.5, bold: true, color: COL.ink, align: i ? "r" : "l" })); lh += 15; for (const r of ts.rows) { r.forEach((t, i) => d.text(t, i ? M + (i + 1) * cw - 4 : M + 4, y0 + lh + 3, { size: 8, align: i ? "r" : "l" })); lh += 14; } lh += 4; }
  let th = 0; for (const [k, v, st] of s.totals) { if (st === "big") { d.rect(tx - 6, y0 + th - 3, totW + 6, 22, { fill: COL.brand }); d.text(k, tx + 2, y0 + th + 3, { size: 10, bold: true, color: COL.white }); d.text(v, W - M - 6, y0 + th + 3, { size: 10.5, bold: true, color: COL.white, align: "r" }); th += 26; } else { d.text(k, tx, y0 + th, { size: 9, bold: st === "bold", color: st === "muted" ? COL.muted : COL.text }); d.text(v, W - M, y0 + th, { size: 9, bold: st === "bold", color: st === "muted" ? COL.muted : COL.ink, align: "r" }); th += 15; } }
  d.y = Math.max(start + lh, start + th) + 14;
  // ---- payments, notes
  if (s.payments?.rows.length) { d.need(40 + s.payments.rows.length * 14); d.text(s.payments.title.toUpperCase(), M, d.y, { size: 7.5, bold: true, color: COL.muted }); d.y += 12; const cw = BODY / s.payments.head.length; d.rect(M, d.y, BODY, 15, { fill: COL.soft }); s.payments.head.forEach((t, i) => d.text(t, i === s.payments!.head.length - 1 ? W - M - 4 : M + i * cw + 4, d.y + 4, { size: 7.5, bold: true, color: COL.ink, align: i === s.payments!.head.length - 1 ? "r" : "l" })); d.y += 15; for (const r of s.payments.rows) { r.forEach((t, i) => d.text(t, i === r.length - 1 ? W - M - 4 : M + i * cw + 4, d.y + 3, { size: 8, align: i === r.length - 1 ? "r" : "l" })); d.hr(d.y + 14); d.y += 14; } d.y += 10; }
  if (s.notes?.length) { d.need(16 + s.notes.length * 12); d.text("NOTES", M, d.y, { size: 7.5, bold: true, color: COL.muted }); d.y += 12; for (const n of s.notes) d.y += d.para(n, M, d.y, BODY, { size: 8.5, color: COL.text }) + 2; }
  return d.finish();
}
export { money };
