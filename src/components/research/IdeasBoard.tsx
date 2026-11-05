"use client";
import Link from "next/link"; import { useMemo, useState } from "react";
import { IDEAS, CATS, score, phase, verdict, type Idea } from "@/lib/research-data"; import { Spark } from "./Spark"; import { SaveButton, useSaved } from "./Saved";
const SORTS = { score: "Best opportunity now", margin: "Highest margin", comp: "Least competition", price: "Lowest price" } as const;
const tone = (p: string) => (p === "Heating up" || p === "Peak season" ? "bg-emerald-100 text-emerald-800" : p === "Off-season" ? "bg-slate-200 text-slate-700" : "bg-sky-100 text-sky-800");
const lv = { Low: 0, Medium: 1, High: 2 } as const;
export default function IdeasBoard({ nowIso, savedInit = [] }: { nowIso: string; savedInit?: string[] }) {
  const now = useMemo(() => new Date(nowIso), [nowIso]), [cat, setCat] = useState("All"), [q, setQ] = useState(""), [sort, setSort] = useState<keyof typeof SORTS>("score"), [season, setSeason] = useState("all"), [savedOnly, setSavedOnly] = useState(false), { saved, toggle } = useSaved(savedInit);
  const rows = useMemo(() => IDEAS.map((i) => ({ i, s: score(i, now).total, p: phase(i, now) })).filter(({ i, p }) => (cat === "All" || i.cat === cat) && (!q || `${i.name} ${i.cat} ${i.why}`.toLowerCase().includes(q.toLowerCase())) && (season === "all" || (season === "now" && (p === "Heating up" || p === "Peak season")) || (season === "off" && p === "Off-season")) && (!savedOnly || saved.includes(i.slug)))
    .sort((a, b) => sort === "score" ? b.s - a.s : sort === "margin" ? (b.i.margin[0] + b.i.margin[1]) - (a.i.margin[0] + a.i.margin[1]) : sort === "comp" ? lv[a.i.comp] - lv[b.i.comp] || b.s - a.s : a.i.price[0] - b.i.price[0]), [now, cat, q, sort, season, savedOnly, saved]);
  const sel = "min-h-11 rounded-xl border border-edge/70 bg-surface/60 px-3 py-2 text-sm shadow-inner backdrop-blur";
  return <div className="space-y-4">
    <div className="glass flex flex-wrap items-end gap-3 p-3">
      <label className="min-w-48 flex-1 text-xs text-ink/70">Search<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try: diwali, gifts, kitchen" className={`${sel} mt-1 w-full`} /></label>
      <label className="text-xs text-ink/70">Category<select value={cat} onChange={(e) => setCat(e.target.value)} className={`${sel} mt-1 block`}><option>All</option>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="text-xs text-ink/70">Season<select value={season} onChange={(e) => setSeason(e.target.value)} className={`${sel} mt-1 block`}><option value="all">Any time</option><option value="now">Heating up or peak now</option><option value="off">Off-season (plan ahead)</option></select></label>
      <label className="text-xs text-ink/70">Sort by<select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className={`${sel} mt-1 block`}>{Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} className="h-4 w-4 accent-teal-700" />Saved only ({saved.length})</label>
    </div>
    <p className="text-sm text-ink/70" aria-live="polite">{rows.length} idea{rows.length === 1 ? "" : "s"}</p>
    {rows.length === 0 ? <div className="glass p-6 text-sm text-ink/70">No ideas match. Clear a filter to see more.</div> : <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{rows.map(({ i, s, p }) => <IdeaCard key={i.slug} i={i} s={s} p={p} now={now} saved={saved} toggle={toggle} />)}</ul>}
    <p className="text-xs text-ink/65">These are starter estimates for the Indian market (prices, margins, competition and monthly demand), not live market data. Check real prices and competition on the marketplaces before you buy stock.</p>
  </div>;
}
function IdeaCard({ i, s, p, now, saved, toggle }: { i: Idea; s: number; p: string; now: Date; saved: string[]; toggle: (slug: string) => void }) {
  return <li className="glass flex flex-col gap-3 p-4">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-xs text-ink/65">{i.cat}</div><Link href={`/research/ideas/${i.slug}`} className="font-semibold leading-snug hover:text-brand">{i.name}</Link></div><div className="shrink-0 text-right"><div className="text-2xl font-bold tabular-nums leading-none text-brand">{s}</div><div className="text-[11px] text-ink/65">{verdict(s)}</div></div></div>
    <div className="flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-full px-2 py-0.5 font-medium ${tone(p)}`}>{p}</span><span className="rounded-full bg-surface/70 px-2 py-0.5">₹{i.price[0]} to ₹{i.price[1]}</span><span className="rounded-full bg-surface/70 px-2 py-0.5">{i.margin[0]}% to {i.margin[1]}% margin</span></div>
    <Spark curve={i.curve} month={now.getMonth()} />
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/65"><span>Competition: {i.comp}</span><span>Returns: {i.returns}</span><span>Parcel: {i.weight}</span></div>
    <p className="text-sm text-ink/75">{i.why}</p>
    <div className="mt-auto flex items-center gap-2"><Link href={`/research/ideas/${i.slug}`} className="ghost-hit min-h-10 rounded-xl bg-gradient-to-b from-teal-500 to-brand px-4 py-1.5 text-sm font-semibold text-white">Open</Link><SaveButton slug={i.slug} saved={saved} toggle={toggle} /></div>
  </li>;
}
