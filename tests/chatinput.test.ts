import { describe, it, expect } from "vitest";
import { readChat } from "../src/lib/chatinput";
const o = { keep: 8, maxChars: 400 };
describe("readChat", () => {
  it("accepts a first question", () => { const r = readChat({ messages: [{ role: "user", content: "What does Direct2Hub do?" }] }, o); expect(r.ok && r.messages.length).toBe(1); });
  it("does not reject a long earlier answer or a long history", () => {
    const h = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "x".repeat(900) })); h.push({ role: "user", content: "next?" });
    const r = readChat({ messages: h }, o); expect(r.ok).toBe(true); if (r.ok) { expect(r.messages.length).toBeLessThanOrEqual(8); expect(r.messages[0].role).toBe("user"); expect(r.messages.every((m) => m.content.length <= 400)).toBe(true); }
  });
  it("drops an unanswered earlier question", () => { const r = readChat({ messages: [{ role: "user", content: "a" }, { role: "user", content: "b" }] }, o); expect(r.ok && r.messages.map((m) => m.content)).toEqual(["b"]); });
  it("explains empty and too-long questions", () => {
    expect(readChat({ messages: [{ role: "user", content: "   " }] }, o)).toEqual({ ok: false, error: "Type a question first." });
    const r = readChat({ messages: [{ role: "user", content: "y".repeat(401) }] }, o); expect(!r.ok && r.error).toMatch(/under 400/);
  });
  it("survives garbage", () => { expect(readChat(null, o).ok).toBe(false); expect(readChat({ messages: "x" }, o).ok).toBe(false); });
});
