import Link from "next/link"; import type { ReactNode } from "react";
import { Shell } from "@/components/Shell"; import { inp, btn, Panel } from "@/components/ui"; import { ctx } from "@/lib/ctx";
import { RANGES, parseFilters, loadAnalytics, qs, type Analytics, type Filters as Flt } from "@/lib/research";
export const inr = (x: number) => `₹${Math.round(x).toLocaleString("en-IN")}`;
export const TABS: [string, string, string][] = [["overview", "Overview", ""], ["orders", "Orders", "/orders"], ["buyers", "Buyers", "/buyers"], ["regions", "Regions", "/regions"], ["products", "Products", "/products"], ["returns", "Returns", "/returns"], ["ideas", "New product ideas", "/ideas"], ["calendar", "Selling calendar", "/calendar"]];
export function Tabs({ active, q = "" }: { active: string; q?: string }) {
  return <nav aria-label="Research sections" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 print:hidden">{TABS.map(([k, label, path]) => <Link key={k} href={`/research${path}${["ideas", "calendar"].includes(k) ? "" : q}`} aria-current={active === k ? "page" : undefined} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm backdrop-blur transition ${active === k ? "border-brand bg-brand text-white shadow" : "border-edge/70 bg-surface/50 hover:bg-surface/80"}`}>{label}</Link>)}</nav>;
}
export function Delta({ d, invert = false }: { d: number | null; invert?: boolean }) {
  if (d === null) return <span className="text-xs text-ink/65">no earlier data</span>; const good = invert ? d < 0 : d > 0, flat = d === 0;
  return <span className={`inline-flex items-center gap-1 text-xs font-semibold ${flat ? "text-ink/70" : good ? "text-emerald-700 dark:text-emerald-300" : "text-danger"}`}><span aria-hidden>{flat ? "–" : d > 0 ? "▲" : "▼"}</span>{Math.abs(d)}%<span className="font-normal text-ink/65">vs earlier</span></span>;
}
export function Kpi({ label, value, delta, invert, hint }: { label: string; value: string; delta?: number | null; invert?: boolean; hint?: string }) {
  return <div className="glass p-4 md:p-5"><div className="flex items-center gap-2 text-sm text-ink/70"><span className="h-2 w-2 shrink-0 rounded-full bg-brand" />{label}</div><div className="mt-2 break-words text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">{value}</div><div className="mt-1 min-h-4">{delta !== undefined ? <Delta d={delta} invert={invert} /> : hint ? <span className="text-xs text-ink/65">{hint}</span> : null}</div></div>;
}
/** Horizontal bars: the widest row is 100%. */
export function HBars({ rows, empty = "Nothing to show yet." }: { rows: { label: string; value: number; text: string; sub?: ReactNode }[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value)); if (!rows.length) return <p className="text-sm text-ink/70">{empty}</p>;
  return <ul className="space-y-3">{rows.map((r) => <li key={r.label}><div className="flex items-baseline justify-between gap-3 text-sm"><span className="min-w-0 truncate font-medium">{r.label}</span><span className="shrink-0 tabular-nums text-ink/70">{r.text}</span></div><div className="mt-1 h-2.5 overflow-hidden rounded-full bg-brand/10" role="img" aria-label={`${r.label}: ${r.text}`}><div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-brand" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} /></div>{r.sub ? <div className="mt-0.5 text-xs text-ink/65">{r.sub}</div> : null}</li>)}</ul>;
}
/** A responsive area chart drawn as SVG (no chart library needed on the server). */
export function Trend({ data, label = "Revenue" }: { data: { d: string; v: number }[]; label?: string }) {
  if (data.length < 2) return <p className="text-sm text-ink/70">Not enough orders in this period to draw a trend.</p>;
  const w = 640, h = 190, pl = 8, pb = 22, max = Math.max(1, ...data.map((x) => x.v)), x = (i: number) => pl + (i * (w - pl * 2)) / (data.length - 1), y = (v: number) => 8 + (1 - v / max) * (h - pb - 12), pts = data.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`), tick = Math.max(1, Math.ceil(data.length / 6));
  return <figure><svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`${label} over time, highest ${inr(max)}`}><defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0F766E" stopOpacity=".28" /><stop offset="1" stopColor="#0F766E" stopOpacity="0" /></linearGradient></defs>{[0, 0.5, 1].map((t) => <line key={t} x1={pl} x2={w - pl} y1={y(max * t)} y2={y(max * t)} stroke="rgba(100,130,145,.22)" strokeDasharray="3 4" />)}<polygon points={`${x(0)},${h - pb} ${pts.join(" ")} ${x(data.length - 1)},${h - pb}`} fill="url(#tg)" /><polyline points={pts.join(" ")} fill="none" stroke="#0F766E" strokeWidth="2.2" strokeLinejoin="round" />{data.map((p, i) => i % tick === 0 ? <text key={i} x={x(i)} y={h - 6} fontSize="10" textAnchor="middle" fill="#64748b">{p.d}</text> : null)}</svg><figcaption className="mt-1 flex justify-between text-xs text-ink/65"><span>{label}</span><span>Highest: {inr(max)}</span></figcaption></figure>;
}
export function Heatmap({ a }: { a: Analytics }) {
  const max = Math.max(1, ...a.heat.flat());
  return <div className="overflow-x-auto"><table className="w-full min-w-[420px] border-separate border-spacing-1 text-center text-xs"><thead><tr><th /><>{a.BLK.map((b) => <th key={b} className="pb-1 font-medium text-ink/70">{b}</th>)}</></tr></thead><tbody>{a.DAY.map((d, i) => <tr key={d}><th className="pr-2 text-right font-medium text-ink/70">{d}</th>{a.heat[i].map((v, j) => <td key={j} title={`${d}, ${a.BLK[j]}: ${v} orders`} className="h-9 rounded-md tabular-nums" style={{ background: `rgba(15,118,110,${v ? 0.12 + 0.78 * (v / max) : 0.05})`, color: v / max > 0.55 ? "#fff" : "#0f172a" }}>{v || ""}</td>)}</tr>)}</tbody></table></div>;
}
export { Spark } from "./Spark";
export const Note = ({ children }: { children: ReactNode }) => <p className="rounded-xl border border-turmeric/40 bg-turmeric/10 px-4 py-2 text-sm text-ink/80">{children}</p>;
export function Filters({ f, states, action }: { f: Flt; states: string[]; action: string }) {
  return <form method="get" action={action} className="glass flex flex-wrap items-end gap-3 p-3 print:hidden"><label className="text-xs text-ink/70">Period<select name="range" defaultValue={String(f.days)} className={`${inp} mt-1 min-w-40`}>{RANGES.map((r) => <option key={r.days} value={r.days}>{r.label}</option>)}</select></label><label className="text-xs text-ink/70">State<select name="state" defaultValue={f.state} className={`${inp} mt-1 min-w-44`}><option value="">All states</option>{[...states, "Not set"].map((s) => <option key={s} value={s}>{s === "Not set" ? "State not set" : s}</option>)}</select></label><button className={btn}>Apply</button></form>;
}
/** Shared frame for every "your store" tab: signs the person in, reads the filters, loads the numbers once. */
export async function DataPage({ tab, sp, children }: { tab: string; sp: Promise<{ range?: string; state?: string }>; children: (a: Analytics) => ReactNode }) {
  const c = await ctx(), f = parseFilters(await sp), a = await loadAnalytics(c.orgId, f), label = TABS.find((t) => t[0] === tab)?.[1] ?? "Research";
  return <Shell title={`Research: ${label}`} active="Research" admin={c.op}><Tabs active={tab} q={qs(f)} /><Filters f={f} states={a.states} action={`/research${TABS.find((t) => t[0] === tab)?.[2] ?? ""}`} />{!a.hasData ? <Panel title="No orders in this period"><p className="text-sm text-ink/70">Trends are built from your own orders. Confirm or dispatch some orders (or load the sample data in Settings) and this page fills in. You can also explore <Link href="/research/ideas" className="text-brand underline">new product ideas</Link> without any orders.</p></Panel> : children(a)}</Shell>;
}
