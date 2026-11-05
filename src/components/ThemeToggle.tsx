"use client";
import { useEffect, useState, useTransition } from "react"; import { saveTheme } from "@/app/prefs-actions";
/** Light / dark switch. The choice is saved in a first-party cookie (set by the server) so the next page already arrives in the right theme; before the person has chosen, the device's own setting is followed. The class is set by a tiny script in <head> first, so there is no flash of the wrong theme. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null), [, start] = useTransition(), [chosen, setChosen] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    // follow the device while nothing has been chosen on this site
    const mq = matchMedia("(prefers-color-scheme: dark)"), on = (e: MediaQueryListEvent) => { if (document.cookie.includes("d2h_theme=") || chosen) return; apply(e.matches, false); };
    mq.addEventListener("change", on); return () => mq.removeEventListener("change", on);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosen]);
  const apply = (d: boolean, save: boolean) => {
    const root = document.documentElement; root.classList.add("theme-switching"); root.classList.toggle("dark", d); setDark(d);
    document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", d ? "dark" : "light");
    if (save) { setChosen(true); start(() => { void saveTheme(d ? "dark" : "light"); }); }
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-switching")));
  };
  const isDark = dark === true, label = isDark ? "Switch to light mode" : "Switch to dark mode";
  return <button type="button" role="switch" aria-checked={isDark} aria-label={label} title={label} onClick={() => apply(!isDark, true)} disabled={dark === null}
    className={`ghost-hit inline-grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-edge/70 bg-surface/60 text-ink backdrop-blur transition hover:bg-surface/90 active:scale-95 ${className}`}>
    {isDark
      ? <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      : <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>}
  </button>;
}
