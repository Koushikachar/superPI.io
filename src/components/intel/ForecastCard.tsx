import type { Card, Tone } from "@/lib/advisor";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
/** Verdict colours. Every pair is a tinted background with the theme's own text colour, so it reads in light and dark. */
export const TONE_BOX: Record<Tone, string> = { ok: "border-brand/40 bg-brand/10", info: "border-edge/70 bg-surface/50", warn: "border-turmeric/60 bg-turmeric/15", bad: "border-danger/30 bg-danger/10" };
export const TONE_DOT: Record<Tone, string> = { ok: "bg-brand", info: "bg-sky-500", warn: "bg-turmeric", bad: "bg-danger" };
export const TONE_BADGE: Record<Tone, string> = { ok: "bg-brand text-white", info: "bg-sky-600 text-white", warn: "bg-turmeric text-navy", bad: "bg-danger text-white" };

/** 12-month demand curve with this month marked. Pure SVG, drawn in the current text colour, so it follows the theme. */
export function Curve({ curve, nowIdx, height = 64, label = true }: { curve: number[]; nowIdx?: number; height?: number; label?: boolean }) {
  const W = 240, H = height, pad = 6, max = 10, x = (i: number) => pad + (i * (W - pad * 2)) / 11, y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const d = curve.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" "), area = `${d} L${x(11)} ${H - pad} L${x(0)} ${H - pad} Z`, peak = curve.indexOf(Math.max(...curve));
  return <svg viewBox={`0 0 ${W} ${H + (label ? 14 : 0)}`} className="w-full" role="img" aria-label={`Demand by month. Peak in ${MONTHS[peak]}.`}>
    <path d={area} className="fill-brand/15" /><path d={d} fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="stroke-brand" />
    {nowIdx !== undefined && <><line x1={x(nowIdx)} x2={x(nowIdx)} y1={pad} y2={H - pad} strokeDasharray="3 3" className="stroke-ink/50" /><circle cx={x(nowIdx)} cy={y(curve[nowIdx])} r="4" className="fill-turmeric stroke-surface" strokeWidth="2" /></>}
    <circle cx={x(peak)} cy={y(curve[peak])} r="3" className="fill-brand" />
    {label && [0, 3, 6, 9, 11].map((i) => <text key={i} x={x(i)} y={H + 11} textAnchor={i === 11 ? "end" : i === 0 ? "start" : "middle"} className="fill-ink/60" fontSize="9">{MONTHS[i]}</text>)}
  </svg>;
}
const Chip = ({ k, v }: { k: string; v: string }) => <div className="rounded-xl border border-edge/70 bg-surface/50 px-3 py-2"><div className="text-[11px] uppercase tracking-wide text-ink/70">{k}</div><div className="text-sm font-semibold text-ink">{v}</div></div>;
const List = ({ title, items, mark }: { title: string; items: string[]; mark: string }) => items.length ? <div><h4 className="text-xs font-semibold uppercase tracking-wide text-ink/70">{title}</h4><ul className="mt-1.5 space-y-1.5">{items.map((t, i) => <li key={i} className="flex gap-2 text-sm leading-snug text-ink"><span aria-hidden className="mt-0.5 shrink-0 text-ink/65">{mark}</span><span className="min-w-0 break-words">{t}</span></li>)}</ul></div> : null;
const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;
/** The answer to "will this sell?": verdict first, then the numbers behind it. */
export default function ForecastCard({ c }: { c: Card }) {
  return <article className={`animate-rise overflow-hidden rounded-2xl border ${TONE_BOX[c.tone]}`} aria-label={`${c.name}: ${c.verdict}`}>
    <header className="flex flex-wrap items-start justify-between gap-3 p-4">
      <div className="min-w-0"><p className="text-xs font-medium text-ink/70">{c.cat ?? "New product idea"}{c.kind === "ai" ? " · AI estimate" : ""}</p><h3 className="mt-0.5 break-words text-lg font-bold leading-tight text-ink">{c.name}</h3></div>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${TONE_BADGE[c.tone]}`}><span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />{c.verdict}</span>
    </header>
    <p className="px-4 pb-3 text-sm font-medium leading-snug text-ink">{c.headline}</p>
    {c.matchNote && <p className="mx-4 mb-3 rounded-lg border border-edge/60 bg-surface/50 px-3 py-2 text-xs text-ink/80">{c.matchNote}</p>}
    {c.curve && <div className="grid gap-4 border-t border-edge/50 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="w-full max-w-2xl"><div className="mb-1 flex items-center justify-between text-xs text-ink/70"><span>Demand through the year (0 to 10)</span><span className="flex items-center gap-1"><span aria-hidden className="h-2 w-2 rounded-full bg-turmeric" />now</span></div><Curve curve={c.curve} nowIdx={c.nowIdx} /></div>
      <div className="flex items-center gap-3 md:flex-col md:gap-1"><div className="grid h-16 w-16 place-items-center rounded-full border-4 border-brand/60 bg-surface/60"><span className="text-xl font-bold tabular-nums text-ink">{c.score}</span></div><div className="text-xs leading-tight text-ink/70 md:text-center"><b className="block text-sm text-ink">{c.phase}</b>peak {c.peak}</div></div></div>}
    {c.price && c.margin && <div className="grid grid-cols-2 gap-2 border-t border-edge/50 p-4 sm:grid-cols-4"><Chip k="Selling price" v={`${rs(c.price[0])} to ${rs(c.price[1])}`} /><Chip k="Margin" v={`${c.margin[0]}% to ${c.margin[1]}%`} /><Chip k="Competition" v={String(c.comp)} /><Chip k="Returns" v={`${c.returns} · ${String(c.weight).toLowerCase()} parcel`} /></div>}
    <div className="grid gap-4 border-t border-edge/50 p-4 md:grid-cols-3"><List title="Why" items={c.reasons} mark="•" /><List title="Watch out for" items={c.risks} mark="!" /><List title="Next steps" items={c.steps} mark="→" /></div>
    {(c.events?.length || c.store) && <footer className="space-y-2 border-t border-edge/50 p-4 text-sm text-ink">
      {c.events?.map((e) => <p key={e.name}><b>{e.name}</b> {e.daysAway === 0 ? "is on now" : `is in ${e.daysAway} days`}{e.orderBy ? `. Order by ${new Date(e.orderBy + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" })} to be ready.` : "."}</p>)}
      {c.store && <p className="text-ink/80">{c.store.similar ? <>You already stock <b className="text-ink">{c.store.similar}</b> similar item{c.store.similar === 1 ? "" : "s"} ({c.store.names.join(", ")}) and sold <b className="text-ink">{c.store.sold90}</b> units of them in the last 90 days.</> : "You don't stock anything similar yet, so this would be a new line for you."}</p>}</footer>}
  </article>;
}
