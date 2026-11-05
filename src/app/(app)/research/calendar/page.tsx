import Link from "next/link"; import { Shell } from "@/components/Shell"; import { ctx } from "@/lib/ctx"; import { Tabs } from "@/components/research/parts";
import { EVENTS, bySlug, sourceBy } from "@/lib/research-data";
export const dynamic = "force-dynamic";
const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export default async function Calendar() {
  const c = await ctx(), now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate()), up = EVENTS.filter((e) => new Date((e.end ?? e.date) + "T23:59:59") >= today).sort((a, b) => a.date.localeCompare(b.date));
  return <Shell title="Research: Selling calendar" active="Research" admin={c.op}><Tabs active="calendar" />
    <section className="glass space-y-1 p-5"><h2 className="font-semibold">Plan stock around the year</h2><p className="text-sm text-ink/70">Each moment shows when to start sourcing (about 60 days before) and which product ideas fit. Festival dates change every year and differ a little by region, so treat dates marked approximate as a guide.</p></section>
    {up.length === 0 ? <div className="glass p-6 text-sm text-ink/70">No upcoming moments are listed. The festival list in <code>src/lib/research-data.ts</code> needs new dates.</div> : <ol className="space-y-3">{up.map((e) => { const d = new Date(e.date + "T00:00:00"), days = Math.round((d.getTime() - today.getTime()) / 864e5), s = sourceBy(e), late = s < today && days > 0, running = days <= 0;
      return <li key={e.name + e.date} className="glass p-4 md:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{e.name}</h3><div className="text-sm text-ink/70">{fmt(d)}{e.end ? ` to ${fmt(new Date(e.end + "T00:00:00"))}` : ""}{e.approx ? " (approx.)" : ""}</div></div><div className={`rounded-full px-3 py-1 text-xs font-medium ${running ? "bg-emerald-100 text-emerald-800" : days <= 30 ? "bg-amber-100 text-amber-800" : "bg-surface/70"}`}>{running ? "On now" : days === 0 ? "Today" : `in ${days} day${days === 1 ? "" : "s"}`}</div></div>
        <p className="mt-2 text-sm text-ink/75">{e.note}</p>
        {!running && <p className={`mt-2 text-sm ${late ? "text-amber-800 dark:text-amber-300" : "text-ink/70"}`}>{late ? `The ideal sourcing date (${fmt(s)}) has passed. Use ready stock or suppliers who deliver fast.` : `Start sourcing by ${fmt(s)}.`}</p>}
        <div className="mt-3 flex flex-wrap gap-2">{e.ideas.map((s) => bySlug(s)).filter((x) => !!x).map((x) => <Link key={x!.slug} href={`/research/ideas/${x!.slug}`} className="rounded-full border border-edge/70 bg-surface/60 px-3 py-1 text-xs transition hover:bg-surface/90">{x!.name}</Link>)}</div></li>; })}</ol>}
    <p className="text-xs text-ink/65">Amazon and Flipkart sale events usually fall in late September to October. Their dates are announced late each year, so they are not listed here.</p></Shell>;
}
