import { Panel, Table } from "@/components/ui"; import { DataPage, Kpi, HBars, inr } from "@/components/research/parts";
export const dynamic = "force-dynamic";
export default function Buyers({ searchParams }: { searchParams: Promise<{ range?: string; state?: string }> }) {
  return <DataPage tab="buyers" sp={searchParams}>{(a) => { const b = a.buyers, k = a.kpi, seg = Object.entries(b.segments).filter(([, v]) => v > 0);
    return <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"><Kpi label="Buyers" value={String(b.total)} hint="ordered in this period" /><Kpi label="New buyers" value={String(b.fresh)} hint="first order in this period" /><Kpi label="Repeat buyers" value={`${k.repeatPct}%`} hint={`${b.repeat} had ordered before`} /><Kpi label="Average order" value={inr(k.aov)} delta={k.aovDelta} /></div>
      <div className="grid gap-4 lg:grid-cols-2"><Panel title="New vs repeat buyers"><HBars rows={[{ label: "New", value: b.fresh, text: `${b.fresh}` }, { label: "Repeat", value: b.repeat, text: `${b.repeat}` }]} /></Panel>
        <Panel title="Buyer groups"><HBars rows={seg.map(([label, v]) => ({ label, value: v, text: `${v}` }))} empty="Groups appear once you have a few buyers." /><p className="mt-2 text-xs text-ink/65">Simple rules on your own data: big spenders are the top fifth by spend, frequent buyers have 3+ orders, slipping-away buyers ordered at least twice but not in the last 60 days.</p></Panel></div>
      <Panel title="Top buyers"><Table head={["Buyer", "Orders (all time)", "Spent (all time)"]} rows={b.top.map((t) => [t.name, t.orders, inr(t.spend)])} empty="No buyers yet" /></Panel>
    </>; }}</DataPage>;
}
