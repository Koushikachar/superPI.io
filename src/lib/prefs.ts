/** The only cookies this site sets besides the sign-in cookies. All are set by the SERVER (HttpOnly, SameSite=Lax, Secure in production), never by page scripts, and read on the server so pages arrive already themed and with the right banner state (no flash, no layout jump). */
export const CONSENT_COOKIE = "d2h_consent", THEME_COOKIE = "d2h_theme", SAVED_COOKIE = "d2h_saved";
export type Consent = "granted" | "denied";
export type Theme = "light" | "dark";
export const DAY = 86_400;
export const parseConsent = (v?: string | null): Consent | null => (v === "granted" || v === "denied" ? v : null);
export const parseTheme = (v?: string | null): Theme | null => (v === "dark" || v === "light" ? v : null);
/** A comma list of idea slugs: only known slugs, no duplicates, at most 40 (keeps the cookie under 1 KB). */
export const parseSaved = (v: string | null | undefined, known: (s: string) => boolean): string[] => [...new Set((v ?? "").split(",").map((s) => s.trim()).filter((s) => /^[a-z0-9-]{1,60}$/.test(s) && known(s)))].slice(0, 40);
export const cookieOpts = (maxAge: number, path = "/") => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path, maxAge });
