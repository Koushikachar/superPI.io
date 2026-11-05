"use server";
import { redirect } from "next/navigation"; import { db } from "@/lib/db"; import { ctx } from "@/lib/ctx"; import { emailInvoicePdf, emailPurchaseOrderPdf, emailPlanInvoice } from "@/lib/docmail"; import { invNo } from "@/lib/gst"; import { poNo } from "@/lib/documents";
const go = (p: string, k: "e" | "ok", m: string): never => redirect(`${p}${p.includes("?") ? "&" : "?"}${k}=${encodeURIComponent(m)}`);
/** At most 20 document emails per person per hour, so the buttons can't be used to spam anyone. */
async function limited(orgId: string, actorId: string) { return (await db.auditLog.count({ where: { orgId, actorId, action: { in: ["doc.emailed"] }, createdAt: { gt: new Date(Date.now() - 3600_000) } } })) >= 20; }
async function note(orgId: string, actorId: string, detail: Record<string, string>) { await db.auditLog.create({ data: { orgId, actorId, action: "doc.emailed", detail } }).catch(() => null); }
/** "Email PDF to customer" on an invoice: the tax invoice PDF (or the paid invoice, once fully paid). */
export async function emailInvoice(fd: FormData) {
  const id = String(fd.get("invoiceId") ?? ""), back = `/invoices/${id}`, c = await ctx(); if (!["OWNER", "ACCOUNTANT", "ORDER_STAFF"].includes(c.role)) go(back, "e", "You don't have permission to do that");
  if (await limited(c.orgId, c.user.id)) go(back, "e", "Too many emails sent in the last hour. Try again later");
  const inv = await db.invoice.findFirst({ where: { id, orgId: c.orgId }, select: { number: true } }); if (!inv) go(back, "e", "Invoice not found");
  const r = await emailInvoicePdf(c.orgId, id); if (!r.ok) go(back, "e", r.error ?? "The email couldn't be sent");
  await note(c.orgId, c.user.id, { doc: invNo(inv!.number), to: r.to?.[0] ?? "" }); go(back, "ok", `Invoice PDF emailed to ${r.to?.[0]}`);
}
/** "Email PO to supplier" on the Purchases page. */
export async function emailPurchaseOrder(fd: FormData) {
  const id = String(fd.get("poId") ?? ""), back = "/purchases", c = await ctx(); if (!["OWNER", "INVENTORY_MANAGER", "ACCOUNTANT"].includes(c.role)) go(back, "e", "You don't have permission to do that");
  if (await limited(c.orgId, c.user.id)) go(back, "e", "Too many emails sent in the last hour. Try again later");
  const r = await emailPurchaseOrderPdf(c.orgId, id); if (!r.ok) go(back, "e", r.error ?? "The email couldn't be sent");
  await note(c.orgId, c.user.id, { doc: poNo(id), to: r.to?.[0] ?? "" }); go(back, "ok", `Purchase order PDF emailed to ${r.to?.[0]}`);
}
/** "Email me this invoice" on a plan receipt: sends the plan's tax invoice PDF to the signed-in person. */
export async function resendPlanInvoice(fd: FormData) {
  const id = String(fd.get("paymentId") ?? ""), back = `/subscription/receipt/${id}`, c = await ctx(); if (!["OWNER", "ACCOUNTANT"].includes(c.role)) go(back, "e", "Only the owner or accountant can do that");
  if (await limited(c.orgId, c.user.id)) go(back, "e", "Too many emails sent in the last hour. Try again later");
  const p = await db.subscriptionPayment.findFirst({ where: { id, orgId: c.orgId, status: "PAID" }, select: { id: true } }); if (!p) go(back, "e", "Payment not found");
  const r = await emailPlanInvoice(id, [c.user.email]); if (!r.ok) go(back, "e", r.error ?? "The email couldn't be sent");
  await note(c.orgId, c.user.id, { doc: "plan-invoice", to: c.user.email }); go(back, "ok", `Invoice PDF emailed to ${c.user.email}`);
}
