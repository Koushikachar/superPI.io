"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Panel } from "@/components/ui";
import MarketAdvisor, { type Opp, type Ev } from "./MarketAdvisor";
type P = { id: string; name: string; sku: string };
type Soon = { id: string; name: string; sku: string; avail: number; cover: number | null };
type Dead = { id: string; name: string; sku: string; avail: number };
const TABS = [["ask", "Ask & forecast"], ["products", "Products"]] as const; type Tab = (typeof TABS)[number][0];
const Row = ({ r, note }: { r: P; note: string }) => <li><Link href={`/intelligence?id=${r.id}`} className="flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-surface/70"><span className="min-w-0 truncate font-medium text-brand">{r.name} <span className="font-normal text-ink/70">{r.sku}</span></span><span className="shrink-0 text-xs text-ink/75">{note}</span></Link></li>;
/** The Product intelligence home. Two tabs switch on the screen with no page load; the chat is kept while you look at products, and the product search filters as you type. */
export default function IntelHub({ products, soon, dead, opps, events, ready, via, month, total }: { products: P[]; soon: Soon[]; dead: Dead[]; opps: Opp[]; events: Ev[]; ready: boolean; via?: string; month: number; total: number }) {
  const [tab, setTab] = useState<Tab>("ask"), [term, setTerm] = useState(""), refs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { const h = location.hash.slice(1); if (h === "products" || h === "ask") setTab(h); }, []);
  const pick = (t: Tab, focus = false) => { setTab(t); try { history.replaceState(null, "", `#${t}`); } catch { /* ignore */ } if (focus) refs.current[TABS.findIndex((x) => x[0] === t)]?.focus(); };
  const shown = useMemo(() => { const t = term.trim().toLowerCase(); return (t ? products.filter((p) => p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t)) : products).slice(0, 30); }, [products, term]);
  return <div className="space-y-5">
    <div role="tablist" aria-label="Product intelligence" className="glass inline-flex max-w-full gap-1 p-1">{TABS.map(([k, l], i) => <button key={k} ref={(el) => { refs.current[i] = el; }} id={`tab-${k}`} role="tab" type="button" aria-selected={tab === k} aria-controls={`panel-${k}`} tabIndex={tab === k ? 0 : -1} onClick={() => pick(k)}
      onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); pick(TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length][0], true); } }}
      className={`min-h-10 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition ${tab === k ? "bg-brand text-white shadow" : "text-ink hover:bg-surface/70"}`}>{k === "ask" && <span aria-hidden className="mr-1.5">✨</span>}{l}</button>)}</div>
    <div role="tabpanel" id="panel-ask" aria-labelledby="tab-ask" hidden={tab !== "ask"}><p className="mb-4 max-w-2xl text-sm text-ink/75">Ask about anything in your business, or check whether a product you don't stock yet is likely to sell now.</p><MarketAdvisor ready={ready} via={via} opps={opps} events={events} month={month} /></div>
    <div role="tabpanel" id="panel-products" aria-labelledby="tab-products" hidden={tab !== "products"} className="space-y-5">
      <p className="max-w-2xl text-sm text-ink/75">Pick a product to see how it sells, when it will run out and what to do next, and to write its listing with AI.</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Running out soon">{soon.length ? <ul>{soon.map((r) => <Row key={r.id} r={r} note={r.avail <= 0 ? "Out of stock" : `${r.cover} days left`} />)}</ul> : <p className="text-sm text-ink/70">Nothing is about to run out at the current selling speed.</p>}</Panel>
        <Panel title="Not selling (90 days)">{dead.length ? <ul>{dead.map((r) => <Row key={r.id} r={r} note={`${r.avail} in stock`} />)}</ul> : <p className="text-sm text-ink/70">Every product in stock has sold recently.</p>}</Panel></div>
      <Panel title="Choose a product">
        <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search name or SKU" aria-label="Search products" className="min-h-11 w-full rounded-xl border border-edge/70 bg-surface/60 px-3 py-2 text-base text-ink shadow-inner backdrop-blur transition focus:bg-surface md:text-sm" />
        <ul className="mt-2" aria-live="polite">{shown.map((r) => <Row key={r.id} r={r} note="Open" />)}</ul>
        {!shown.length && <p className="mt-2 text-sm text-ink/70">No products found{term ? ` for “${term}”` : ""}.</p>}
        {total > products.length && !term && <p className="mt-2 text-xs text-ink/70">Showing the first {products.length} of {total}. Search to find the rest on the Products page.</p>}</Panel></div>
  </div>;
}
