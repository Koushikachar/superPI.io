/** Direct2Hub email design: ONE branded layout used by every email the app sends (low stock, invitations, shipping,
 *  payment reminders, renewals, contact form, automations) and by the Supabase sign-up / reset emails
 *  (see scripts/build-auth-emails.ts and supabase/email-templates/).
 *  Email-safe on purpose: tables + inline styles, no images (so nothing is blocked), the "D2" badge is plain HTML.
 *  Every dynamic value goes through esc(); links only ever allow http(s) (or a {{ .Placeholder }} for Supabase). */

export const C = { ink: "#0E1B2B", brand: "#0F766E", brandDark: "#0B5A54", teal: "#14B8A6", turmeric: "#F0A202", mist: "#EEF3F6", danger: "#C2410C", text: "#334155", muted: "#64748B", line: "#E2E8F0", soft: "#F8FAFC" } as const;
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
const site = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
/** Only http(s) links (or a Supabase {{ .Placeholder }}) may become an href: never javascript: or data: */
const hrefOf = (u?: string | null) => /^\{\{\s*\.[A-Za-z]+\s*\}\}$/.test(u ?? "") ? (u as string) : /^https?:\/\//i.test(u ?? "") ? esc(u) : "";
const rawOrEsc = (s: string) => /^\{\{\s*\.[A-Za-z]+\s*\}\}$/.test(s) ? s : esc(s);
export const inr = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const roleLabel = (r: string) => r.replace(/_/g, " ").toLowerCase();

// ---- building blocks ------------------------------------------------------------------------------------------
export const para = (html: string) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:${C.text};">${html}</p>`;

