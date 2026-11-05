"use client";
import { useEffect, useRef, useState } from "react";
import type { Card } from "@/lib/advisor";
import ForecastCard, { Curve, TONE_BADGE } from "./ForecastCard";
export type Opp = { slug: string; name: string; cat: string; score: number; phase: string; verdict: string; curve: number[]; margin: [number, number]; comp: string; peak: string; why: string };
export type Ev = { name: string; date: string; daysAway: number; live: boolean; note: string; approx: boolean; ideas: string[] };
type M = { role: "user" | "assistant"; content: string; card?: Card; opps?: Opp[]; source?: string; error?: boolean };
type Mode = "auto" | "business" | "idea";
const MODES: [Mode, string, string][] = [["auto", "Auto", "I'll work out whether you're asking about your business or the market"], ["idea", "Will it sell?", "Market check for a product or idea"], ["business", "My business", "Questions about your own stock, orders and sales"]];
const STARTERS = ["What can I sell right now?", "Should I start selling LED string lights?", "Will winter hoodies sell this month?", "Is a smartwatch worth adding?", "Which of my products sold best this month?", "Which products are running low?"];
const bold = (t: string) => t.split(/(\*\*[^*]+\*\*)/g).map((x, i) => x.startsWith("**") && x.endsWith("**") ? <strong key={i} className="font-semibold">{x.slice(2, -2)}</strong> : x);
const Text = ({ t }: { t: string }) => <div className="space-y-2">{t.split(/\n{2,}/).map((p, i) => <p key={i} className="whitespace-pre-wrap break-words">{p.split("\n").map((l, k, a) => <span key={k}>{bold(l)}{k < a.length - 1 && <br />}</span>)}</p>)}</div>;
/** A mini card for one idea: tap it to ask the advisor about it. */
export const OppCard = ({ o, onAsk, now }: { o: Opp; onAsk: (q: string) => void; now: number }) => <button type="button" onClick={() => onAsk(`Should I start selling ${o.name}?`)} className="group flex h-full min-w-0 flex-col rounded-2xl border border-edge/70 bg-surface/50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-surface/80 active:scale-[.98]">
  <div className="flex items-start justify-between gap-2"><span className="min-w-0 break-words text-sm font-semibold leading-snug text-ink">{o.name}</span><span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${TONE_BADGE[o.verdict === "Start now" ? "ok" : "info"]}`}>{o.score}</span></div>
  <p className="mt-0.5 text-xs text-ink/70">{o.phase} · peak {o.peak} · {o.margin[0]}-{o.margin[1]}% margin</p>
  <div className="mt-2"><Curve curve={o.curve} nowIdx={now} height={34} label={false} /></div>
  <span className="mt-1 text-xs font-semibold text-brand opacity-90 group-hover:underline">Check this →</span></button>;
/** Ask anything about the business, or whether a product (one you have, or one you don't) is worth selling right now. The conversation lives on this screen only. */
export default function MarketAdvisor({ ready, via, opps, events, month }: { ready: boolean; via?: string; opps: Opp[]; events: Ev[]; month: number }) {
  const [msgs, setMsgs] = useState<M[]>([]), [q, setQ] = useState(""), [busy, setBusy] = useState(false), [mode, setMode] = useState<Mode>("auto"), [focus, setFocus] = useState(""), box = useRef<HTMLDivElement>(null), ta = useRef<HTMLTextAreaElement>(null), alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  // scroll inside the chat only (scrollIntoView would also scroll the whole page)
  useEffect(() => { const el = box.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => { const t = ta.current; if (t) { t.style.height = "auto"; t.style.height = Math.min(t.scrollHeight, 128) + "px"; } }, [q]);
  const send = async (text: string, m: Mode = mode) => {
    text = text.trim(); if (!text || busy) return; const next: M[] = [...msgs, { role: "user", content: text }]; setMsgs(next); setQ(""); setBusy(true);
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 55_000);
    const r = await fetch("/api/ai/advisor", { method: "POST", signal: ctl.signal, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: m, focus, messages: next.filter((x) => !x.error).map(({ role, content }) => ({ role, content })) }) }).catch(() => null), j = await r?.json().catch(() => null); clearTimeout(to);
    setBusy(false); if (!alive.current) return;
    if (r?.ok && j?.reply) { if (j.focus) setFocus(j.focus); setMsgs([...next, { role: "assistant", content: j.reply, card: j.card, opps: j.opps, source: j.source }]); }
    else setMsgs([...next, { role: "assistant", content: j?.error ?? "I couldn't reach the server. Check your connection and try again.", error: true }]);
  };
  const empty = !msgs.length;
  return <div className="space-y-5">
    {empty && <>
      <section aria-labelledby="opp-h" className="glass p-4 md:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4"><h2 id="opp-h" className="font-semibold text-ink">Strongest for the next 3 months</h2><p className="text-xs text-ink/70">Seasonal demand, margin and competition. Tap one to check it.</p></div>
        <div className="mt-3 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">{opps.slice(0, 8).map((o) => <OppCard key={o.slug} o={o} onAsk={(t) => send(t, "idea")} now={month} />)}</div></section>
      {events.length > 0 && <section aria-labelledby="ev-h" className="glass p-4 md:p-5"><h2 id="ev-h" className="font-semibold text-ink">Coming up</h2>
        <ul className="mt-3 grid gap-2 md:grid-cols-2">{events.map((e) => <li key={e.name} className="rounded-xl border border-edge/70 bg-surface/50 p-3"><div className="flex items-center justify-between gap-2"><b className="text-sm text-ink">{e.name}</b><span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${e.live ? "bg-brand text-white" : "bg-turmeric text-navy"}`}>{e.live ? "On now" : `${e.daysAway} days`}</span></div><p className="mt-1 text-xs text-ink/80">{e.note}{e.approx ? " (date is approximate)" : ""}</p>{e.ideas.length > 0 && <p className="mt-1 text-xs text-ink/70">Sells: {e.ideas.join(", ")}</p>}</li>)}</ul></section>}
    </>}
    <section aria-label="Market advisor chat" className="glass flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-edge/60 p-3 md:px-4"><div role="radiogroup" aria-label="What are you asking about?" className="flex flex-wrap gap-1.5">{MODES.map(([k, l, t]) => <button key={k} type="button" role="radio" aria-checked={mode === k} title={t} onClick={() => setMode(k)} className={`min-h-9 rounded-full border px-3 text-sm font-medium transition ${mode === k ? "border-brand bg-brand text-white" : "border-edge/70 bg-surface/50 text-ink hover:bg-surface/80"}`}>{l}</button>)}</div>
        {msgs.length > 0 && <button type="button" onClick={() => { setMsgs([]); setFocus(""); }} className="ghost-hit ml-auto min-h-9 rounded-full px-3 text-sm text-brand underline">New chat</button>}</div>
      <div ref={box} className={`space-y-4 overflow-y-auto overscroll-contain p-3 md:p-4 ${empty ? "" : "h-[min(34rem,calc(100dvh-18rem))] min-h-[16rem]"}`} aria-live="polite">
        {empty && <div className="py-2 text-center"><p className="text-lg font-semibold text-ink">Ask about your business or the market</p><p className="mx-auto mt-1 max-w-xl text-sm text-ink/75">Ask about any product you stock, or describe a new idea and I will tell you whether it is likely to sell now, what margin to expect and when to order. Estimates come from Indian seasonal patterns and your own sales, not live market data.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">{STARTERS.map((s) => <button key={s} type="button" onClick={() => send(s)} className="min-h-10 rounded-full border border-edge/70 bg-surface/60 px-3.5 py-1.5 text-sm text-ink transition hover:bg-surface/90 active:scale-95">{s}</button>)}</div></div>}
        {msgs.map((m, i) => m.role === "user"
          ? <div key={i} className="flex justify-end"><div className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-sm text-white shadow">{m.content}</div></div>
          : <div key={i} className="flex flex-col items-start gap-3">
              <div className={`max-w-full rounded-2xl rounded-bl-md border px-4 py-3 text-sm leading-relaxed text-ink md:max-w-[90%] ${m.error ? "border-danger/30 bg-danger/10 text-danger" : "border-edge/70 bg-surface/70"}`}><Text t={m.content} />{m.source && !m.error && <p className="mt-2 text-[11px] text-ink/70">{m.source === "ai" ? `Answered by AI${via ? ` (${via})` : ""} from your data and seasonal estimates` : "Answered from your data and seasonal estimates (no AI)"}</p>}</div>
              {m.card && <div className="w-full"><ForecastCard c={m.card} /></div>}
              {m.opps && m.opps.length > 0 && <div className="grid w-full grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-3">{m.opps.map((o) => <OppCard key={o.slug} o={o} onAsk={(t) => send(t, "idea")} now={month} />)}</div>}
            </div>)}
        {busy && <div className="flex justify-start"><div role="status" aria-label="Thinking" className="flex gap-1 rounded-2xl border border-edge/70 bg-surface/70 px-4 py-3">{[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 rounded-full bg-ink/50 motion-safe:animate-bounce" style={{ animationDelay: `${d * 120}ms` }} />)}</div></div>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(q); }} className="flex items-end gap-2 border-t border-edge/60 p-3 md:px-4">
        <textarea ref={ta} value={q} onChange={(e) => setQ(e.target.value)} rows={1} maxLength={800} aria-label="Your question" placeholder={mode === "business" ? "Ask about your stock, orders, customers…" : "Ask: “Will wireless earbuds sell now?” or describe a new idea…"}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(q); } }}
          className="max-h-32 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-edge/70 bg-surface/70 px-3 py-2.5 text-base text-ink outline-none transition focus:bg-surface md:text-sm" />
        <button type="submit" disabled={busy || !q.trim()} className="min-h-11 shrink-0 rounded-xl bg-gradient-to-b from-teal-500 to-brand px-5 text-sm font-semibold text-white shadow transition hover:brightness-110 active:scale-95 disabled:opacity-50">{busy ? "…" : "Ask"}</button></form>
    </section>
    {!ready && <p className="text-xs text-ink/70">The AI is off (no API key). Market checks for known products and questions about your data still work; brand-new product ideas need the AI for a full read.</p>}
  </div>;
}
