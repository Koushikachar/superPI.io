// Guard: Direct2Hub must never use browser storage (localStorage, sessionStorage, IndexedDB). Every cookie is set by the server (HttpOnly); page scripts never write cookies.
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";
const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.(ts|tsx|js|jsx)$/.test(p) ? [p] : []; });
const BAD = /\b(localStorage|sessionStorage|indexedDB)\s*[.\[]|["'](localStorage|sessionStorage)["']|createBrowserClient/;
const COOKIE_WRITE = /document\.cookie\s*=/;
describe("no browser storage", () => {
  it("page scripts never write cookies (sign-in cookies are set by the server, HttpOnly)", () => {
    expect(walk("src").filter((f) => COOKIE_WRITE.test(readFileSync(f, "utf8")))).toEqual([]);
  });
  it("source code never touches localStorage, sessionStorage or IndexedDB", () => {
    const hits = walk("src").filter((f) => BAD.test(readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")));
    expect(hits).toEqual([]);
  });
});
