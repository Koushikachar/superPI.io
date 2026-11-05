"use client";
import { useEffect } from "react"; import { usePathname } from "next/navigation"; import Script from "next/script";
import { gaId, isPublicPath } from "@/lib/seo"; import { useConsent } from "./ConsentProvider";
/** Google Analytics 4. It loads only if (1) NEXT_PUBLIC_GA_ID is set, (2) the visitor chose "Accept analytics" (saved in a cookie), and (3) the page is public, never the signed-in app. IP anonymization is on and advertising signals are off. If the choice is withdrawn, GA's own kill switch stops further hits. */
export default function Analytics() {
  const id = gaId(), path = usePathname() ?? "/", { choice } = useConsent(), on = !!id && choice === "granted" && isPublicPath(path);
  useEffect(() => { if (id) (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = !on; }, [id, on]);
  if (!on) return null;
  return <><Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
    <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true,allow_google_signals:false,allow_ad_personalization_signals:false});`}</Script></>;
}
