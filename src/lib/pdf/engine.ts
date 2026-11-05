import { PDFDocument, StandardFonts, LineCapStyle, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
/** A small invoice-layout engine on top of pdf-lib (pure JavaScript, no fonts or binaries to ship).
 *  Text uses the built-in Helvetica. It has no rupee sign, so "₹" is drawn as a vector shape. Characters Helvetica can't show (for example Hindi or Kannada letters) print as "?". */
export const W = 595.28, H = 841.89, M = 36, BODY = W - 2 * M;
export const COL = { ink: rgb(0.055, 0.106, 0.169), text: rgb(0.2, 0.255, 0.333), muted: rgb(0.392, 0.455, 0.545), line: rgb(0.886, 0.91, 0.941), brand: rgb(0.059, 0.463, 0.431), brandDark: rgb(0.043, 0.353, 0.329), soft: rgb(0.933, 0.953, 0.965), white: rgb(1, 1, 1), ok: rgb(0.086, 0.502, 0.239), warn: rgb(0.76, 0.255, 0.047) };
export type Align = "l" | "r" | "c";
export type Col = { label: string; w: number; align?: Align };
export class Doc {
  page!: PDFPage; y = 0; private pages: PDFPage[] = []; private chars: Set<number>;
  private constructor(readonly pdf: PDFDocument, readonly reg: PDFFont, readonly bold: PDFFont, private footer: string) { this.chars = new Set(reg.getCharacterSet()); this.add(); }
  static async create(o: { title: string; author: string; subject?: string; footer?: string }) {
    const pdf = await PDFDocument.create(); pdf.setTitle(o.title); pdf.setAuthor(o.author); pdf.setSubject(o.subject ?? o.title); pdf.setCreator("Direct2Hub"); pdf.setProducer("Direct2Hub");
    return new Doc(pdf, await pdf.embedFont(StandardFonts.Helvetica), await pdf.embedFont(StandardFonts.HelveticaBold), o.footer ?? "");
  }
  add() { this.page = this.pdf.addPage([W, H]); this.pages.push(this.page); this.y = M; }
  /** Replaces what the font can't draw, so a stray character never breaks the whole PDF. */
  clean(s: unknown) { return String(s ?? "").replace(/[\r\n\t]+/g, " ").replace(/\u20b9/g, "\u20b9").replace(/[^\x20-\x7e\u20b9\u00a0-\u00ff\u2013\u2014\u2018\u2019\u201c\u201d\u2022\u2026]/g, "?").split("").map((ch) => (ch === "\u20b9" || this.chars.has(ch.codePointAt(0)!) ? ch : "?")).join(""); }
  f(b?: boolean) { return b ? this.bold : this.reg; }
  /** Width of text in points (the rupee sign counts as 0.6 of the font size). */
  w(s: string, size: number, b = false) { return s.split("\u20b9").reduce((t, part, i) => t + this.f(b).widthOfTextAtSize(part, size) + (i ? size * 0.6 : 0), 0); }
  private glyph(x: number, base: number, size: number, color: RGB) {
    const k = size * 0.0715, p = (gx: number, gy: number) => `${(x + gx * k).toFixed(2)} ${(H - (base + (10.1 - gy) * k)).toFixed(2)}`; // a 0..10 grid with y going down; the top bar sits at digit height and the leg ends on the baseline
    this.page.drawSvgPath(`M ${p(0.6, 0)} L ${p(7.4, 0)} M ${p(0.6, 3.3)} L ${p(7.4, 3.3)} M ${p(1.5, 0)} L ${p(3.4, 0)} C ${p(7.7, 0)} ${p(7.7, 7)} ${p(3.4, 7)} L ${p(1.2, 7)} L ${p(6.9, 10.2)}`, { x: 0, y: H, borderColor: color, borderWidth: Math.max(0.6, size * 0.08), borderLineCap: LineCapStyle.Round });
  }
  private run(s: string, x: number, base: number, size: number, b: boolean, color: RGB) {
    s.split("\u20b9").forEach((part, i) => { if (i) { this.glyph(x, base, size, color); x += size * 0.6; } if (part) { this.page.drawText(part, { x, y: base, size, font: this.f(b), color }); x += this.f(b).widthOfTextAtSize(part, size); } });
  }
  /** Draws one line of text with its top at `top` (points from the top of the page). `at` is the left edge, or the right edge when align is "r". */
  text(s: unknown, at: number, top: number, o: { size?: number; bold?: boolean; color?: RGB; align?: Align; width?: number } = {}) {
    const size = o.size ?? 9, t = this.clean(s), tw = this.w(t, size, o.bold), x = o.align === "r" ? at - tw : o.align === "c" ? at + ((o.width ?? 0) - tw) / 2 : at;
    this.run(t, x, H - top - size * 0.82, size, !!o.bold, o.color ?? COL.text); return tw;
  }
  wrap(s: unknown, width: number, size = 9, b = false): string[] {
    const out: string[] = [];
    for (const para of this.clean(s).split(/\s*\|\|\s*/)) { let line = ""; for (let word of para.split(" ")) {
      while (this.w(word, size, b) > width) { let k = word.length; while (k > 1 && this.w(word.slice(0, k), size, b) > width) k--; if (line) { out.push(line); line = ""; } out.push(word.slice(0, k)); word = word.slice(k); }
      const next = line ? `${line} ${word}` : word; if (this.w(next, size, b) <= width) line = next; else { if (line) out.push(line); line = word; } } out.push(line); }
    return out.filter((l, i, a) => l || a.length === 1);
  }
  /** Wrapped paragraph; returns the height used. */
  para(s: unknown, x: number, top: number, width: number, o: { size?: number; bold?: boolean; color?: RGB; lead?: number } = {}) {
    const size = o.size ?? 9, lead = o.lead ?? size * 1.4, ls = this.wrap(s, width, size, o.bold); ls.forEach((l, i) => this.text(l, x, top + i * lead, { size, bold: o.bold, color: o.color })); return ls.length * lead;
  }
  rect(x: number, top: number, w: number, h: number, o: { fill?: RGB; stroke?: RGB; width?: number } = {}) { this.page.drawRectangle({ x, y: H - top - h, width: w, height: h, ...(o.fill ? { color: o.fill } : {}), ...(o.stroke ? { borderColor: o.stroke, borderWidth: o.width ?? 0.7 } : {}) }); }
  hr(top: number, x1 = M, x2 = W - M, color = COL.line, width = 0.7) { this.page.drawLine({ start: { x: x1, y: H - top }, end: { x: x2, y: H - top }, thickness: width, color }); }
  need(h: number) { if (this.y + h > H - M - 26) { this.add(); return true; } return false; }
  /** A table: coloured header, wrapped cells, page breaks that repeat the header. */
  table(cols: Col[], rows: string[][], o: { size?: number; zebra?: boolean } = {}) {
    const size = o.size ?? 8.5, pad = 5, lead = size * 1.35, head = () => { this.rect(M, this.y, BODY, 20, { fill: COL.brand }); let x = M; for (const c of cols) { this.text(c.label, c.align === "r" ? x + c.w - pad : c.align === "c" ? x : x + pad, this.y + 6, { size: size - 0.5, bold: true, color: COL.white, align: c.align === "r" ? "r" : c.align === "c" ? "c" : "l", width: c.w }); x += c.w; } this.y += 20; };
    this.need(60); head();
    rows.forEach((r, ri) => {
      const cells = r.map((v, i) => this.wrap(v, cols[i].w - 2 * pad, size)), h = Math.max(...cells.map((c) => c.length)) * lead + 2 * pad - 1;
      if (this.need(h + 2)) head(); if (o.zebra !== false && ri % 2) this.rect(M, this.y, BODY, h, { fill: COL.soft });
      let x = M; cells.forEach((ls, i) => { const c = cols[i]; ls.forEach((l, k) => this.text(l, c.align === "r" ? x + c.w - pad : c.align === "c" ? x : x + pad, this.y + pad + k * lead, { size, align: c.align === "r" ? "r" : c.align === "c" ? "c" : "l", width: c.w, color: i === 1 && cols.length > 4 ? COL.ink : COL.text })); x += c.w; });
      this.hr(this.y + h, M, W - M); this.y += h;
    });
  }
  async finish(): Promise<Uint8Array> {
    const n = this.pages.length; this.pages.forEach((p, i) => { this.page = p; this.hr(H - M + 4, M, W - M); this.text(this.footer, M, H - M + 9, { size: 7.5, color: COL.muted }); this.text(`Page ${i + 1} of ${n}`, W - M, H - M + 9, { size: 7.5, color: COL.muted, align: "r" }); });
    return this.pdf.save();
  }
}
const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"], TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
const two = (n: number) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? " " + ONES[n % 10] : ""}`), three = (n: number) => `${n >= 100 ? `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? " " : ""}` : ""}${n % 100 ? two(n % 100) : ""}`;
/** 1234.5 -> "Indian Rupees One Thousand Two Hundred Thirty Four and Fifty Paise Only" (lakh / crore system). */
export function rupeesInWords(amount: number, cur = "Indian Rupees"): string {
  const p = Math.round(Math.abs(amount) * 100), r = Math.floor(p / 100), ps = p % 100; if (!p) return `${cur} Zero Only`;
  const parts: string[] = [], cr = Math.floor(r / 1e7), la = Math.floor((r % 1e7) / 1e5), th = Math.floor((r % 1e5) / 1e3), rest = r % 1e3;
  if (cr) parts.push(`${three(cr)} Crore`); if (la) parts.push(`${two(la)} Lakh`); if (th) parts.push(`${two(th)} Thousand`); if (rest) parts.push(three(rest));
  return `${cur}${r ? " " + parts.join(" ") : ""}${ps ? `${r ? " and" : ""} ${two(ps)} Paise` : ""} Only`;
}
export const money = (n: number) => `\u20b9${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
