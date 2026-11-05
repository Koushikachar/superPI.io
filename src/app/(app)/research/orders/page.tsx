import { Panel } from "@/components/ui"; import { DataPage, Kpi, Trend, HBars, Heatmap, inr } from "@/components/research/parts";
export const dynamic = "force-dynamic";
export default function OrderTrends({ searchParams }: { searchParams: Promise<{ range?: string; state?: string }> }) {
  return <DataPage tab="orders" sp={searchParams}>{(a) => { const k = a.kpi, paid = Math.max(0, +(100 - k.unpaidPct - k.partialPct).toFixed(1));
    return <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"><Kpi label="Revenue" value={inr(k.gmv)} delta={k.gmvDelta} /><Kpi label="Orders" value={String(k.orders)} delta={k.ordersDelta} /><Kpi label="Average order" value={inr(k.aov)} delta={k.aovDelta} /><Kpi label="Unpaid orders" value={`${k.unpaidPct}%`} hint="no payment recorded yet" /></div>
      <div className="grid gap-4 lg:grid-cols-2"><Panel title="Revenue over time"><Trend data={a.series} /></Panel><Panel title="Orders over time"><Trend data={a.series.map((s) => ({ d: s.d, v: s.orders }))} label="Orders" /></Panel></div>
      <Panel title="When orders are placed (Indian time)"><Heatmap a={a} /><p className="mt-2 text-xs text-ink/65">Darker means more orders. Use it to time offers, ads and packing shifts.</p></Panel>
      <div className="grid gap-4 lg:grid-cols-2"><Panel title="Order value distribution"><HBars rows={a.dist.map((d) => ({ label: d.label, value: d.n, text: `${d.n} orders` }))} /></Panel><Panel title="Payment status"><HBars rows={[{ label: "Paid in full", value: paid, text: `${paid}%` }, { label: "Part-paid", value: k.partialPct, text: `${k.partialPct}%` }, { label: "Unpaid", value: k.unpaidPct, text: `${k.unpaidPct}%` }]} /><p className="mt-2 text-xs text-ink/65">Direct2Hub records whether an order is paid, part-paid or unpaid. It does not record cash on delivery separately.</p></Panel></div>
    </>; }}</DataPage>;
}
