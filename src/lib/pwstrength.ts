/** Password helpers shared by the sign-up and reset screens. The 12-character minimum is what the server enforces (see lib/password.ts); the score is only advice shown while typing. */
export const MIN_PASSWORD = 12;

export type PwCheck = { long: boolean; mixed: boolean; score: 0 | 1 | 2 | 3 | 4; label: "Too short" | "Weak" | "Okay" | "Good" | "Strong" };

export function checkStrength(pw: string): PwCheck {
  const long = pw.length >= MIN_PASSWORD;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(pw)).length;
  const mixed = kinds >= 3;
  if (!pw.length || !long) return { long, mixed, score: pw.length ? 1 : 0, label: pw.length ? "Too short" : "Too short" };
  if (/^(.)\1+$/.test(pw)) return { long, mixed, score: 1, label: "Weak" };
  let s = 2; // 12+ characters already
  if (kinds >= 3) s++;
  if (pw.length >= 16) s++;
  const score = Math.min(4, s) as 2 | 3 | 4;
  return { long, mixed, score, label: score === 2 ? "Okay" : score === 3 ? "Good" : "Strong" };
}

/** "empty" until the second box has something in it, so nobody sees an error before they start typing. */
export function matchState(pw: string, confirm: string): "empty" | "match" | "mismatch" {
  if (!confirm) return "empty";
  return pw === confirm ? "match" : "mismatch";
}

/** Keeps only digits and cuts to the code length: pasted "123 456", "123-456" or a keyboard autofill all become 123456. */
export const cleanCode = (v: string, len = 6) => v.replace(/\D/g, "").slice(0, len);