export function button(label: string, url: string) {
  const href = hrefOf(url); if (!href) return "";
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0 8px;"><tr><td align="center" bgcolor="${C.brand}" style="border-radius:12px;background-color:${C.brand};background-image:linear-gradient(180deg,#14B8A6 0%,#0F766E 100%);box-shadow:0 6px 16px rgba(15,118,110,.35);"><a href="${href}" target="_blank" style="display:inline-block;padding:15px 32px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">${esc(label)}</a></td></tr></table>`;
}
export function pill(text: string, tone: "ok" | "warn" | "danger" | "info" = "info") {
  const t = { ok: ["#CCFBF1", "#0B5A54"], warn: ["#FEF3C7", "#92400E"], danger: ["#FFEDD5", "#9A3412"], info: ["#E0F2FE", "#075985"] }[tone];
  return `<span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${t[0]};color:${t[1]};font-size:11px;font-weight:800;letter-spacing:.8px;text-transform:uppercase;white-space:nowrap;">${esc(text)}</span>`;
}
/** A grey label/value card. Values are HTML: escape them with esc() before passing them in. */
export function infoCard(rows: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px;background:${C.soft};border:1px solid ${C.line};border-radius:14px;">${rows.map(([k, v], i) => `<tr><td style="padding:12px 18px;${i ? `border-top:1px solid ${C.line};` : ""}font-size:12px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:${C.muted};">${esc(k)}</td><td align="right" style="padding:12px 18px;${i ? `border-top:1px solid ${C.line};` : ""}font-size:15px;font-weight:700;color:${C.ink};">${v}</td></tr>`).join("")}</table>`;
}
/** The big verification code. `code` can be a Supabase {{ .Token }} placeholder. */
export function codeBox(code: string, caption = "Or type this code") {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 8px;"><tr><td align="center" style="background:#F0FDFA;border:2px dashed #5EEAD4;border-radius:16px;padding:18px 12px;"><div style="font-size:12px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:${C.brandDark};margin-bottom:8px;">${esc(caption)}</div><div style="font-family:'SF Mono',Menlo,Consolas,'Courier New',monospace;font-size:30px;font-weight:800;letter-spacing:6px;color:${C.ink};">${rawOrEsc(code)}</div></td></tr></table>`;
}
/** A big number with a caption (amounts due, counts). */
export function bigNumber(value: string, caption: string, tone: "brand" | "danger" = "brand") {
  const col = tone === "danger" ? C.danger : C.brand, bg = tone === "danger" ? "#FFF7ED" : "#F0FDFA", bd = tone === "danger" ? "#FED7AA" : "#99F6E4";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px;"><tr><td align="center" style="background:${bg};border:1px solid ${bd};border-radius:16px;padding:22px 12px;"><div style="font-size:38px;line-height:1.1;font-weight:800;letter-spacing:-1px;color:${col};">${esc(value)}</div><div style="margin-top:6px;font-size:13px;font-weight:600;color:${C.muted};">${esc(caption)}</div></td></tr></table>`;
}
export const quote = (html: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 20px;"><tr><td style="border-left:4px solid ${C.teal};background:${C.soft};border-radius:0 12px 12px 0;padding:14px 18px;font-size:15px;line-height:1.65;color:${C.ink};white-space:pre-wrap;">${html}</td></tr></table>`;
export const small = (html: string) => `<p style="margin:18px 0 0;font-size:13px;line-height:1.6;color:${C.muted};">${html}</p>`;

// ---- the layout -----------------------------------------------------------------------------------------------
export type Layout = { preheader?: string; eyebrow?: string; eyebrowTone?: "ok" | "warn" | "danger" | "info"; title: string; body: string; cta?: { label: string; url: string }; after?: string; footer?: string; from?: string };
export function emailLayout(o: Layout): string {
  const pre = o.preheader ? `<div class="preheader" style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${esc(o.preheader)}${"&zwnj;&nbsp;".repeat(60)}</div>` : "";
  const base = site(), company = process.env.NEXT_PUBLIC_COMPANY_NAME, addr = process.env.NEXT_PUBLIC_COMPANY_ADDRESS;
  const legal = [company, addr].filter(Boolean).map(esc).join(" · ");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only"><title>${esc(o.title)}</title>
<style>@media only screen and (max-width:620px){.wrap{width:100%!important}.px{padding-left:22px!important;padding-right:22px!important}.h1{font-size:25px!important}}</style></head>
<body style="margin:0;padding:0;background:${C.mist};font-family:${FONT};-webkit-text-size-adjust:100%;">${pre}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.mist};"><tr><td align="center" style="padding:32px 12px 40px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border:1px solid #DCE6EB;border-radius:24px;overflow:hidden;box-shadow:0 18px 48px rgba(14,27,43,.12);">
<tr><td class="px" style="background-color:${C.brand};background-image:linear-gradient(135deg,#14B8A6 0%,#0F766E 48%,#0E1B2B 100%);padding:26px 36px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="44" height="44" align="center" style="width:44px;height:44px;border-radius:12px;background:${C.ink};color:${C.turmeric};font-family:${FONT};font-size:20px;font-weight:800;line-height:44px;">D2</td><td style="padding-left:12px;font-family:${FONT};font-size:22px;font-weight:800;letter-spacing:-.3px;color:#ffffff;">Direct2Hub</td></tr></table></td>
${o.from ? `<td align="right" style="font-family:${FONT};font-size:13px;font-weight:600;color:rgba(255,255,255,.88);">${esc(o.from)}</td>` : ""}</tr></table></td></tr>
<tr><td style="height:4px;line-height:4px;font-size:0;background:${C.turmeric};">&nbsp;</td></tr>
<tr><td class="px" style="padding:36px 36px 30px;font-family:${FONT};">
${o.eyebrow ? `<div style="margin-bottom:14px;">${pill(o.eyebrow, o.eyebrowTone ?? "ok")}</div>` : ""}
<h1 class="h1" style="margin:0 0 18px;font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-.6px;color:${C.ink};">${esc(o.title)}</h1>
${o.body}${o.cta ? button(o.cta.label, o.cta.url) : ""}${o.after ?? ""}
</td></tr>
<tr><td class="px" style="background:${C.soft};border-top:1px solid ${C.line};padding:22px 36px 26px;font-family:${FONT};font-size:12.5px;line-height:1.7;color:${C.muted};">
${o.footer ? `<div style="margin-bottom:10px;">${o.footer}</div>` : ""}<div><b style="color:${C.ink};">Direct2Hub</b> · Inventory, orders and GST invoices for Indian sellers</div>
${base ? `<div><a href="${esc(base)}" style="color:${C.brand};text-decoration:none;font-weight:600;">${esc(base.replace(/^https?:\/\//, ""))}</a></div>` : ""}${legal ? `<div>${legal}</div>` : ""}
</td></tr></table></td></tr></table></body></html>`;
}

// ---- the emails the app sends ---------------------------------------------------------------------------------
type Low = { id: string; name: string; avail: number; reorderAt: number };
export function lowStockEmail(a: { org: string; items: Low[] }): string {
  const base = site(), shown = a.items.slice(0, 20), out = a.items.filter((i) => i.avail <= 0).length, low = a.items.length - out;
  const tile = (n: number, label: string, col: string, bg: string, pad: string) => `<td width="50%" style="padding:${pad};"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background:${bg};border-radius:14px;padding:16px 8px;"><div style="font-size:32px;font-weight:800;line-height:1.1;color:${col};">${n}</div><div style="margin-top:4px;font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${col};">${label}</div></td></tr></table></td>`;
  const row = (i: Low) => {
    const gone = i.avail <= 0, pct = gone ? 0 : Math.max(6, Math.min(100, Math.round((i.avail / Math.max(i.reorderAt, 1)) * 100))), col = gone ? C.danger : C.turmeric;
    return `<tr><td style="padding:0 0 10px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.line};border-radius:14px;background:#ffffff;"><tr><td style="padding:14px 16px 6px;font-size:15px;font-weight:700;color:${C.ink};"><a href="${esc(`${base}/products/${i.id}`)}" style="color:${C.ink};text-decoration:none;">${esc(i.name)}</a></td><td align="right" style="padding:14px 16px 6px;">${pill(gone ? "Out of stock" : "Low stock", gone ? "danger" : "warn")}</td></tr>
<tr><td colspan="2" style="padding:4px 16px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${pct ? `<td width="${pct}%" height="8" style="height:8px;line-height:8px;font-size:0;background:${col};border-radius:4px;">&nbsp;</td>` : ""}<td height="8" style="height:8px;line-height:8px;font-size:0;background:${C.line};border-radius:4px;">&nbsp;</td></tr></table>
<div style="margin-top:7px;font-size:13px;color:${C.muted};">${gone ? "<b style=\"color:" + C.danger + ";\">None available</b>" : `<b style="color:${C.ink};">${i.avail}</b> available`} · reorder at <b style="color:${C.ink};">${i.reorderAt}</b></div></td></tr></table></td></tr>`;
  };
  return emailLayout({
    preheader: out ? `${out} out of stock${low ? `, ${low} running low` : ""} at ${a.org}` : `${low} running low at ${a.org}`, eyebrow: "Stock alert", eyebrowTone: out ? "danger" : "warn",
    title: a.items.length === 1 ? `${a.items[0].name} needs restocking` : `${a.items.length} products need restocking`,
    body: `${para(`These products at <b>${esc(a.org)}</b> have dropped to or below their reorder level. Restock soon so you don't lose sales.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;"><tr>${tile(out, "Out of stock", C.danger, "#FFF1E6", "0 6px 0 0")}${tile(low, "Running low", "#B45309", "#FEF6DC", "0 0 0 6px")}</tr></table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${shown.map(row).join("")}</table>${a.items.length > shown.length ? small(`…and ${a.items.length - shown.length} more.`) : ""}<div style="height:8px;"></div>`,
    cta: { label: "Create a purchase order", url: `${base}/purchases` },
    footer: `You get this because you're an owner or inventory manager of ${esc(a.org)}. <a href="${esc(base)}/settings" style="color:${C.brand};font-weight:600;">Switch low-stock emails off in Settings</a>.`,
  });
}
export function inviteEmail(a: { org: string; role: string; email: string; link: string }): string {
  return emailLayout({
    preheader: `You've been invited to ${a.org} on Direct2Hub`, eyebrow: "You're invited", title: `Join ${a.org} on Direct2Hub`,
    body: `${para(`You've been invited to work with <b>${esc(a.org)}</b> on Direct2Hub: stock, orders and GST invoices in one place.`)}${infoCard([["Business", esc(a.org)], ["Your role", esc(roleLabel(a.role))], ["Invitation valid for", "7 days"]])}`,
    cta: { label: "Accept invitation", url: a.link },
    footer: `Sign in or create your account with <b>${esc(a.email)}</b>, the address this invitation was sent to, then open the link again. Not expecting this? You can ignore the email.`,
  });
}
export function shippedEmail(a: { org: string; customer: string; number: number | string; carrier: string; trackingNo?: string | null; trackingUrl?: string | null }): string {
  return emailLayout({
    from: a.org, preheader: `Order #${a.number} is on its way with ${a.carrier}`, eyebrow: "On its way", title: `Your order #${a.number} has shipped`,
    body: `${para(`Hello ${esc(a.customer)}, good news: your order is on its way.`)}${infoCard([["Order", `#${esc(a.number)}`], ["Carrier", esc(a.carrier)], ...(a.trackingNo ? [["Tracking no.", esc(a.trackingNo)] as [string, string]] : [])])}`,
    cta: a.trackingUrl ? { label: "Track your parcel", url: a.trackingUrl } : undefined,
    footer: `Thank you for ordering from <b>${esc(a.org)}</b>.`,
  });
}
export function reminderEmail(a: { org: string; customer: string; invoice: string; leftPaise: number; due: string; late: boolean }): string {
  return emailLayout({
    from: a.org, preheader: `${inr(a.leftPaise)} ${a.late ? "overdue" : "due"} on invoice ${a.invoice}`, eyebrow: a.late ? "Overdue" : "Payment reminder", eyebrowTone: a.late ? "danger" : "warn",
    title: `Invoice ${a.invoice} has a balance due`,
    body: `${para(`Hello ${esc(a.customer)}, this is a ${a.late ? "reminder that" : "friendly note that"} an invoice from <b>${esc(a.org)}</b> ${a.late ? "is now overdue" : "is coming due"}.`)}${bigNumber(inr(a.leftPaise), `Balance on invoice ${a.invoice}`, a.late ? "danger" : "brand")}${infoCard([["Invoice", esc(a.invoice)], ["Due on", esc(a.due) + (a.late ? " (overdue)" : "")]])}${small("If you have already paid, please ignore this message.")}`,
    footer: `Thank you,<br><b>${esc(a.org)}</b>`,
  });
}
export function payLinkEmail(a: { org: string; customer: string; invoice: string; amountPaise: number; url: string }): string {
  return emailLayout({
    from: a.org, preheader: `Pay ${inr(a.amountPaise)} for invoice ${a.invoice} online`, eyebrow: "Pay online", title: `Pay invoice ${a.invoice}`,
    body: `${para(`Hello ${esc(a.customer)}, you can pay your invoice from <b>${esc(a.org)}</b> online in a minute, using UPI, card or netbanking.`)}${bigNumber(inr(a.amountPaise), `Invoice ${a.invoice}`)}`,
    cta: { label: "Pay now", url: a.url }, footer: `Thank you,<br><b>${esc(a.org)}</b>`,
  });
}
export function renewalEmail(a: { org: string; plan: string; when: string; graceDays: number }): string {
  return emailLayout({
    preheader: `Renew to keep your ${a.plan} limits`, eyebrow: "Plan ending soon", eyebrowTone: "warn", title: `Your ${a.plan} plan ends on ${a.when}`,
    body: `${para(`The <b>${esc(a.plan)}</b> plan for <b>${esc(a.org)}</b> ends on <b>${esc(a.when)}</b>. After a ${a.graceDays}-day grace period your account returns to the Free plan limits. <b>Your data is always kept.</b>`)}${infoCard([["Business", esc(a.org)], ["Plan", esc(a.plan)], ["Ends on", esc(a.when)], ["Grace period", `${a.graceDays} days`]])}`,
    cta: { label: "Renew now", url: `${site()}/subscription` },
  });
}
export function invoiceDocEmail(a: { org: string; customer: string; invoice: string; totalPaise: number; leftPaise: number; due: string; payUrl?: string | null }): string {
  const paid = a.leftPaise <= 0;
  return emailLayout({
    from: a.org, preheader: paid ? `Payment received for invoice ${a.invoice}. Your paid invoice (PDF) is attached.` : `Invoice ${a.invoice} for ${inr(a.totalPaise)} (PDF attached)`, eyebrow: paid ? "Payment received" : "Tax invoice", eyebrowTone: paid ? "ok" : "info",
    title: paid ? `Thank you! Invoice ${a.invoice} is paid` : `Invoice ${a.invoice} from ${a.org}`,
    body: `${para(`Hello ${esc(a.customer)}, ${paid ? `we have received your payment. Your paid tax invoice from <b>${esc(a.org)}</b> is attached as a PDF.` : `your tax invoice from <b>${esc(a.org)}</b> is attached as a PDF.`}`)}${bigNumber(inr(paid ? a.totalPaise : a.leftPaise), paid ? `Total paid, invoice ${a.invoice}` : `Balance due on invoice ${a.invoice}`)}${infoCard([["Invoice", esc(a.invoice)], ["Invoice total", inr(a.totalPaise)], ["Balance due", inr(Math.max(0, a.leftPaise))], ...(paid ? [] : [["Due on", esc(a.due)] as [string, string]])])}${small("The PDF is attached to this email. Please keep it for your GST records.")}`,
    ...(!paid && a.payUrl ? { cta: { label: "Pay online", url: a.payUrl } } : {}), footer: `Thank you,<br><b>${esc(a.org)}</b>`,
  });
}
export function planInvoiceEmail(a: { org: string; plan: string; invoice: string; totalPaise: number; until: string; taxed: boolean }): string {
  return emailLayout({
    preheader: `Payment received. Your ${a.plan} plan invoice (PDF) is attached.`, eyebrow: "Payment received", title: `Your ${a.plan} plan is active`,
    body: `${para(`Thank you! We have received your payment for <b>${esc(a.org)}</b>. Your ${a.taxed ? "GST tax invoice" : "payment receipt"} is attached as a PDF.`)}${bigNumber(inr(a.totalPaise), `Paid, ${a.invoice}`)}${infoCard([["Invoice no.", esc(a.invoice)], ["Plan", esc(a.plan)], ["Amount paid", inr(a.totalPaise)], ["Active until", esc(a.until)]])}${small("Keep the attached PDF for your accounts. You can download it again any time from Plan and billing in the app.")}`,
    cta: { label: "View my plan", url: `${site()}/subscription` },
  });
}
export function poEmail(a: { org: string; supplier: string; po: string; totalPaise: number; expected?: string | null }): string {
  return emailLayout({
    from: a.org, preheader: `Purchase order ${a.po} from ${a.org} (PDF attached)`, eyebrow: "Purchase order", title: `Purchase order ${a.po}`,
    body: `${para(`Hello ${esc(a.supplier)}, please find our purchase order attached as a PDF. Kindly confirm the order${a.expected ? ` and delivery by <b>${esc(a.expected)}</b>` : ""}.`)}${infoCard([["Purchase order", esc(a.po)], ["Estimated total (with GST)", inr(a.totalPaise)], ...(a.expected ? [["Expected by", esc(a.expected)] as [string, string]] : [])])}`,
    footer: `Thank you,<br><b>${esc(a.org)}</b>`,
  });
}
export function contactEmail(a: { name: string; email: string; phone?: string | null; message: string }): string {
  return emailLayout({
    preheader: a.message.slice(0, 90), eyebrow: "New message", eyebrowTone: "info", title: `Message from ${a.name}`,
    body: `${infoCard([["Name", esc(a.name)], ["Email", `<a href="mailto:${esc(a.email)}" style="color:${C.brand};text-decoration:none;">${esc(a.email)}</a>`], ...(a.phone ? [["Phone", esc(a.phone)] as [string, string]] : [])])}${quote(esc(a.message))}`,
    footer: "Just hit reply: your answer goes straight to them.",
  });
}
export function automationEmail(a: { rule: string; text: string }): string {
  return emailLayout({
    preheader: a.text.slice(0, 90), eyebrow: "Automation", eyebrowTone: "info", title: a.rule, body: quote(esc(a.text)),
    cta: { label: "Open Direct2Hub", url: `${site()}/automations` }, footer: "Sent by an automation rule in your Direct2Hub account.",
  });
}

// ---- Supabase sign-in emails (pasted into the Supabase dashboard; see supabase/email-templates/README.md) ----------
export const AUTH_EMAILS: { file: string; subject: string; html: string }[] = [
  { file: "confirm-signup", subject: "Confirm your Direct2Hub email", html: emailLayout({
    preheader: "Your Direct2Hub verification code is inside", eyebrow: "Welcome", title: "Confirm your email",
    body: `${para("You're one step from running your stock, orders and GST invoices on Direct2Hub. Type this code on the sign-up screen, or tap the button.")}${codeBox("{{ .Token }}", "Your 6-digit code")}`,
    cta: { label: "Confirm my email", url: "{{ .ConfirmationURL }}" },
    after: small("The code works for one hour. Never share it with anyone."), footer: "If you didn't create a Direct2Hub account, you can safely ignore this email." }) },
  { file: "reset-password", subject: "Reset your Direct2Hub password", html: emailLayout({
    preheader: "Choose a new password for your Direct2Hub account", eyebrow: "Password reset", eyebrowTone: "warn", title: "Reset your password",
    body: para("We got a request to reset the password for your Direct2Hub account. Tap the button to choose a new one."),
    cta: { label: "Choose a new password", url: "{{ .ConfirmationURL }}" },
    footer: "Didn't ask for this? Ignore this email and your password stays exactly as it is." }) },
  { file: "magic-link", subject: "Your Direct2Hub sign-in link", html: emailLayout({
    preheader: "Tap to sign in to Direct2Hub", eyebrow: "Sign in", title: "Sign in to Direct2Hub",
    body: para("Tap the button to sign in. The link works once and expires soon."),
    cta: { label: "Sign me in", url: "{{ .ConfirmationURL }}" },
    after: codeBox("{{ .Token }}", "Or type this code"), footer: "If you didn't try to sign in, ignore this email." }) },
  { file: "change-email", subject: "Confirm your new Direct2Hub email", html: emailLayout({
    preheader: "Confirm the change of your Direct2Hub email", eyebrow: "Email change", eyebrowTone: "warn", title: "Confirm your new email",
    body: para("Confirm that <b>{{ .NewEmail }}</b> is your new Direct2Hub email address."),
    cta: { label: "Confirm new email", url: "{{ .ConfirmationURL }}" },
    footer: "Didn't request this change? Ignore this email and your account stays as it is." }) },
  { file: "reauthentication", subject: "Your Direct2Hub security code", html: emailLayout({
    preheader: "Your one-time security code", eyebrow: "Security check", eyebrowTone: "warn", title: "Confirm it's you",
    body: para("Enter this code to confirm the sensitive change you're making."), after: codeBox("{{ .Token }}", "Your security code"),
    footer: "If this wasn't you, don't share the code and consider changing your password." }) },
];
