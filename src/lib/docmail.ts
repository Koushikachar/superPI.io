import { db } from "./db"; import { sendMail } from "./mail"; import { buildDocument, poNo } from "./documents"; import { invNo } from "./gst"; import { PLANS } from "./plans"; import { invoiceDocEmail, planInvoiceEmail, poEmail } from "./emailTemplate";
/** Emails a PDF document. Nothing here throws: the caller gets { ok, error, to } so a mail problem never undoes a payment. */
type Res = { ok: boolean; error?: string; to?: string[] };
const paise = (x: unknown) => Math.round(Number(x ?? 0) * 100), day = (d: Date | null | undefined) => (d ? d.toLocaleDateString("en-IN") : "");
/** Who bought the plan: the signed-in person who paid. For automatic renewals (no person), the business owners. */
async function purchasers(orgId: string, actorId: string): Promise<string[]> {
  const who = await db.user.findFirst({ where: { OR: [{ id: actorId }, { authId: actorId }] }, select: { email: true } }); if (who?.email) return [who.email];
  const owners = await db.membership.findMany({ where: { orgId, role: "OWNER" }, select: { user: { select: { email: true } } }, take: 5 }); return [...new Set(owners.map((m) => m.user.email).filter(Boolean))];
}
/** After a plan payment: the GST tax invoice PDF goes to whoever purchased the plan. */
export async function emailPlanInvoice(paymentId: string, to?: string[]): Promise<Res> {
  try {
    const p = await db.subscriptionPayment.findFirst({ where: { id: paymentId, status: "PAID" } }); if (!p) return { ok: false, error: "Payment not found" };
    const [org, doc] = await Promise.all([db.organization.findUnique({ where: { id: p.orgId } }), buildDocument("receipt", p.orgId, paymentId)]); if (!org || !doc) return { ok: false, error: "Couldn't build the invoice" };
    const list = to?.length ? to : await purchasers(p.orgId, p.actorId); if (!list.length) return { ok: false, error: "No email address to send to" };
    const html = planInvoiceEmail({ org: org.name, plan: PLANS[p.plan]?.label ?? p.plan, invoice: doc.number, totalPaise: p.total, until: day(p.periodEnd), taxed: p.taxPercent > 0 });
    let last = "", sent: string[] = []; for (const e of list.slice(0, 5)) { const r = await sendMail({ to: e, subject: `Your Direct2Hub ${p.taxPercent > 0 ? "tax invoice" : "receipt"} ${doc.number}`, html, attachments: [{ filename: doc.filename, content: doc.bytes }] }); if (r.ok) sent.push(e); else last = r.error; }
    return sent.length ? { ok: true, to: sent } : { ok: false, error: last || "The email couldn't be sent" };
  } catch (e: any) { console.error("plan invoice email failed", e?.message); return { ok: false, error: "The email couldn't be sent" }; }
}
/** The customer's invoice PDF. When the invoice is fully paid the email says so ("paid invoice"); otherwise it carries a Pay online button if a link exists. */
export async function emailInvoicePdf(orgId: string, invoiceId: string): Promise<Res> {
  try {
    const inv = await db.invoice.findFirst({ where: { id: invoiceId, orgId }, include: { payments: { select: { amount: true } }, creditNotes: { select: { total: true } }, order: { select: { customerRec: { select: { email: true } } } } } }); if (!inv) return { ok: false, error: "Invoice not found" };
    const to = inv.order.customerRec?.email; if (!to) return { ok: false, error: "This customer has no email address. Add one on the Customers page." };
    const [org, doc, link] = await Promise.all([db.organization.findUnique({ where: { id: orgId } }), buildDocument("invoice", orgId, invoiceId), db.invoicePayLink.findFirst({ where: { orgId, invoiceId, status: "CREATED" }, orderBy: { createdAt: "desc" }, select: { url: true } })]); if (!org || !doc) return { ok: false, error: "Couldn't build the invoice" };
    const net = paise(inv.total) - inv.creditNotes.reduce((t, n) => t + paise(n.total), 0), left = net - inv.payments.reduce((t, p) => t + paise(p.amount), 0), paid = left <= 0;
    const r = await sendMail({ to, subject: paid ? `Paid invoice ${doc.number} from ${org.name}` : `Invoice ${doc.number} from ${org.name}`, html: invoiceDocEmail({ org: org.name, customer: inv.customerName, invoice: doc.number, totalPaise: net, leftPaise: left, due: day(inv.dueOn), payUrl: link?.url }), attachments: [{ filename: doc.filename, content: doc.bytes }] });
    return r.ok ? { ok: true, to: [to] } : { ok: false, error: r.error };
  } catch (e: any) { console.error("invoice email failed", e?.message); return { ok: false, error: "The email couldn't be sent" }; }
}
export async function emailPurchaseOrderPdf(orgId: string, poId: string): Promise<Res> {
  try {
    const po = await db.purchaseOrder.findFirst({ where: { id: poId, orgId }, include: { supplier: true } }); if (!po) return { ok: false, error: "Purchase order not found" };
    if (!po.supplier.email) return { ok: false, error: "This supplier has no email address" };
    const [org, doc] = await Promise.all([db.organization.findUnique({ where: { id: orgId } }), buildDocument("purchase-order", orgId, poId)]); if (!org || !doc) return { ok: false, error: "Couldn't build the purchase order" };
    const lines = await db.purchaseOrderLine.findMany({ where: { poId }, select: { qty: true, unitCost: true, productId: true } }), tr = await db.product.findMany({ where: { orgId, id: { in: lines.map((l) => l.productId) } }, select: { id: true, taxRate: true } }), rate = new Map(tr.map((t) => [t.id, t.taxRate]));
    const total = lines.reduce((t, l) => { const x = Math.round(l.qty * Number(l.unitCost) * 100); return t + x + Math.round((x * (rate.get(l.productId) ?? 0)) / 100); }, 0);
    const r = await sendMail({ to: po.supplier.email, subject: `Purchase order ${poNo(poId)} from ${org.name}`, html: poEmail({ org: org.name, supplier: po.supplier.name, po: poNo(poId), totalPaise: total, expected: day(po.expectedOn) || null }), attachments: [{ filename: doc.filename, content: doc.bytes }] });
    return r.ok ? { ok: true, to: [po.supplier.email] } : { ok: false, error: r.error };
  } catch (e: any) { console.error("purchase order email failed", e?.message); return { ok: false, error: "The email couldn't be sent" }; }
}
export { invNo };
