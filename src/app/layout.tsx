import "./globals.css";
import { cookies } from "next/headers"; import ThemeScript from "@/components/ThemeScript"; import ConsentProvider from "@/components/ConsentProvider";
import { CONSENT_COOKIE, THEME_COOKIE, parseConsent, parseTheme } from "@/lib/prefs";
import CookieNotice from "@/components/CookieNotice"; import { ToastProvider } from "@/components/Toaster"; import Analytics from "@/components/Analytics";
import { Plus_Jakarta_Sans } from "next/font/google";
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0E1B2B" };
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "Direct2Hub: inventory management for Indian sellers", template: "%s · Direct2Hub" },
  description: "Track stock, orders, purchases and returns with a full audit trail. Inventory software for Indian ecommerce sellers, wholesalers and distributors.",
  openGraph: { title: "Direct2Hub: know what you can actually sell", description: "Inventory that never oversells, with a record of every change.", type: "website", siteName: "Direct2Hub" },
  twitter: { card: "summary_large_image" },
  // Google Search Console: paste the token from "HTML tag" verification into NEXT_PUBLIC_GSC_VERIFICATION.
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } } : {}),
};
/** Rendered on the server for every request: the saved theme and cookie choice are read from first-party cookies, so the HTML arrives already dark or light and the banner is in the first paint. */
export default async function Root({ children }: { children: React.ReactNode }) {
  const jar = await cookies(), theme = parseTheme(jar.get(THEME_COOKIE)?.value), consent = parseConsent(jar.get(CONSENT_COOKIE)?.value);
  return <html lang="en-IN" className={theme === "dark" ? "dark" : undefined} suppressHydrationWarning>{!theme && <head><ThemeScript /></head>}<body className={`${sans.variable} font-sans`}><ConsentProvider initial={consent}><ToastProvider>{children}</ToastProvider><CookieNotice /><Analytics /></ConsentProvider></body></html>;
}
