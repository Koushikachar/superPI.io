import { Panel, Table } from "@/components/ui"; import { DataPage, HBars, inr } from "@/components/research/parts";
export const dynamic = "force-dynamic";
export default function Regions({ searchParams }: { searchParams: Promise<{ range?: string; state?: string }> }) {
  return <DataPage tab="regions" sp={searchParams}>{(a) => { const tot = a.geo.reduce((t, g) => t + g.gmv, 0) || 1, unset = a.geo.find((g) => g.s === "Not set");
    return <>
      <Panel title="Revenue by state"><HBars rows={a.geo.map((g) => ({ label: g.s === "Not set" ? "State not set" : g.s, value: g.gmv, text: `${inr(g.gmv)} · ${Math.round((100 * g.gmv) / tot)}%`, sub: `${g.orders} orders · ${g.buyers} buyers · average ${inr(g.aov)}` }))} />{unset && unset.orders > 0 ? <p className="mt-3 text-xs text-ink/65">{unset.orders} orders are for customers with no state saved. Add a state on the Customers page for a fuller map.</p> : null}</Panel>
      <Panel title="State table"><Table head={["State", "Orders", "Buyers", "Revenue", "Average order"]} rows={a.geo.map((g) => [g.s === "Not set" ? "State not set" : g.s, g.orders, g.buyers, inr(g.gmv), inr(g.aov)])} empty="No orders" /></Panel>
    </>; }}</DataPage>;
}
