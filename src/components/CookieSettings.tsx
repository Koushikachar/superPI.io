"use client";
import { useConsent } from "./ConsentProvider";
/** Footer link to change the cookie choice at any time. */
export default function CookieSettings() { const { reopen } = useConsent(); return <button type="button" className="underline" onClick={reopen}>Cookie settings</button>; }
