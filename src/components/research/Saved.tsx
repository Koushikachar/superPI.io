"use client";
import { useOptimistic, useTransition } from "react"; import { toggleSavedIdea } from "@/app/prefs-actions";
/** Saved ideas are kept in a first-party cookie that is only sent to /research pages. The server reads it, so the saved state is already correct in the first paint. */
export function useSaved(initial: string[]) {
  const [saved, flip] = useOptimistic(initial, (s: string[], slug: string) => (s.includes(slug) ? s.filter((x) => x !== slug) : [...s, slug])), [, start] = useTransition();
  const toggle = (slug: string) => start(async () => { flip(slug); await toggleSavedIdea(slug); });
  return { saved, toggle };
}
export function SaveButton({ slug, saved, toggle, className = "" }: { slug: string; saved: string[]; toggle: (s: string) => void; className?: string }) {
  const on = saved.includes(slug);
  return <button type="button" onClick={() => toggle(slug)} aria-pressed={on} aria-label={on ? "Remove from saved ideas" : "Save this idea"} className={`rounded-full border px-3 py-1 text-sm backdrop-blur transition ${on ? "border-brand bg-brand text-white" : "border-edge/70 bg-surface/60 hover:bg-surface/90"} ${className}`}>{on ? "★ Saved" : "☆ Save"}</button>;
}

/** For pages rendered on the server (the idea detail page): keeps its own saved state, starting from what the server read from the cookie. The ideas board uses useSaved + SaveButton directly. */
export function SaveIdea({ slug, initial, className = "" }: { slug: string; initial: string[]; className?: string }) {
  const { saved, toggle } = useSaved(initial);
  return <SaveButton slug={slug} saved={saved} toggle={toggle} className={className} />;
}