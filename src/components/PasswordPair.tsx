"use client";
import { useEffect, useRef, useState } from "react";
import PasswordInput from "./PasswordInput";
import { checkStrength, matchState, MIN_PASSWORD } from "@/lib/pwstrength";

const Tick = ({ ok }: { ok: boolean }) => <svg aria-hidden viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 ${ok ? "text-brand" : "text-ink/30"}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ok ? <><circle cx="10" cy="10" r="8" /><path d="M6.5 10.2l2.4 2.4 4.6-4.9" /></> : <circle cx="10" cy="10" r="8" />}</svg>;
const BAR = ["bg-edge", "bg-danger", "bg-turmeric", "bg-teal-500", "bg-brand"];

/** Password + Confirm password with: show/hide on each, a strength bar, and a live "match / don't match" message. Submitting is blocked by the browser until both are the same. */
export default function PasswordPair({ passwordLabel = "Password", confirmLabel = "Confirm password" }: { passwordLabel?: string; confirmLabel?: string }) {
  const [pw, setPw] = useState(""), [cf, setCf] = useState(""), confirmRef = useRef<HTMLInputElement>(null);
  const st = checkStrength(pw), m = matchState(pw, cf);
  useEffect(() => { confirmRef.current?.setCustomValidity(m === "mismatch" ? "The two passwords don't match" : ""); }, [m]);
  return <>
    <PasswordInput name="password" label={passwordLabel} value={pw} onChange={(e) => setPw(e.target.value)} minLength={MIN_PASSWORD} maxLength={128} required autoComplete="new-password" aria-describedby="pw-help"
      hint={<span id="pw-help" className="mt-1.5 block space-y-1.5">
        <span className="flex gap-1" aria-hidden>{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${pw && st.score >= i ? BAR[st.score] : "bg-edge/70"}`} />)}</span>
        <span className="flex items-center justify-between text-xs"><span className="flex items-center gap-1.5 text-ink/70"><Tick ok={st.long} />At least {MIN_PASSWORD} characters</span>{pw && <span className={`font-semibold ${st.score >= 3 ? "text-brand" : st.score === 2 ? "text-ink/80" : "text-danger"}`} aria-live="polite">{st.label}</span>}</span>
        <span className="flex items-center gap-1.5 text-xs text-ink/70"><Tick ok={st.mixed} />Mix letters, numbers and symbols (recommended)</span></span>} />
    <PasswordInput ref={confirmRef} name="confirm" label={confirmLabel} value={cf} onChange={(e) => setCf(e.target.value)} minLength={MIN_PASSWORD} maxLength={128} required autoComplete="new-password" aria-describedby="pw-match"
      hint={<span id="pw-match" role="status" aria-live="polite" className="mt-1.5 block min-h-5 text-xs">
        {m === "match" && <span className="flex items-center gap-1.5 font-semibold text-brand"><Tick ok />Passwords match</span>}
        {m === "mismatch" && <span className="flex items-center gap-1.5 font-semibold text-danger"><svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="10" cy="10" r="8" /><path d="M7.2 7.2l5.6 5.6M12.8 7.2l-5.6 5.6" /></svg>Passwords don&apos;t match yet</span>}</span>} />
  </>;
}
