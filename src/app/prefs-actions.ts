"use server";
import { cookies } from "next/headers";
import { bySlug } from "@/lib/research-data";
import { CONSENT_COOKIE, THEME_COOKIE, SAVED_COOKIE, DAY, cookieOpts, parseConsent, parseTheme, parseSaved } from "@/lib/prefs";
/** Remember the analytics choice for 6 months. Anything other than the two known values is ignored. */
export async function saveConsent(v: string) { const c = parseConsent(v); if (!c) return; (await cookies()).set(CONSENT_COOKIE, c, cookieOpts(180 * DAY)); }
/** Remember light/dark for a year (a preference the person asked for by pressing the switch). */
export async function saveTheme(v: string) { const t = parseTheme(v); if (!t) return; (await cookies()).set(THEME_COOKIE, t, cookieOpts(365 * DAY)); }
/** Save or unsave a research idea. The cookie is only sent to /research pages, so it adds nothing to other requests. */
export async function toggleSavedIdea(slug: string) {
  if (!bySlug(slug)) return; const jar = await cookies(), cur = parseSaved(jar.get(SAVED_COOKIE)?.value, (s) => !!bySlug(s));
  const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
  jar.set(SAVED_COOKIE, next.join(","), cookieOpts(365 * DAY, "/research"));
}
