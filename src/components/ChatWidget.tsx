"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AssistantChat from "./AssistantChat"; import { useBackClose } from "./useBackClose";
const PUBLIC_TRY = ["What does Direct2Hub do?", "How much does it cost?", "Is there a free plan?", "Does it make GST invoices?"];
const SIZE = 56, EDGE = 8; // button size, the gap kept from the screen edge
const Bubble = () => <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z" /><path d="M9 11h.01M12 11h.01M15 11h.01" /></svg>;
/** The chat bubble in the bottom-right corner. "public": on the home and pricing pages it answers visitors' questions about Direct2Hub (no account, no private data). "app": after sign-in it is the business assistant.
 *  It only appears when the AI is switched on, and the conversation is kept in memory only. */
export default function ChatWidget({ mode, ready = true, via }: { mode: "public" | "app"; ready?: boolean; via?: string }) {
  const path = usePathname() ?? "", app = mode === "app", [open, setOpen] = useState(false), [avail, setAvail] = useState(app), close = useCallback(() => setOpen(false), []);
  useEffect(() => { if (app) return; let live = true; fetch("/api/ai/public").then((r) => r.json()).then((j) => live && setAvail(!!j.ready)).catch(() => {}); return () => { live = false; }; }, [app]);
  useBackClose(open, close);
  useEffect(() => { if (!open) return; const k = (e: KeyboardEvent) => e.key === "Escape" && close(); document.addEventListener("keydown", k); return () => document.removeEventListener("keydown", k); }, [open, close]);
  // Drag the bubble anywhere. It always stays fully on screen (phone, tablet, desktop), and a tap still opens the chat.
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null), [dragging, setDragging] = useState(false), drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null), swallow = useRef(false);
  const fit = useCallback((x: number, y: number) => ({ x: Math.round(Math.min(Math.max(EDGE, x), Math.max(EDGE, window.innerWidth - SIZE - EDGE))), y: Math.round(Math.min(Math.max(EDGE, y), Math.max(EDGE, window.innerHeight - SIZE - EDGE))) }), []);
  const remember = useCallback((_p: { x: number; y: number }) => { /* position is not stored: it resets on reload, so nothing is kept in the browser */ }, []);
  useEffect(() => { const f = () => setPos((p) => (p ? fit(p.x, p.y) : p)); window.addEventListener("resize", f); window.addEventListener("orientationchange", f); return () => { window.removeEventListener("resize", f); window.removeEventListener("orientationchange", f); }; }, [fit]);
  if (!avail || (app && path.startsWith("/assistant"))) return null;
  const title = app ? "Business assistant" : "Ask Direct2Hub";
  return <>
    {!open && <button type="button" onClick={() => { if (swallow.current) { swallow.current = false; return; } setOpen(true); }} aria-label={app ? "Open the assistant (drag to move)" : "Chat with us (drag to move)"} title="Chat: drag to move" aria-haspopup="dialog"
      onPointerDown={(e) => { const r = e.currentTarget.getBoundingClientRect(); drag.current = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { const d = drag.current; if (!d) return; const dx = e.clientX - d.sx, dy = e.clientY - d.sy; if (!d.moved && Math.hypot(dx, dy) < 8) return; if (!d.moved) { d.moved = true; setDragging(true); } setPos(fit(d.ox + dx, d.oy + dy)); }}
      onPointerUp={(e) => { const d = drag.current; drag.current = null; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ } if (d?.moved) { swallow.current = true; setTimeout(() => { swallow.current = false; }, 0); setDragging(false); const r = e.currentTarget.getBoundingClientRect(); remember(fit(r.left, r.top)); } }}
      onPointerCancel={() => { drag.current = null; setDragging(false); }}
      onKeyDown={(e) => { const k = ({ ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] } as Record<string, number[]>)[e.key]; if (!k) return; e.preventDefault(); const r = e.currentTarget.getBoundingClientRect(), p = fit(r.left + k[0], r.top + k[1]); setPos(p); remember(p); }}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      className={`fixed z-30 grid h-14 w-14 touch-none select-none place-items-center rounded-full bg-gradient-to-b from-teal-500 to-brand text-white shadow-[0_8px_24px_rgba(15,118,110,.45)] transition-transform print:hidden ${dragging ? "cursor-grabbing scale-110" : "cursor-grab active:scale-95"} ${pos ? "" : `right-4 md:right-6 ${app ? "bottom-[calc(9.5rem+env(safe-area-inset-bottom))] md:bottom-10" : "bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-8"}`}`}><Bubble /></button>}
    {open && <div role="dialog" aria-modal="false" aria-label={title} className="fixed inset-0 z-50 flex flex-col bg-[rgb(var(--panel))] md:inset-auto md:bottom-5 md:right-5 md:h-[min(36rem,calc(100dvh-2.5rem))] md:w-[24rem] md:overflow-hidden md:rounded-2xl md:border md:border-edge/70 md:shadow-[0_20px_60px_rgba(14,27,43,.35)] print:hidden" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-between bg-gradient-to-r from-brand to-brandDark px-4 py-3 text-white"><div><p className="font-semibold">{title}</p><p className="text-xs text-white/75">{app ? "Answers from your own data" : "Quick answers about the product"}</p></div>
        <button type="button" onClick={close} aria-label="Close chat" className="grid h-10 w-10 place-items-center rounded-xl text-2xl leading-none hover:bg-white/15">×</button></div>
      <div className="min-h-0 flex-1 bg-surface/40">{app
        ? <AssistantChat compact ready={ready} via={via} heading="Ask about your business" intro="Stock, orders, customers and sales. I can also write product descriptions." />
        : <AssistantChat compact ready maxLen={400} endpoint="/api/ai/public" tries={PUBLIC_TRY} heading="Hi, how can I help?" intro="Ask about features, pricing or getting started. I only know Direct2Hub, and for anything else there is the contact page." placeholder="Type your question…" />}</div></div>}
  </>;
}
