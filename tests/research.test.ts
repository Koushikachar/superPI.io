import { describe, it, expect } from "vitest";
import { IDEAS, EVENTS, bySlug, score, phase, verdict, demandAhead } from "../src/lib/research-data";
describe("research ideas", () => {
  it("has unique slugs, 12-month curves and sane numbers", () => {
    expect(new Set(IDEAS.map((i) => i.slug)).size).toBe(IDEAS.length);
    for (const i of IDEAS) { expect(i.curve).toHaveLength(12); expect(i.curve.every((v) => v >= 1 && v <= 10)).toBe(true); expect(i.price[0]).toBeLessThan(i.price[1]); expect(i.margin[0]).toBeLessThanOrEqual(i.margin[1]); }
  });
  it("every calendar event links to a real idea and has a valid date", () => {
    for (const e of EVENTS) { expect(Number.isNaN(new Date(e.date).getTime())).toBe(false); for (const s of e.ideas) expect(bySlug(s), `${e.name} -> ${s}`).toBeTruthy(); }
  });
  it("scores stay between 0 and 100 and follow the season", () => {
    const winter = bySlug("winter-wear-hoodies-thermals-mufflers")!, nov = new Date("2026-11-04"), may = new Date("2026-05-04");
    for (const i of IDEAS) for (const d of [nov, may]) { const s = score(i, d).total; expect(s).toBeGreaterThanOrEqual(0); expect(s).toBeLessThanOrEqual(100); }
    expect(demandAhead(winter, nov)).toBeGreaterThan(demandAhead(winter, may)); expect(phase(winter, nov)).not.toBe("Off-season"); expect(phase(winter, may)).toBe("Off-season");
    expect(verdict(80)).toBe("Strong"); expect(verdict(60)).toBe("Good"); expect(verdict(30)).toBe("Watch");
  });
});
