import { PLANS } from "./plans";
import { runTool, type AiCtx } from "./aitools";
/** Answers that never depend on the AI. If the AI is switched off, out of quota or down, the chat still answers from the real plan table and the signed-in business's own data. */
const rs = (n: unknown) => `₹${Number(n ?? 0).toLocaleString("en-IN")}`;
const plan = (k: string) => { const p = PLANS[k]; return `${p.label}: ${p.monthly ? `${rs(p.monthly)}/month or ${rs(p.yearly)}/year + GST` : "free, no card"}, up to ${p.products.toLocaleString("en-IN")} products, ${p.members} team members, ${p.locations} warehouse${p.locations > 1 ? "s" : ""}`; };
const OVERVIEW = "Direct2Hub is inventory software for Indian sellers. It tracks stock (what is on the shelf vs. already promised), orders, GST invoices, purchases, returns and reports, and it works on phones.";
const TOPICS: [RegExp, () => string][] = [
  [/^\s*(hi|hello|hey|hii+|namaste|good (morning|afternoon|evening))\b/i, () => `Hi! ${OVERVIEW} Ask me about features, pricing, GST or getting started.`],
  [/price|pricing|cost|plan|free|trial|subscription|how much|rupee|₹|paid|upgrade|yearly|monthly|discount/i, () => `Plans (prices before GST):\n${plan("FREE")}.\n${plan("GROWTH")}.\n${plan("SCALE")}.\nPay by Razorpay (UPI, cards, netbanking), Stripe card, direct UPI or bank transfer. Details: /pricing.`],
  [/gst|invoice|e-?way|credit note|tax|hsn/i, () => "Yes. It makes GST invoices and credit notes, and creates the e-way bill JSON file for the GST portal's bulk upload. You can also send customers a payment link through your own Razorpay account."],
  [/warehouse|location|transfer|godown|branch/i, () => `Yes, multiple warehouses and stock transfers between them. Free allows ${PLANS.FREE.locations}, Growth ${PLANS.GROWTH.locations}, Scale ${PLANS.SCALE.locations}.`],
  [/batch|expiry|serial|barcode|kit|bundle|variant|size|colou?r/i, () => "Yes: batch and expiry tracking, serial numbers, a barcode field, kits (bundles) and variants such as size and colour."],
  [/low.?stock|alert|reorder|restock|notification|run(ning)? out/i, () => "It watches each product's reorder level, emails you when stock runs low, and has a reorder suggestions report."],
  [/stock|inventory|ledger|reserv|available|shelf/i, () => "Every stock change is written to a ledger that is only added to, never edited. Orders reserve stock, so you can see what is on the shelf versus what is already promised."],
  [/order|dispatch|ship|deliver|track/i, () => "Orders go through confirm, dispatch and cancel, with stock reserved while they wait. You can add a carrier and tracking number, and the customer gets a shipped email."],
  [/purchase|supplier|vendor|grn|goods receipt|bill|payable/i, () => "Yes: purchase orders, goods receipts, supplier bills, and a payables aging report."],
  [/return|refund|inspect|damag/i, () => "Returns are supported with an inspection step, so good units go back to stock and damaged ones don't."],
  [/report|analytic|aging|summary|dashboard/i, () => "Reports include stock value, receivables and payables aging, GST summary and reorder suggestions, plus a dashboard."],
  [/api|webhook|integrat|shopify|razorpay|connect|zapier/i, () => "There is a REST API and webhooks, a Shopify connection, and invoice payment links through your own Razorpay account."],
  [/import|export|csv|excel|sheet|upload/i, () => "You can import products from CSV and export your data as CSV."],
  [/\bai\b|assistant|chatbot|gpt|describe|description/i, () => "The built-in assistant answers questions about your own stock, orders, customers and sales, and writes product descriptions. Product Intelligence explains each product's numbers."],
  [/mobile|phone|android|iphone|app\b|install|pwa/i, () => "It is a web app that works on phones, and you can add it to your home screen."],
  [/secur|privacy|safe|data|2fa|two.?step|password|backup/i, () => "Your data is kept separate per business, and sign-in supports two-step verification with an authenticator app. More in /privacy and /terms."],
  [/team|member|staff|role|user|permission/i, () => `You can invite team members with roles. Free allows ${PLANS.FREE.members}, Growth ${PLANS.GROWTH.members}, Scale ${PLANS.SCALE.members}.`],
  [/start|sign.?up|register|account|login|log in|verify|get started|begin|onboard/i, () => "Create an account at /register, verify your email, name your business and add your products. The Free plan needs no card."],
  [/contact|support|help|demo|human|talk|call|email|phone number/i, () => "Please use the contact form at /contact and the team will get back to you."],
  [/what|who|about|does|direct2hub|feature|do you|can i|can it/i, () => `${OVERVIEW} It also handles customers and price lists, kits, multiple warehouses, batch tracking, reports and low-stock alerts.`],
];
/** Always returns an answer for the website chat. */
export function siteAnswer(q: string): string {
  for (const [re, f] of TOPICS) if (re.test(q)) return f();
  return `${OVERVIEW} I can help with features, plans and pricing, GST invoices, warehouses, orders and getting started. For anything else, please use /contact.`;
}
const STOP = new Set("a an the of for to in on at is are was were do does did me my our show find get give list tell about details detail info information please can you what whats which how many much any all with and or product products item items stock available quantity price cost sku".split(" "));
const clean = (q: string) => q.toLowerCase().replace(/[^a-z0-9\s\-]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w)).join(" ").slice(0, 60);
const HELP = "I can look up your products and stock, low-stock items, orders (try \"order 12\" or \"pending orders\"), sales, customers, suppliers and unpaid invoices. For setup help, the menu has Products, Orders, Invoices, Purchases, Reports and Settings.";
/** Always returns an answer for the signed-in assistant, from the business's own data, with no AI. */
export async function assistantAnswer(q: string, c: AiCtx): Promise<string> {
  try {
    const t = q.toLowerCase(), num = /(?:order|#)\s*#?\s*(\d{1,9})/.exec(t)?.[1];
    if (num) { const o = (await runTool("order_details", { number: Number(num) }, c)) as any; return o.error ? `I couldn't find order ${num}.` : `Order ${o.number} for ${o.customer}: ${o.status}, payment ${o.payment}, total ${rs(o.total)}${o.tracking ? `, tracking ${o.tracking}${o.carrier ? ` (${o.carrier})` : ""}` : ""}.\n${o.lines.map((l: any) => `• ${l.name} (${l.sku}) × ${l.qty} at ${rs(l.unitPrice)}`).join("\n")}\nOpen it at ${o.page}.`; }
    if (/low.?stock|running (low|out)|restock|re-?order|about to run|shortage/.test(t)) { const r = (await runTool("low_stock", {}, c)) as any[]; return r.length ? `${r.length} product${r.length > 1 ? "s are" : " is"} at or below the reorder level:\n${r.map((p) => `• ${p.name} (${p.sku}): ${p.available} available, reorder at ${p.reorderAt}`).join("\n")}` : "Nothing is at or below its reorder level right now."; }
    if (/unpaid|overdue|outstanding|receivable|owe|pending (payment|invoice)|invoices? due/.test(t)) { if (!c.finance) return "Your role can't see invoices and payments. Ask the business owner or an accountant."; const r = (await runTool("unpaid_invoices", {}, c)) as any[]; return r.length ? `${r.length} unpaid invoice${r.length > 1 ? "s" : ""}, oldest due first:\n${r.map((i) => `• ${i.customer}: ${rs(i.due)} due ${i.dueOn} (${i.page})`).join("\n")}` : "All invoices are paid."; }
    if (/sales|revenue|sold|best.?sell|top (product|sell)|turnover|income/.test(t)) { const days = Number(/(\d{1,3})\s*days?/.exec(t)?.[1]) || (/week/.test(t) ? 7 : /year/.test(t) ? 365 : 30), r = (await runTool("sales_summary", { days }, c)) as any; return `Last ${r.days} days: ${r.orders} order${r.orders === 1 ? "" : "s"} dispatched or delivered, revenue ${rs(r.revenue)}.${r.topProducts?.length ? `\nBest sellers:\n${r.topProducts.map((p: any) => `• ${p.name} (${p.sku}): ${p.unitsSold} sold`).join("\n")}` : ""}`; }
    if (/\border|dispatch|deliver|cancel|confirm|draft|pending/.test(t)) { const st = /dispatch/.test(t) ? "DISPATCHED" : /deliver/.test(t) ? "DELIVERED" : /cancel/.test(t) ? "CANCELLED" : /draft/.test(t) ? "DRAFT" : /confirm|pending/.test(t) ? "CONFIRMED" : "", r = (await runTool("recent_orders", { status: st }, c)) as any[]; return r.length ? `Latest ${st ? st.toLowerCase() + " " : ""}orders:\n${r.map((o) => `• #${o.number} ${o.customer}: ${o.status}, ${rs(o.total)}, ${o.date}`).join("\n")}` : `No ${st ? st.toLowerCase() + " " : ""}orders found.`; }
    if (/customer|client|buyer/.test(t)) { const r = (await runTool("find_customers", { query: clean(q.replace(/customers?|clients?|buyers?/gi, "")) }, c)) as any[]; return r.length ? `Customers:\n${r.map((x) => `• ${x.name}${x.phone ? `, ${x.phone}` : ""}${x.email ? `, ${x.email}` : ""}`).join("\n")}` : "I couldn't find a matching customer."; }
    if (/supplier|vendor/.test(t)) { const r = (await runTool("find_suppliers", { query: clean(q.replace(/suppliers?|vendors?/gi, "")) }, c)) as any[]; return r.length ? `Suppliers:\n${r.map((x) => `• ${x.name}${x.phone ? `, ${x.phone}` : ""}${x.email ? `, ${x.email}` : ""}`).join("\n")}` : "I couldn't find a matching supplier."; }
    if (/summary|overview|total|how many products|stock value|out of stock|worth|catalog/.test(t)) { const r = (await runTool("catalog_summary", {}, c)) as any; return `You have ${r.products} products with ${r.unitsSellable.toLocaleString("en-IN")} units in stock, worth ${rs(r.stockValueAtCost)} at cost. ${r.outOfStock} ${r.outOfStock === 1 ? "is" : "are"} out of stock.`; }
    if (/how (do|to|can)|where|help|what can|guide|setup|set up/.test(t)) return HELP;
    const query = clean(q);
    if (query) { const r = (await runTool("search_products", { query }, c)) as any[]; if (r.length) return `${r.length === 1 ? "Found 1 product" : `Found ${r.length} products`}:\n${r.map((p) => `• ${p.name} (${p.sku}): ${p.available} ${p.unit} available${p.reserved ? ` (${p.reserved} reserved)` : ""}, price ${rs(p.price)}${p.available <= p.reorderAt ? ", low on stock" : ""}`).join("\n")}`; }
    if (/\b(how|doing|going|status|business|profit|growth|performance|today|week|month)\b/.test(t)) {
      const s = (await runTool("catalog_summary", {}, c)) as any, sl = (await runTool("sales_summary", { days: 30 }, c)) as any, lo = (await runTool("low_stock", {}, c)) as any[];
      return `Your business right now:\n• ${s.products} products, ${s.unitsSellable.toLocaleString("en-IN")} units in stock (${rs(s.stockValueAtCost)} at cost), ${s.outOfStock} out of stock.\n• Last 30 days: ${sl.orders} order${sl.orders === 1 ? "" : "s"} dispatched or delivered, revenue ${rs(sl.revenue)}.\n• ${lo.length ? `${lo.length} product${lo.length > 1 ? "s" : ""} at or below the reorder level.` : "Nothing is below its reorder level."}`;
    }
    return HELP;
  } catch { return `${HELP} I couldn't read your data just now, so please try again in a moment.`; }
}
