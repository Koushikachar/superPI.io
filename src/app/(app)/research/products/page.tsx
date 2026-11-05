import { Panel, Table } from "@/components/ui"; import { DataPage, HBars, Delta, inr } from "@/components/research/parts";
export const dynamic = "force-dynamic";
export default function ProductTrends({ searchParams }: { searchParams: Promise<{ range?: string; state?: string }> }) {
  return <DataPage tab="products" sp={searchParams}>{(a) => { const P = a.products, top = [...P].filter((p) => p.rev > 0).sort((x, y) => y.rev - x.rev).slice(0, 8),
      rising = P.filter((p) => p.growth !== null && p.growth > 0 && p.rev > 0).sort((x, y) => (y.growth ?? 0) - (x.growth ?? 0)).slice(0, 6), cooling = P.filter((p) => p.prevRev > 0 && (p.growth ?? 0) < 0).sort((x, y) => (x.growth ?? 0) - (y.growth ?? 0)).slice(0, 6), fresh = P.filter((p) => p.prevRev === 0 && p.rev > 0).slice(0, 6);
    return <>
      <div className="grid gap-4 lg:grid-cols-2"><Panel title="Top products by revenue"><HBars rows={top.map((p) => ({ label: p.name, value: p.rev, text: inr(p.rev), sub: `${p.units} units · profit ${inr(p.profit)}` }))} /></Panel><Panel title="Product groups"><HBars rows={a.groups.map((g) => ({ label: g.g, value: g.rev, text: inr(g.rev), sub: `${g.units} units` }))} empty="No sales yet" /></Panel></div>
      <div className="grid gap-4 lg:grid-cols-3"><Panel title="Rising"><Table head={["Product", "Change"]} rows={rising.map((p) => [p.name, <Delta key="d" d={p.growth} />])} empty="No risers yet" /></Panel><Panel title="Cooling"><Table head={["Product", "Change"]} rows={cooling.map((p) => [p.name, <Delta key="d" d={p.growth} />])} empty="Nothing is slowing down" /></Panel><Panel title="New sellers"><Table head={["Product", "Revenue"]} rows={fresh.map((p) => [p.name, inr(p.rev)])} empty="No new sellers in this period" /></Panel></div>
      <p className="text-xs text-ink/65">Change compares this period with the same-length period before it. Profit is price minus the unit cost saved on the product.</p>
    </>; }}</DataPage>;
}
