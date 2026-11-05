import { describe, it, expect, vi } from "vitest";
vi.mock("../src/lib/db", () => ({ db: {} }));
import { matchIdeas, judge, cardFor, isIdeaQuestion, opportunities } from "../src/lib/advisor";
const NOV = new Date("2026-11-04T10:00:00"), JUN = new Date("2026-06-10T10:00:00");
describe("market advisor", () => {
  it("finds the right product from everyday words", () => {
    expect(matchIdeas("Should I sell fairy lights for diwali?")[0].idea.name).toBe("LED string lights");
    expect(matchIdeas("is a smartwatch worth adding")[0].idea.name).toMatch(/Smartwatches/);
    expect(matchIdeas("quantum flux capacitor")).toEqual([]);
  });
  it("tells market questions from questions about your own records", () => {
    expect(isIdeaQuestion("What can I sell right now?")).toBe(true);
    expect(isIdeaQuestion("wireless earbuds")).toBe(true);
    expect(isIdeaQuestion("Which products are running low?")).toBe(false);
    expect(isIdeaQuestion("how many orders did I get yesterday")).toBe(false);
  });
  it("follows the season: winter wear is a go in November and not in June", () => {
    const w = matchIdeas("winter hoodies")[0].idea;
    expect(judge(w, NOV).verdict).toBe("Start now");
    expect(["Wait for season", "Skip for now"]).toContain(judge(w, JUN).verdict);
  });
  it("does not push seasonal stock at the end of its peak", () => {
    vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(NOV); // event dates are measured from "today", so pin it
    try {
    const c = cardFor(matchIdeas("led string lights")[0].idea, NOV);
    expect(c.verdict).toBe("Wait for season");
    expect(c.reasons.join(" ")).toMatch(/Diwali is only 4 days away/);
    } finally { vi.useRealTimers(); }
  });
  it("lists only ideas worth acting on, best first", () => {
    const o = opportunities(NOV, 8); expect(o.length).toBeGreaterThan(3);
    expect(o.every((x) => x.verdict !== "Skip for now" && x.verdict !== "Wait for season")).toBe(true);
    expect(o.map((x) => x.score)).toEqual([...o.map((x) => x.score)].sort((a, b) => b - a));
  });
});
