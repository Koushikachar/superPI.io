import Link from "next/link"; import { notFound } from "next/navigation";
import { Shell, Stat } from "@/components/Shell"; import { Panel } from "@/components/ui"; import ProductIntel from "@/components/ProductIntel"; import IntelHub from "@/components/intel/IntelHub";
import { db } from "@/lib/db"; import { ctx } from "@/lib/ctx"; import { aiReady, aiLabel } from "@/lib/ai"; import { opportunities, upcoming } from "@/lib/advisor"; import { productFacts, signals, overview } from "@/lib/pi";
export const dynamic = "force-dynamic";
const tone = { warn: "border-turmeric/60 bg-turmeric/15", ok: "border-brand/40 bg-brand/10", info: "border-edge/70 bg-surface/50" };
export default async function Intelligence({ searchParams }: { searchParams: Promise<{ id?: string; q?: string }> }) {
  const c = await ctx(), { id, q } = await searchParams, can = ["OWNER", "INVENTORY_MANAGER"].includes(c.role), cost = c.role !== "ORDER_STAFF";
  if (id) {
    const f = await productFacts(c.orgId, id); if (!f) notFound();
    return <Shell title={`Intelligence · ${f.name}`} active="Product intelligence" admin={c.op}>
      <p className="-mt-2 text-sm"><Link href="/intelligence" className="text-brand underline">All products</Link> · <Link href={`/products/${f.id}`} className="text-brand underline">Open product ({f.sku})</Link></p>
      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4"><Stat label="Available" value={f.available} hint={f.reorderAt ? `Reorder at ${f.reorderAt}` : undefined} tone={f.available <= f.reorderAt ? "warn" : "brand"} /><Stat label="Sold, last 30 days" value={f.sold30} hint={`${f.sold90} in 90 days`} />
        <Stat label="Days of stock" value={f.coverDays ?? "—"} hint={f.perDay ? `Selling ~${f.perDay} a day` : "No recent sales"} tone={f.coverDays !== null && f.coverDays < 14 ? "warn" : "brand"} /><Stat label={cost ? "Margin" : "Price"} value={cost ? (f.marginPct === null ? "—" : `${f.marginPct}%`) : `₹${f.price}`} hint={cost ? `₹${f.price} sell, ₹${f.cost} cost` : undefined} /></div>
      <Panel title="What the numbers say"><ul className="space-y-2">{signals(f).map((s, i) => <li key={i} className={`rounded-xl border px-3 py-2 text-sm ${tone[s.tone]}`}>{s.text}</li>)}</ul><p className="mt-2 text-xs text-ink/70">Based on dispatched and delivered orders. Days of stock assumes the recent selling speed continues.</p></Panel>
      <Panel title="AI tools for this product"><ProductIntel id={f.id} ready={aiReady()} canSave={can} /></Panel></Shell>;
  }
  void q; const now = new Date(), [list, total, ov] = await Promise.all([db.product.findMany({ where: { orgId: c.orgId, archived: false }, orderBy: { name: "asc" }, take: 300, select: { id: true, name: true, sku: true } }), db.product.count({ where: { orgId: c.orgId, archived: false } }), overview(c.orgId)]);
  return <Shell title="Product intelligence" active="Product intelligence" admin={c.op}>
    <IntelHub products={list} total={total} soon={ov.soon} dead={ov.dead} opps={opportunities(now, 8)} events={upcoming(now, 4)} ready={aiReady()} via={aiLabel("product")} month={now.getMonth()} /></Shell>;
}
