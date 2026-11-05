"use client";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { cleanCode } from "@/lib/pwstrength";
import { inp, btn, ghost } from "./ui";

const RESEND_WAIT = 60; // seconds; Supabase allows one email a minute per address

/** The form has two actions (confirm / resend). `who` is set by the button that was pressed, so only that one shows the spinner. */
function Act({ children, className, resend, who, onPress, formAction, disabled }: { children: React.ReactNode; className: string; resend?: boolean; who: "verify" | "resend"; onPress: () => void; formAction?: (fd: FormData) => void | Promise<void>; disabled?: boolean }) {
  const { pending } = useFormStatus(), mine = pending && who === (resend ? "resend" : "verify");
  return <button type="submit" onClick={onPress} formAction={formAction} formNoValidate={resend} disabled={pending || disabled} aria-busy={mine || undefined}
    className={`${className} ${pending ? "cursor-progress" : ""} ${pending && !mine ? "opacity-60" : ""}`}>
    {mine ? <span className="inline-flex items-center gap-2"><span aria-hidden className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />{resend ? "Sending" : "Checking code"}</span> : children}</button>;
}

/** The "Check your email" body: type the 6-digit code (auto-submits at 6 digits, accepts paste and phone keyboard autofill), or resend. One shared email field feeds both actions. */
export default function OtpForm({ email: initial, verify, resend, justSent }: { email: string; verify: (fd: FormData) => void | Promise<void>; resend: (fd: FormData) => void | Promise<void>; justSent: boolean }) {
  const [who, setWho] = useState<"verify" | "resend">("verify"), [code, setCode] = useState(""), [email, setEmail] = useState(initial), [wait, setWait] = useState(justSent ? RESEND_WAIT : 0);
  const form = useRef<HTMLFormElement>(null), codeBox = useRef<HTMLInputElement>(null), sent = useRef(false);
  useEffect(() => { codeBox.current?.focus(); }, []);
  useEffect(() => { if (wait <= 0) return; const t = setTimeout(() => setWait((w) => w - 1), 1000); return () => clearTimeout(t); }, [wait]);
  useEffect(() => { if (code.length === 6 && email && !sent.current) { sent.current = true; form.current?.requestSubmit(); } if (code.length < 6) sent.current = false; }, [code, email]);
  return <form ref={form} action={verify} className="mt-1 space-y-3">
    <label className="block text-sm font-medium" htmlFor="otp-code">Or type the code from the email</label>
    <input id="otp-code" ref={codeBox} name="token" value={code} onChange={(e) => setCode(cleanCode(e.target.value))} inputMode="numeric" pattern="[0-9]{6}" maxLength={9} autoComplete="one-time-code" required placeholder="1 2 3 4 5 6" aria-describedby="otp-help"
      className={`${inp} !py-3 text-center font-mono !text-2xl font-semibold tracking-[.45em] placeholder:text-ink/30 placeholder:tracking-[.45em] md:!text-2xl`} />
    <p id="otp-help" className="text-xs text-ink/70">On a phone, your keyboard offers the code from the email automatically.</p>
    <Act className={`${btn} w-full`} who={who} onPress={() => setWho("verify")} disabled={code.length !== 6}>Confirm code</Act>
    <label className="block pt-2 text-sm">Email<input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inp} autoComplete="email" /></label>
    <Act className={`${ghost} w-full py-2`} resend who={who} onPress={() => setWho("resend")} formAction={resend} disabled={wait > 0}>{wait > 0 ? `Send the link again (${wait}s)` : "Send the link again"}</Act>
  </form>;
}
