import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { checkStrength, matchState, cleanCode } from "../src/lib/pwstrength";
const read = (f: string) => readFileSync(f, "utf8");
describe("password helpers", () => {
  it("scores length and variety, and flags the 12-character minimum", () => {
    expect(checkStrength("").label).toBe("Too short"); expect(checkStrength("short1!").long).toBe(false);
    expect(checkStrength("aaaaaaaaaaaa").label).toBe("Weak"); expect(checkStrength("abcdefghijkl").label).toBe("Okay");
    expect(checkStrength("Abcdefgh1jkl").label).toBe("Good"); expect(checkStrength("Abcdefgh1jkl!mnop").label).toBe("Strong");
  });
  it("reports match state only once the second box has text", () => {
    expect(matchState("abc", "")).toBe("empty"); expect(matchState("abc", "ab")).toBe("mismatch"); expect(matchState("abc", "abc")).toBe("match");
  });
  it("cleans pasted codes to six digits", () => { expect(cleanCode("123 456")).toBe("123456"); expect(cleanCode("12-34-56-78")).toBe("123456"); expect(cleanCode("ab1c2")).toBe("12"); });
});
describe("auth screens", () => {
  it("every password box on sign-in, sign-up and reset has the show/hide control", () => {
    for (const f of ["src/app/login/page.tsx", "src/app/register/page.tsx", "src/app/reset/page.tsx"]) expect(read(f), f).not.toMatch(/type="password"/);
    expect(read("src/components/PasswordInput.tsx")).toMatch(/aria-label=\{shown \? "Hide password" : "Show password"\}/);
  });
  it("the verify screen takes a one-time code and posts to verifyCode", () => {
    expect(read("src/components/OtpForm.tsx")).toMatch(/autoComplete="one-time-code"/); expect(read("src/app/verify/page.tsx")).toMatch(/verify=\{verifyCode\}/);
    expect(read("src/app/actions.ts")).toMatch(/verifyOtp\(/);
  });
  it("sign-up still checks the two passwords on the server", () => { expect(read("src/app/actions.ts")).toMatch(/The two passwords don't match/); });
});
