"use client";
import { forwardRef, useState } from "react";
import { inp } from "./ui";

const Eye = ({ off }: { off: boolean }) => <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
  {off ? <><path d="M3 3l18 18" /><path d="M10.6 6.2A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a12.6 12.6 0 0 1-3.1 3.9M6.6 7.6C4.5 9 3.1 11 2.5 12c1 2 4.5 6 9.5 6 1.4 0 2.7-.3 3.8-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>
    : <><path d="M2.5 12C3.5 10 7 6 12 6s8.5 4 9.5 6c-1 2-4.5 6-9.5 6s-8.5-4-9.5-6z" /><circle cx="12" cy="12" r="3" /></>}</svg>;

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; hint?: React.ReactNode };

/** A password box with a show / hide eye button. Works inside a normal <form action>: the value is posted under `name` whether it is shown or hidden. */
const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput({ label, hint, className = "", ...rest }, ref) {
  const [shown, setShown] = useState(false);
  return <label className="block text-sm">{label}
    <span className="relative mt-0 block">
      <input {...rest} ref={ref} type={shown ? "text" : "password"} autoCapitalize="off" autoCorrect="off" spellCheck={false} className={`${inp} pr-12 ${className}`} />
      <button type="button" onClick={() => setShown((s) => !s)} aria-label={shown ? "Hide password" : "Show password"} aria-pressed={shown} title={shown ? "Hide password" : "Show password"}
        className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-ink/60 transition hover:bg-surface/80 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"><Eye off={shown} /></button>
    </span>
    {hint}</label>;
});
export default PasswordInput;
