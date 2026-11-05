import { pageMeta } from "@/lib/seo"; import Legal, { H } from "@/components/Legal"; import { LEGAL } from "@/lib/legal"; import { PLANS } from "@/lib/plans";
export const metadata = pageMeta({ title: "Terms & conditions", description: "The terms for using Direct2Hub: your account, acceptable use, plans and payments, data ownership and how we handle problems.", path: "/terms" });
const ul = "list-disc space-y-1 pl-5";
export default function Terms() {
  return <Legal title="Terms & conditions" path="/terms">
    <p>By creating an account or using Direct2Hub you agree to these terms with {LEGAL.company}. If you use it for a business, you confirm you may bind that business. Please also read our Privacy policy.</p>
    <H>1. Your account</H>
    <ul className={ul}><li>You must verify your email address and keep your sign-in details secret. You are responsible for activity under your account and for the people you invite.</li><li>Organization owners decide each team member's role. Give people only the access they need.</li><li>Tell us promptly if you think your account has been misused.</li></ul>
    <H>2. Your data</H>
    <p>You own the business data you enter. You give us permission to store and process it only to provide and secure the service. You are responsible for its accuracy and for having the right to enter it, including any customer or supplier details. Sample data is labelled "Demo" and can be removed at any time.</p>
    <H>3. Acceptable use</H>
    <ul className={ul}><li>Do not try to access another organization's data, bypass limits or security, or probe the service for weaknesses without our written permission.</li><li>Do not upload malware, overload the service, or use it for unlawful activity.</li><li>Do not share an account in a way that defeats plan limits.</li></ul>
    <H>4. Plans and limits</H>
    <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b border-ink/20"><th className="py-2 pr-3">Plan</th><th className="pr-3">Active products</th><th>Team members (incl. pending invitations)</th></tr></thead><tbody>
      {Object.values(PLANS).map((p) => <tr key={p.label} className="border-b border-ink/10"><td className="py-2 pr-3 font-medium">{p.label}</td><td className="pr-3">{p.products.toLocaleString("en-IN")}</td><td>{p.members}</td></tr>)}</tbody></table></div>
    <p>Paid plans are charged in Indian rupees, with GST added. A one-time payment covers one period (a month or a year) and does not renew. If you choose auto-renewal, your payment method is charged again at the end of every period at the then-current price shown at checkout, <b>until you cancel</b>. You can cancel at any time online under My plan, then Cancel auto-renewal; the plan stays active until the end of the period you already paid for. We email a tax invoice after every payment. Refunds: contact us within 7 days of a charge and we will review it.</p>
    <H>5. Figures and records</H>
    <p>Direct2Hub helps you track stock, orders, purchases, returns and margins from the data you enter. Reports, valuations and profit figures depend on that data and are not accounting, tax (including GST) or legal advice. You are responsible for checking them before relying on them.</p>
    <H>6. Availability and changes</H>
    <p>We work to keep the service available but do not promise it will be uninterrupted or error-free. We may improve, change or remove features, and will try to give notice of changes that significantly affect you.</p>
    <H>7. Suspension and ending</H>
    <p>We may suspend an organization that breaks these terms or puts the service or other customers at risk, and we record the reason. You can stop using the service at any time and ask us to delete your data.</p>
    <H>8. Liability</H>
    <p>The service is provided "as is". [A lawyer should complete the warranty disclaimer and limitation of liability clauses for your situation.] Nothing here limits liability that cannot be limited by law.</p>
    <H>9. Governing law</H>
    <p>These terms are governed by the laws of India. [Name the city or state whose courts will handle disputes.]</p>
    <H>10. Copyright and takedown</H>
    <p>Everything you add to Direct2Hub stays private to your organization; we do not publish it. If you believe something stored through our service infringes your copyright, email {LEGAL.email} with the work, where it is, and your contact details. We will remove or disable access to it promptly and end the accounts of repeat infringers.</p>
    <H>11. Contact</H>
    <p>Questions about these terms: {LEGAL.email}.</p>
  </Legal>;
}
