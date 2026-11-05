import { ctx } from "@/lib/ctx"; import { aiAllowed } from "@/lib/ratelimit"; import { aiReady, complete, AiError } from "@/lib/ai"; import { runChat } from "@/lib/aitools"; import { readChat } from "@/lib/chatinput"; import { assistantAnswer } from "@/lib/localanswer";
import { IDEAS, MONTHS } from "@/lib/research-data";
import { matchIdeas, guessCategory, cardFor, storeNote, opportunities, upcoming, isIdeaQuestion, localReply, MARKET_SYSTEM, TONE, type Card, type VerdictName } from "@/lib/advisor";
export const dynamic = "force-dynamic"; export const maxDuration = 60;
const VERDICTS = Object.keys(TONE) as VerdictName[], strs = (x: unknown, max: number) => (Array.isArray(x) ? x : []).map((v) => String(v).replace(/\s+/g, " ").trim()).filter(Boolean).slice(0, max).map((s) => s.slice(0, 240));
const json = (t: string) => { const m = /\{[\s\S]*\}/.exec(t.replace(/```(?:json)?/g, "")); try { return m ? JSON.parse(m[0]) : null; } catch { return null; } };
const brief = (c: Card) => ({ product: c.name, category: c.cat, verdict: c.verdict, demandScoreOutOf100: c.score, season: c.phase, peakMonth: c.peak, demandByMonth: c.curve && Object.fromEntries(c.curve.map((v, i) => [MONTHS[i], v])), currentMonth: c.nowIdx !== undefined ? MONTHS[c.nowIdx] : undefined, priceRangeRs: c.price, marginPct: c.margin, competition: c.comp, returnRisk: c.returns, shipping: c.weight, upcomingEvents: c.events, sellerAlreadyStocks: c.store, complianceNote: c.check });
/** Market Advisor endpoint. Two kinds of question: about the business's own data (the assistant, with tools that read only this organisation) and about the market / new product ideas (seasonal data + the seller's own sales, explained by the AI when it is on). */
export async function POST(req: Request) {
  let c: Awaited<ReturnType<typeof ctx>>; try { c = await ctx(); } catch { return Response.json({ error: "Sign in first" }, { status: 401 }); }
  const raw = await req.json().catch(() => null), b = readChat(raw, { keep: 10, maxChars: 800 }); if (!b.ok) return Response.json({ error: b.error }, { status: 400 });
  const mode = ["auto", "business", "idea"].includes(raw?.mode) ? (raw.mode as string) : "auto", focus = typeof raw?.focus === "string" ? raw.focus.slice(0, 80) : "", q = b.messages.at(-1)!.content, now = new Date();
  const ac = { orgId: c.orgId, orgName: c.orgName, finance: ["OWNER", "ACCOUNTANT", "ANALYST"].includes(c.role), costs: c.role !== "ORDER_STAFF" };
  const ok = aiReady() && (await aiAllowed(c.orgId).catch(() => false)), idea = mode === "idea" || (mode === "auto" && isIdeaQuestion(q));

  // ---- the business's own data
  if (!idea) {
    const local = async () => Response.json({ reply: await assistantAnswer(q, ac), source: "data" });
    if (!ok) return local(); try { return Response.json({ reply: await runChat(ac, b.messages), source: "ai" }); } catch { return local(); }
  }

  // ---- the market / a new product
  // The previous product is reused only for a short follow-up ("when should I order?", "what about margin?"), never when the person names a different product.
  const followUp = !!focus && !guessCategory(q) && (q.split(/\s+/).length <= 8 && /\b(it|this|that|them|its|margin|price|order|when|season|peak|risk|compet\w*|returns?|why|how (much|many|long))\b/i.test(q)) && !/\b(sell|selling|start|add|launch)\s+(a |an |the |some )?\w/i.test(q);
  const hit = matchIdeas(q)[0] ?? (followUp ? { idea: IDEAS.find((i) => i.slug === focus)!, pts: 0 } : undefined), match = hit?.idea ? hit : undefined;
  const store = await storeNote(c.orgId, q);
  if (match) {
    const card = cardFor(match.idea, now, store, match.pts > 0 && match.pts < 4 ? `Closest match in my market data: ${match.idea.name}.` : undefined), data = JSON.stringify({ today: now.toDateString(), thisIdea: brief(card), strongestNow: opportunities(now, 4).map((o) => ({ name: o.name, score: o.score, season: o.phase })) });
    if (ok) try {
      const m = await complete([{ role: "system", content: MARKET_SYSTEM(now.toDateString(), `The server already judged this product: verdict "${card.verdict}". You may refine it if the seller's own sales point the other way, but explain why.\nDATA: ${data}`) }, ...b.messages.slice(-6)], { temperature: 0.3, maxTokens: 520, role: "product" });
      const t = (m.content ?? "").trim(); if (t) return Response.json({ reply: t, card, source: "ai", focus: match.idea.slug });
    } catch (e) { if (!(e instanceof AiError)) console.error("[advisor]", e); }
    return Response.json({ reply: localReply(card, now), card, source: "data", focus: match.idea.slug });
  }

  // no matching idea in the data: a general "what sells now?" question, or a product the starter data does not cover
  const opps = opportunities(now, 6), ev = upcoming(now, 3), cat = guessCategory(q), generic = !/\b(sell|add|launch|stock|start|try|buy|worth|demand|profit|idea)\b/i.test(q) || /\b(what|which)\b/i.test(q) && !cat;
  if (generic) {
    const lead = `Here is what looks strongest for the next three months (${MONTHS[now.getMonth()]} to ${MONTHS[(now.getMonth() + 2) % 12]}):`, list = opps.slice(0, 5).map((o, n) => `${n + 1}. **${o.name}**: ${o.score}/100, ${o.phase.toLowerCase()}, peak ${o.peak}`).join("\n"), evs = ev.slice(0, 2).map((e) => `${e.name} ${e.live ? "is on now" : `in ${e.daysAway} days`}`).join("; ");
    if (ok) try {
      const m = await complete([{ role: "system", content: MARKET_SYSTEM(now.toDateString(), `DATA: ${JSON.stringify({ strongestNow: opps.map((o) => ({ name: o.name, category: o.cat, score: o.score, season: o.phase, peakMonth: o.peak, marginPct: o.margin, competition: o.comp })), events: ev, sellerHasSimilar: store })}`) }, ...b.messages.slice(-6)], { temperature: 0.4, maxTokens: 520, role: "product" });
      const t = (m.content ?? "").trim(); if (t) return Response.json({ reply: t, opps: opps.slice(0, 5), source: "ai" });
    } catch (e) { if (!(e instanceof AiError)) console.error("[advisor]", e); }
    return Response.json({ reply: `${lead}\n${list}${evs ? `\n\nComing up: ${evs}.` : ""}\n\nTap one to see whether it fits your business.`, opps: opps.slice(0, 5), source: "data" });
  }
  // a product we have no seasonal data for
  const near = (cat ? IDEAS.filter((i) => i.cat === cat) : []).slice(0, 3);
  if (ok) try {
    const m = await complete([{ role: "system", content: MARKET_SYSTEM(now.toDateString(), `The product is NOT in the seasonal dataset, so any verdict is an estimate from general knowledge of Indian retail. Reply with ONLY a JSON object: {"verdict": one of "Start now","Test small","Wait for season","Skip for now", "headline": one sentence, "reasons": 3-4 short strings, "risks": 2-3 short strings (regulation such as BIS/FSSAI only if it truly applies), "steps": 3 short strings with months or timeframes, "name": a short product name}.\nDATA: ${JSON.stringify({ thisMonth: MONTHS[now.getMonth()], upcomingEvents: ev, closestCategory: cat, closestKnownProducts: near.map((i) => ({ name: i.name, demandByMonth: Object.fromEntries(i.curve.map((v, k) => [MONTHS[k], v])), marginPct: i.margin, competition: i.comp })), sellerAlreadyStocks: store })}`) }, ...b.messages.slice(-4)], { temperature: 0.3, maxTokens: 600, role: "product" });
    const j = json(m.content ?? "");
    if (j && VERDICTS.includes(j.verdict)) { const card: Card = { kind: "ai", name: String(j.name || q).slice(0, 80), cat: cat ?? undefined, verdict: j.verdict, tone: TONE[j.verdict as VerdictName], headline: String(j.headline ?? "").slice(0, 240), reasons: strs(j.reasons, 5), risks: strs(j.risks, 4), steps: strs(j.steps, 5), store, matchNote: "Not in my seasonal data, so this is an AI estimate from general retail knowledge, not live market numbers." }; return Response.json({ reply: "I don't have seasonal numbers for this exact product, so here is my best estimate:", card, source: "ai" }); }
    const t = (m.content ?? "").trim(); if (t) return Response.json({ reply: t, source: "ai" });
  } catch (e) { if (!(e instanceof AiError)) console.error("[advisor]", e); }
  return Response.json({ reply: `I don't have seasonal data for that exact product${cat ? `, but it looks like ${cat}` : ""}. ${near.length ? `Closest I can check: ${near.map((i) => i.name).join(", ")}.` : ""} For a full read on a brand-new product, the AI needs to be switched on (add a free GROQ_API_KEY or GEMINI_API_KEY).${store?.similar ? ` You already stock ${store.similar} similar item${store.similar === 1 ? "" : "s"}.` : ""}`, opps: near.length ? opportunities(now, 40).filter((o) => near.some((n) => n.slug === o.slug)).slice(0, 3) : opps.slice(0, 3), source: "data" });
}
