import { Panel } from "@/components/ui"; import Link from "next/link"; import { DataPage, Kpi, HBars } from "@/components/research/parts";
export const dynamic = "force-dynamic";
export default function ReturnTrends({ searchParams }: { searchParams: Promise<{ range?: string; state?: string }> }) {
  return <DataPage tab="returns" sp={searchParams}>{(a) => { const k = a.kpi, r = a.returns;
    return <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4"><Kpi label="Return rate" value={k.returnPct === null ? "n/a" : `${k.returnPct}%`} hint={k.returnPct === null ? "not available with a state filter" : "units returned ÷ units sold"} /><Kpi label="Units returned" value={String(k.retUnits)} /><Kpi label="Units sold" value={String(k.unitsSold)} /></div>
      <div className="grid gap-4 lg:grid-cols-2"><Panel title="Why items come back"><HBars rows={r.reasons.map((x) => ({ label: x.reason.charAt(0).toUpperCase() + x.reason.slice(1), value: x.qty, text: `${x.qty} units` }))} empty="No returns recorded in this period." /></Panel><Panel title="Most returned products"><HBars rows={r.top.map((x) => ({ label: x.name, value: x.qty, text: `${x.qty} units`, sub: x.sku }))} empty="No returns recorded in this period." /></Panel></div>
      <p className="text-xs text-ink/65">Returns come from the <Link href="/returns" className="text-brand underline">Returns</Link> page. The state filter applies to sales, not returns, because a return is not tied to a customer record.</p>
    </>; }}</DataPage>;
}
