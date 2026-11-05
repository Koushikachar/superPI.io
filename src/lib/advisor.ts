import { db } from "./db";
import { IDEAS, CATS, MONTHS, EVENTS, score, phase, avgMargin, peakMonth, sourceBy, type Idea } from "./research-data";
/** Market Advisor: "will this sell right now?" for products you already stock and for ideas you do not have yet.
 *  HONEST ABOUT ITS LIMITS: there is no live market feed. The forecast combines (1) the seasonal demand curves and margins in research-data.ts (rough Indian-market estimates, edit them freely)
 *  with (2) your own sales history. The AI, when it is switched on, explains and reasons over exactly these numbers; it cannot browse the web or see competitors' live prices. */
export type Tone = "ok" | "info" | "warn" | "bad";
export type VerdictName = "Start now" | "Test small" | "Wait for season" | "Skip for now";
export type Card = {
  kind: "data" | "ai"; name: string; cat?: string; verdict: VerdictName; tone: Tone; headline: string; score?: number; phase?: string; curve?: number[]; nowIdx?: number; peak?: string;
  price?: [number, number]; margin?: [number, number]; comp?: string; returns?: string; weight?: string; reasons: string[]; risks: string[]; steps: string[];
  events?: { name: string; date: string; daysAway: number; orderBy: string | null }[]; store?: { similar: number; sold90: number; names: string[] }; check?: string; matchNote?: string;
};
export const TONE: Record<VerdictName, Tone> = { "Start now": "ok", "Test small": "info", "Wait for season": "warn", "Skip for now": "bad" };
const DAY = 864e5, STOP = new Set("a an the and or of for to in on at is are can could should would will i we you my our me do does did sell selling start starting add stock buy new product products item items idea about with this that it be get make from any have has how what which good best worth profitable market now today right time season please tell want like think thinking if are there some one".split(" "));
const stem = (w: string) => (w.length > 4 && /(ch|sh|x|z)es$/.test(w) ? w.slice(0, -2) : w.length > 3 && w.endsWith("ies") ? w.slice(0, -3) + "y" : w.length > 3 && w.endsWith("s") && !w.endsWith("ss") ? w.slice(0, -1) : w);
export const words = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean).map(stem);
const content = (t: string) => words(t).filter((w) => !STOP.has(w) && w.length > 1);
/** Extra words people use for each idea (matched against the idea's name). */
const KW: [string, string][] = [
  ["led string", "fairy light lighting bulb decor diwali christmas lamp lantern torana"], ["diyas", "diya candle deepam tealight decoration diwali"], ["rakhi", "rakhi rakshabandhan raksha bandhan hamper sister brother"],
  ["ethnic wear", "kurta lehenga saree sherwani festive wedding dress suit salwar sharara indo western"], ["cotton kurti", "kurti kurta top tunic women"], ["winter wear", "hoodie sweater jacket thermal muffler sweatshirt cap woolen shawl gloves"],
  ["raincoat", "rain umbrella monsoon poncho"], ["artificial jewel", "earring necklace bangle jhumka bracelet ring anklet imitation fashion jewellery jewelry"], ["handbag", "bag purse wallet clutch sling backpack tote"],
  ["sunscreen", "sun spf tan lotion skincare skin"], ["body lotion", "moisturiser moisturizer cream winter lip balm vaseline"], ["hair oil", "hair shampoo ayurvedic coconut amla onion"], ["perfume", "fragrance attar deo deodorant mist scent"],
  ["natural soap", "soap facewash face wash skincare handmade organic"], ["yoga mat", "gym fitness band workout exercise dumbbell resistance"], ["herbal tea", "tea green wellness immunity kadha detox"],
  ["cooling", "neck fan towel summer heat"], ["phone case", "cover screen guard tempered glass mobile protector"], ["power bank", "charger cable adapter fast charging battery"], ["bluetooth speaker", "earbud earphone headphone tws airpod neckband audio"],
  ["smartwatch", "watch fitness band tracker wearable"], ["rechargeable lamp", "desk light study lamp emergency lantern"], ["grooming", "trimmer beard shaver razor men"], ["kitchen organis", "container storage jar box rack spice"],
  ["blender", "gadget chopper juicer mixer kitchen tool"], ["insulated bottle", "water bottle flask tiffin lunch box steel"], ["bedsheet", "bed sheet linen pillow cover curtain blanket quilt comforter cushion"],
  ["indoor plant", "plant planter pot garden seed gardening"], ["cleaning", "mop brush scrubber wiper cleaning tool"], ["handmade", "craft resin decor art clay macrame frame"], ["pooja", "puja thali idol brass diya aarti temple god"],
  ["dry fruit", "almond cashew nut gift box sweets mithai chocolate hamper"], ["christmas", "xmas new year tree santa party decor"], ["valentine", "personalised personalized gift photo mug cushion couple"],
  ["toys", "toy kids learning game puzzle blocks children"], ["stationery", "pen notebook school art craft supplies pencil colour"], ["baby", "infant diaper newborn toddler"], ["pet", "dog cat leash collar bed bowl puppy"], ["car accessor", "car mobile holder organiser seat cover perfume"],
];
const kwFor = (i: Idea) => KW.filter(([n]) => i.name.toLowerCase().includes(n)).map(([, w]) => w).join(" ");
const index = IDEAS.map((i) => ({ i, name: new Set(content(i.name)), kw: new Set(content(kwFor(i))), cat: new Set(content(i.cat)) }));
/** Best-matching known ideas for free text. Needs a real word overlap, so unrelated products return nothing. */
export function matchIdeas(text: string, take = 3): { idea: Idea; pts: number }[] {
  const q = [...new Set(content(text))]; if (!q.length) return [];
  return index.map((x) => ({ idea: x.i, pts: q.reduce((t, w) => t + (x.name.has(w) ? 3 : 0) + (x.kw.has(w) ? 2 : 0) + (x.cat.has(w) ? 0.5 : 0), 0) })).filter((m) => m.pts >= 2).sort((a, b) => b.pts - a.pts).slice(0, take);
}
export const guessCategory = (text: string) => { const q = new Set(content(text)); let best: { c: string; n: number } | null = null; for (const c of CATS) { const n = IDEAS.filter((i) => i.cat === c).reduce((t, i) => t + [...q].filter((w) => index.find((x) => x.i === i)!.kw.has(w) || index.find((x) => x.i === i)!.name.has(w)).length, 0); if (n && (!best || n > best.n)) best = { c, n }; } return best?.c ?? null; };

