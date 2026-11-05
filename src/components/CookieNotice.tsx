"use client";
import Link from "next/link"; import { usePathname } from "next/navigation";
import { gaId, isPublicPath } from "@/lib/seo"; import { useConsent } from "./ConsentProvider";
/** Cookie banner for the public pages. It is already in the server-rendered HTML when no choice has been saved. With Google Analytics configured it offers two equal buttons; without it, it only informs (there is nothing optional to agree to). The choice is saved in a first-party cookie for 6 months. */
export default function CookieNotice() {
  const { asking, choose } = useConsent(), path = usePathname() ?? "/", ga = !!gaId();
  if (!asking || !isPublicPath(path)) return null;
  const btn = "min-h-11 flex-1 rounded-xl px-4 py-2 font-semibold transition sm:flex-none";
  return <div role="region" aria-label="Cookies" className="glass-dark fixed inset-x-3 bottom-3 z-40 p-4 text-sm md:inset-x-auto md:bottom-4 md:left-4 md:right-auto md:max-w-md" style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
    <p><b>Cookies.</b> We use essential cookies to keep you signed in and to remember light or dark mode. {ga ? "With your OK we also use Google Analytics cookies on our public pages to count visits. " : ""}No advertising cookies. <Link href="/privacy#cookies" className="underline">Details</Link></p>
    <div className="mt-3 flex flex-wrap gap-2">
      {ga ? <><button type="button" onClick={() => choose("denied")} className={`${btn} bg-white/15 hover:bg-white/25`}>Essential only</button><button type="button" onClick={() => choose("granted")} className={`${btn} bg-turmeric text-navy hover:brightness-110`}>Accept analytics</button></>
        : <button type="button" onClick={() => choose("denied")} className={`${btn} bg-turmeric text-navy hover:brightness-110`}>Got it</button>}</div></div>;
}
