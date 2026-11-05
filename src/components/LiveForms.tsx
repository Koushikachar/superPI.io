"use client";
import { useEffect, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
/** Search and filter boxes are plain GET forms. Left alone, pressing Search reloads the whole browser page (sidebar, fonts, everything flash). This mounts once and turns those submits into a soft in-app update:
 *  the page you are looking at stays on screen (slightly dimmed) while the new results load, and the scroll position does not jump. Forms with an action (saves, uploads) are never touched. */
export default function LiveForms() {
  const router = useRouter(), path = usePathname(), [pending, start] = useTransition();
  useEffect(() => {
    const onSubmit = (e: SubmitEvent) => {
      const f = e.target as HTMLFormElement | null; if (!f || e.defaultPrevented || f.tagName !== "FORM" || f.hasAttribute("action") || (f.getAttribute("method") ?? "get").toLowerCase() !== "get" || f.dataset.native !== undefined || !f.closest("main")) return;
      e.preventDefault();
      const q = new URLSearchParams(); new FormData(f).forEach((v, k) => { if (typeof v === "string" && v.trim() !== "") q.set(k, v.trim()); });
      const url = `${path}${q.size ? `?${q}` : ""}`; start(() => router.replace(url, { scroll: false }));
    };
    document.addEventListener("submit", onSubmit); return () => document.removeEventListener("submit", onSubmit);
  }, [path, router]);
  useEffect(() => { document.body.toggleAttribute("data-pending", pending); return () => document.body.removeAttribute("data-pending"); }, [pending]);
  return null;
}