const m3 = (i: Idea, now: Date, k: number) => i.curve[(now.getMonth() + k) % 12];
const monthName = (m: number) => MONTHS[((m % 12) + 12) % 12];
/** Is the idea something to start now, test small, wait for, or skip? Plain rules, so the reason can always be explained. */
export function judge(i: Idea, now = new Date()): { verdict: VerdictName; headline: string; reasons: string[]; risks: string[]; steps: string[]; nextRise: number | null } {
  const s = score(i, now), ph = phase(i, now), mean = i.curve.reduce((a, b) => a + b, 0) / 12, m = now.getMonth(), cur = i.curve[m], next = m3(i, now, 1), after = m3(i, now, 2), peak = peakMonth(i);
  let nextRise: number | null = null; for (let k = 1; k <= 11; k++) if (i.curve[(m + k) % 12] >= Math.max(mean * 1.25, 6)) { nextRise = (m + k) % 12; break; }
  const reasons: string[] = [], risks: string[] = [], steps: string[] = [];
  const mg = `${i.margin[0]}% to ${i.margin[1]}%`;
  let verdict: VerdictName, headline: string;
  const peakEnding = cur >= 8 && next <= cur - 2 && after <= cur - 3;
  if (ph === "Off-season" || (cur <= mean * 0.6 && next <= mean * 0.8)) {
    verdict = s.total >= 62 && nextRise !== null ? "Wait for season" : "Skip for now";
    headline = nextRise !== null ? `Demand is low now. It picks up around ${monthName(nextRise)}.` : "Demand is low and there is no strong season ahead.";
    reasons.push(`Demand score for the next 3 months is ${s.parts.demand.toFixed(1)} out of 10, below this product's yearly average of ${mean.toFixed(1)}.`);
    if (nextRise !== null) { steps.push(`Place the first order about 6 to 8 weeks before ${monthName(nextRise)} so stock lands before buyers start searching.`); steps.push("Until then, test with a small batch or a photo-only listing to learn which designs get clicks."); }
    else steps.push("Pick a product with a season coming up instead (see the opportunities list).");
  } else if (peakEnding) {
    verdict = "Wait for season"; headline = `Peak is ending. Starting now means selling into falling demand; plan for next ${monthName(peak)}.`;
    reasons.push(`Demand is at ${cur} out of 10 this month but drops to ${next} next month and ${after} after that.`);
    steps.push(`Only continue if a supplier can deliver within 1 to 2 weeks; otherwise prepare for next season.`, "If you already have stock, discount it early rather than carrying it through the off-season.");
  } else if (ph === "Peak season" || ph === "Heating up") {
    verdict = s.total >= 55 ? "Start now" : "Test small";
    headline = ph === "Peak season" ? "It is peak season now. Move fast, with stock you can get within 2 weeks." : `Demand is climbing. Peak is ${monthName(peak)}, so this is the right time to source.`;
    reasons.push(`Demand score for the next 3 months is ${s.parts.demand.toFixed(1)} out of 10 (yearly average ${mean.toFixed(1)}). Season phase: ${ph.toLowerCase()}.`);
    steps.push(ph === "Peak season" ? "Order a small first batch from a ready-stock supplier. Do not wait for custom orders." : "Source now. Allow 3 to 5 weeks for supplier and shipping.", "List with a clear first photo and a delivery-by-date promise.");
  } else {
    verdict = s.total >= 62 ? "Start now" : "Test small"; headline = s.total >= 62 ? "Steady all-year demand with decent economics." : "Demand is steady but not special. Try a small batch first.";
    reasons.push(`Demand is steady through the year (about ${mean.toFixed(1)} out of 10), so timing matters less than price and quality.`);
    steps.push("Start with 20 to 50 units of 2 or 3 variants and see what repeats.");
  }
  reasons.push(`Typical margin is ${mg}.${avgMargin(i) >= 45 ? " That leaves room for ads and returns." : avgMargin(i) < 30 ? " That is thin once ads and returns are counted." : ""}`);
  if (i.comp === "High") { reasons.push("Many sellers already offer this, so you need a clear edge: a bundle, better photos, faster delivery or a niche."); if (verdict === "Start now" && avgMargin(i) < 40) verdict = "Test small"; }
  else if (i.comp === "Low") reasons.push("Few sellers compete here, which helps new listings get seen.");
  if (i.returns === "High") risks.push("Return rate is usually high. Size charts, real photos and careful packing matter."); else if (i.returns === "Medium") risks.push("Some returns are normal (breakage or fit). Pack well and describe sizes clearly.");
  if (i.weight === "Bulky") risks.push("Bulky parcels cost more to ship, which eats margin."); if (i.check) risks.push(i.check);
  if (!risks.length) risks.push("No major flags in the starter data. Still check your own supplier quality before a big order.");
  steps.push(i.tip);
  return { verdict, headline, reasons, risks, steps, nextRise };
}
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
export function eventsFor(i: Idea, now = new Date()) {
  const t = today0();
  return EVENTS.filter((e) => e.ideas.includes(i.slug)).map((e) => ({ e, start: new Date(e.date + "T00:00:00"), end: new Date((e.end ?? e.date) + "T00:00:00") })).filter((x) => x.end >= t && x.start.getTime() - t.getTime() < 200 * DAY)
    .sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 2).map(({ e, start }) => { const by = sourceBy(e, 45); return { name: e.name, date: e.date, daysAway: Math.max(0, Math.round((start.getTime() - t.getTime()) / DAY)), orderBy: by.getTime() > t.getTime() ? by.toISOString().slice(0, 10) : null }; });
}
/** What you already stock that is similar to the idea, and how it sold. Never throws: a failed lookup just means no store note. */
export async function storeNote(orgId: string, text: string): Promise<Card["store"] | undefined> {
  try {
    const q = [...new Set(content(text))].filter((w) => w.length > 2); if (!q.length) return undefined;
    const ps = await db.product.findMany({ where: { orgId, archived: false, OR: q.slice(0, 6).map((w) => ({ name: { contains: w, mode: "insensitive" as const } })) }, select: { id: true, name: true }, take: 12 }); if (!ps.length) return { similar: 0, sold90: 0, names: [] };
    const g = await db.orderLine.groupBy({ by: ["productId"], where: { productId: { in: ps.map((p: { id: string }) => p.id) }, order: { orgId, status: { in: ["DISPATCHED", "DELIVERED"] }, createdAt: { gte: new Date(Date.now() - 90 * DAY) } } }, _sum: { qty: true } });
    return { similar: ps.length, sold90: g.reduce((t: number, x: { _sum: { qty: number | null } }) => t + (x._sum.qty ?? 0), 0), names: ps.slice(0, 3).map((p: { name: string }) => p.name) };
  } catch { return undefined; }
}
export function cardFor(i: Idea, now = new Date(), store?: Card["store"], matchNote?: string): Card {
  const j = judge(i, now), s = score(i, now), ev = eventsFor(i, now), soon = ev.find((e) => e.daysAway <= 14 && e.daysAway > 0);
  if (soon && (j.verdict === "Wait for season" || j.verdict === "Skip for now")) j.reasons.push(`${soon.name} is only ${soon.daysAway} day${soon.daysAway === 1 ? "" : "s"} away, so only stock that is already in hand will reach buyers in time.`);
  return { kind: "data", name: i.name, cat: i.cat, verdict: j.verdict, tone: TONE[j.verdict], headline: j.headline, score: s.total, phase: phase(i, now), curve: i.curve, nowIdx: now.getMonth(), peak: MONTHS[peakMonth(i)], price: i.price, margin: i.margin, comp: i.comp, returns: i.returns, weight: i.weight,
    reasons: [i.why, ...j.reasons], risks: j.risks, steps: j.steps, events: ev, store, check: i.check, matchNote };
}
/** The strongest ideas for the next 3 months, with where they are in their season. Powers the "selling now" list. */
export function opportunities(now = new Date(), take = 8) {
  return IDEAS.map((i) => ({ i, s: score(i, now).total, ph: phase(i, now), j: judge(i, now) })).filter((x) => x.j.verdict === "Start now" || x.j.verdict === "Test small").sort((a, b) => b.s - a.s).slice(0, take)
    .map(({ i, s, ph, j }) => ({ slug: i.slug, name: i.name, cat: i.cat, score: s, phase: ph, verdict: j.verdict, curve: i.curve, margin: i.margin, comp: i.comp, peak: MONTHS[peakMonth(i)], why: i.why }));
}
export function upcoming(now = new Date(), take = 4) {
  const t = today0(); return EVENTS.map((e) => ({ e, start: new Date(e.date + "T00:00:00"), end: new Date((e.end ?? e.date) + "T00:00:00") })).filter((x) => x.end >= t).sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, take)
    .map(({ e, start }) => { const d = Math.round((start.getTime() - t.getTime()) / DAY); return { name: e.name, date: e.date, daysAway: Math.max(0, d), live: d <= 0, note: e.note, approx: !!e.approx, ideas: e.ideas.map((s) => IDEAS.find((i) => i.slug === s)?.name).filter((x): x is string => !!x).slice(0, 3) }; });
}
const IDEA_RE = /\b(new product|new idea|idea|launch|start (selling|a|an|with)|begin selling|should i (sell|add|stock|start|launch|try|get|buy)|can i sell|will (it|this|that|these|they|\w+( \w+)?) sell|would (it|this|that) sell|worth|demand for|trend(ing|s)?|in demand|season(al)?|festival|diwali|christmas|what (can|should|to) (i )?(sell|stock|add|launch|start)|which product.*(sell|add|launch)|market|forecast|predict|profitable|good (time|product)|best.*(sell|product)|selling (well|fast)|hot (product|item))\b/i;
/** Does the question look like it is about the outside market / a new product, rather than the business's own numbers? */
export const looksLikeIdea = (t: string) => IDEA_RE.test(t) && !/\b(my|our)\s+(stock|inventory|orders?|invoices?|customers?|suppliers?|sales|dues?)\b/i.test(t);
const BIZ_RE = /\b(my|our|stock|inventory|orders?|invoices?|customers?|suppliers?|dues?|owe[sd]?|sold|sales|low|running|reorder|batch(es)?|serial|returns?|receipts?|bills?|warehouse|dispatch(ed)?|pending|unpaid|latest|recent)\b/i;
/** A question about the market or a new product: either it says so, or it is just a product name ("wireless earbuds") that we have market data for. Anything that sounds like the seller's own records goes to the business assistant. */
export const isIdeaQuestion = (t: string) => looksLikeIdea(t) || (!BIZ_RE.test(t) && (matchIdeas(t)[0]?.pts ?? 0) >= 3);
/** A plain-text reply used when the AI is off or busy. Built only from the numbers above. */
export function localReply(c: Card, now = new Date()) {
  const bits = [`**${c.verdict}.** ${c.headline}`];
  if (c.score !== undefined) bits.push(`${c.name} scores ${c.score} out of 100 for the next 3 months (${(c.phase ?? "").toLowerCase()}). Peak demand is in ${c.peak}.${c.margin ? ` Typical margin ${c.margin[0]}% to ${c.margin[1]}%, competition ${String(c.comp).toLowerCase()}.` : ""}`);
  if (c.events?.[0]) bits.push(`Next event: ${c.events[0].name} in ${c.events[0].daysAway} days${c.events[0].orderBy ? `, so order by ${c.events[0].orderBy}` : ""}.`);
  if (c.store) bits.push(c.store.similar ? `You already stock ${c.store.similar} similar item${c.store.similar === 1 ? "" : "s"} and sold ${c.store.sold90} units of them in the last 90 days.` : "You don't stock anything similar yet, so this would be a new line for you.");
  void now; return bits.join("\n\n");
}
export const MARKET_SYSTEM = (today: string, extra: string) => `You are the Market Advisor inside an inventory app for a small Indian online seller. Today is ${today}.
You can NOT browse the web or see live prices or competitors. Your evidence is the JSON below (seasonal demand curves 0-10 per month, margins, competition, upcoming Indian festivals, and the seller's own sales) plus general knowledge of Indian retail. Say "estimate" when you go beyond the JSON. Never invent market-size numbers, competitor prices or statistics.
Start with a clear verdict: Start now / Test small / Wait for season / Skip for now. Then 3 to 5 short reasons that quote the numbers, the main risks (include BIS, FSSAI, CDSCO or AYUSH rules only where they really apply), and concrete next steps with dates or months. Be direct and brief, under 170 words, short lines starting with a dash. Reply in the language the person writes in.
${extra}`;
