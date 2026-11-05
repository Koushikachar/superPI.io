import { Prisma } from "@prisma/client"; import { db } from "./db";
/** Trends from the business's OWN orders, customers and returns (like a store-level "trends" dashboard). Everything is summed inside PostgreSQL, so it stays fast as data grows.
 *  Orders that count: confirmed, dispatched and delivered. Times are shown in Indian time (IST). */
export const RANGES = [{ days: 30, label: "Last 30 days" }, { days: 90, label: "Last 3 months" }, { days: 180, label: "Last 6 months" }, { days: 365, label: "Last 12 months" }];
export type Filters = { days: number; state: string };
export const parseFilters = (sp: { range?: string; state?: string }): Filters => ({ days: RANGES.some((r) => String(r.days) === sp.range) ? Number(sp.range) : 90, state: (sp.state ?? "").slice(0, 60) });
export const qs = (f: Filters) => `?range=${f.days}${f.state ? `&state=${encodeURIComponent(f.state)}` : ""}`;
const n = (x: unknown) => Number(x ?? 0), r1 = (x: number) => Math.round(x * 10) / 10;
export const pct = (cur: number, prev: number): number | null => (prev > 0 ? r1(((cur - prev) / prev) * 100) : null);
const COUNTED = Prisma.sql`o.status::text IN ('CONFIRMED','DISPATCHED','DELIVERED')`, IST = Prisma.sql`((o."createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata')`;
const stateSql = (state: string) => (state === "Not set" ? Prisma.sql`AND c.state IS NULL` : state ? Prisma.sql`AND c.state = ${state}` : Prisma.empty);
export type Analytics = Awaited<ReturnType<typeof loadAnalytics>>;
export async function loadAnalytics(orgId: string, f: Filters) {
  const unit = Prisma.raw(f.days > 120 ? "'week'" : "'day'"), now = new Date(), start = new Date(now.getTime() - f.days * 864e5), prevStart = new Date(start.getTime() - f.days * 864e5), st = stateSql(f.state);
  const O = Prisma.sql`FROM "Order" o LEFT JOIN "Customer" c ON c.id = o."customerId" WHERE o."orgId" = ${orgId} AND ${COUNTED} ${st}`;
  const [kpi, series, dist, timing, prods, groups, custs, geo, ret, retTop, states, soldRow] = await Promise.all([
    db.$queryRaw<{ p: string; orders: bigint; gmv: unknown; unpaid: bigint; partial: bigint; buyers: bigint }[]>`SELECT CASE WHEN o."createdAt" >= ${start} THEN 'cur' ELSE 'prev' END AS p, COUNT(*) AS orders, COALESCE(SUM(o.total),0) AS gmv, COUNT(*) FILTER (WHERE o."paymentStatus"::text = 'UNPAID') AS unpaid, COUNT(*) FILTER (WHERE o."paymentStatus"::text = 'PARTIAL') AS partial, COUNT(DISTINCT COALESCE(o."customerId", o.customer)) AS buyers ${O} AND o."createdAt" >= ${prevStart} GROUP BY 1`,
    db.$queryRaw<{ d: string; orders: bigint; gmv: unknown }[]>`SELECT to_char(date_trunc(${unit}, ${IST}), 'DD Mon') AS d, COUNT(*) AS orders, COALESCE(SUM(o.total),0) AS gmv ${O} AND o."createdAt" >= ${start} GROUP BY date_trunc(${unit}, ${IST}) ORDER BY date_trunc(${unit}, ${IST})`,
    db.$queryRaw<{ b: number; n: bigint }[]>`SELECT CASE WHEN o.total < 250 THEN 0 WHEN o.total < 500 THEN 1 WHEN o.total < 1000 THEN 2 WHEN o.total < 2000 THEN 3 WHEN o.total < 5000 THEN 4 ELSE 5 END AS b, COUNT(*) AS n ${O} AND o."createdAt" >= ${start} GROUP BY 1 ORDER BY 1`,
    db.$queryRaw<{ dow: number; blk: number; n: bigint }[]>`SELECT EXTRACT(DOW FROM ${IST})::int AS dow, (EXTRACT(HOUR FROM ${IST})::int / 6) AS blk, COUNT(*) AS n ${O} AND o."createdAt" >= ${start} GROUP BY 1, 2`,
    db.$queryRaw<{ id: string; name: string; sku: string; rev: unknown; units: unknown; prev_rev: unknown; prev_units: unknown; cost: unknown }[]>`SELECT p.id, p.name, p.sku, COALESCE(SUM(l.qty * l."unitPrice") FILTER (WHERE o."createdAt" >= ${start}),0) AS rev, COALESCE(SUM(l.qty) FILTER (WHERE o."createdAt" >= ${start}),0) AS units, COALESCE(SUM(l.qty * l."unitPrice") FILTER (WHERE o."createdAt" < ${start}),0) AS prev_rev, COALESCE(SUM(l.qty) FILTER (WHERE o."createdAt" < ${start}),0) AS prev_units, COALESCE(SUM(l.qty * p."unitCost") FILTER (WHERE o."createdAt" >= ${start}),0) AS cost FROM "Order" o LEFT JOIN "Customer" c ON c.id = o."customerId" JOIN "OrderLine" l ON l."orderId" = o.id JOIN "Product" p ON p.id = l."productId" WHERE o."orgId" = ${orgId} AND ${COUNTED} ${st} AND o."createdAt" >= ${prevStart} GROUP BY p.id, p.name, p.sku`,
    db.$queryRaw<{ g: string; rev: unknown; units: unknown }[]>`SELECT COALESCE(p."groupName", p.name) AS g, SUM(l.qty * l."unitPrice") AS rev, SUM(l.qty) AS units FROM "Order" o LEFT JOIN "Customer" c ON c.id = o."customerId" JOIN "OrderLine" l ON l."orderId" = o.id JOIN "Product" p ON p.id = l."productId" WHERE o."orgId" = ${orgId} AND ${COUNTED} ${st} AND o."createdAt" >= ${start} GROUP BY 1 ORDER BY rev DESC LIMIT 12`,
    db.$queryRaw<{ k: string; name: string; orders: bigint; spend: unknown; first_at: Date; last_at: Date; ords_in: bigint }[]>`SELECT COALESCE(o."customerId", o.customer) AS k, MAX(o.customer) AS name, COUNT(*) AS orders, COALESCE(SUM(o.total),0) AS spend, MIN(o."createdAt") AS first_at, MAX(o."createdAt") AS last_at, COUNT(*) FILTER (WHERE o."createdAt" >= ${start}) AS ords_in ${O} GROUP BY 1`,
    db.$queryRaw<{ s: string; orders: bigint; gmv: unknown; buyers: bigint }[]>`SELECT COALESCE(c.state, 'Not set') AS s, COUNT(*) AS orders, COALESCE(SUM(o.total),0) AS gmv, COUNT(DISTINCT COALESCE(o."customerId", o.customer)) AS buyers ${O} AND o."createdAt" >= ${start} GROUP BY 1 ORDER BY gmv DESC`,
    db.$queryRaw<{ reason: string; qty: unknown }[]>`SELECT COALESCE(NULLIF(LOWER(TRIM(r.reason)), ''), 'no reason given') AS reason, SUM(r.qty) AS qty FROM "Return" r WHERE r."orgId" = ${orgId} AND r."createdAt" >= ${start} GROUP BY 1 ORDER BY qty DESC LIMIT 8`,
    db.$queryRaw<{ name: string; sku: string; qty: unknown }[]>`SELECT p.name, p.sku, SUM(r.qty) AS qty FROM "Return" r JOIN "Product" p ON p.id = r."productId" WHERE r."orgId" = ${orgId} AND r."createdAt" >= ${start} GROUP BY p.id, p.name, p.sku ORDER BY qty DESC LIMIT 8`,
    db.$queryRaw<{ s: string }[]>`SELECT DISTINCT c.state AS s FROM "Customer" c WHERE c."orgId" = ${orgId} AND c.state IS NOT NULL ORDER BY 1`,
    db.$queryRaw<{ u: unknown }[]>`SELECT COALESCE(SUM(l.qty),0) AS u FROM "Order" o LEFT JOIN "Customer" c ON c.id = o."customerId" JOIN "OrderLine" l ON l."orderId" = o.id WHERE o."orgId" = ${orgId} AND ${COUNTED} ${st} AND o."createdAt" >= ${start}`,
  ]);
  const cur = kpi.find((k) => k.p === "cur"), prev = kpi.find((k) => k.p === "prev"), orders = n(cur?.orders), gmv = n(cur?.gmv), pOrders = n(prev?.orders), pGmv = n(prev?.gmv), aov = orders ? gmv / orders : 0, pAov = pOrders ? pGmv / pOrders : 0;
  const unitsSold = n(soldRow[0]?.u), retUnits = ret.reduce((t, r) => t + n(r.qty), 0);
  const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], BLK = ["12 to 6 AM", "6 AM to 12", "12 to 6 PM", "6 PM to 12"], heat = DAY.map((_, d) => [0, 1, 2, 3].map((b) => n(timing.find((t) => t.dow === d && t.blk === b)?.n)));
  const bands = ["Under ₹250", "₹250 to 500", "₹500 to 1,000", "₹1,000 to 2,000", "₹2,000 to 5,000", "₹5,000 and above"], distOut = bands.map((label, i) => ({ label, n: n(dist.find((x) => x.b === i)?.n) }));
  const products = prods.map((p) => ({ id: p.id, name: p.name, sku: p.sku, rev: n(p.rev), units: n(p.units), prevRev: n(p.prev_rev), prevUnits: n(p.prev_units), profit: n(p.rev) - n(p.cost), growth: pct(n(p.rev), n(p.prev_rev)) })).filter((p) => p.rev > 0 || p.prevRev > 0);
  const inRange = custs.filter((c) => n(c.ords_in) > 0), fresh = inRange.filter((c) => c.first_at >= start), repeat = inRange.length - fresh.length, spends = inRange.map((c) => n(c.spend)).sort((a, b) => b - a), p80 = spends[Math.floor(spends.length * 0.2)] ?? Infinity;
  const seg = { "Big spenders": 0, "Frequent buyers": 0, "New this period": 0, "Slipping away": 0, "Occasional": 0 } as Record<string, number>;
  for (const c of custs) { const inR = n(c.ords_in) > 0, days = (now.getTime() - c.last_at.getTime()) / 864e5; if (!inR) { if (n(c.orders) >= 2 && days > 60 && days < 365) seg["Slipping away"]++; continue; } if (c.first_at >= start) seg["New this period"]++; else if (n(c.spend) >= p80 && spends.length >= 5) seg["Big spenders"]++; else if (n(c.orders) >= 3) seg["Frequent buyers"]++; else seg["Occasional"]++; }
  return {
    f, now, start, hasData: orders > 0 || pOrders > 0, states: states.map((s) => s.s),
    kpi: { gmv, gmvDelta: pct(gmv, pGmv), orders, ordersDelta: pct(orders, pOrders), aov, aovDelta: pct(aov, pAov), buyers: n(cur?.buyers), unpaidPct: orders ? r1((100 * n(cur?.unpaid)) / orders) : 0, partialPct: orders ? r1((100 * n(cur?.partial)) / orders) : 0, returnPct: f.state ? null : unitsSold ? r1((100 * retUnits) / unitsSold) : 0, retUnits: f.state ? 0 : retUnits, unitsSold, repeatPct: inRange.length ? r1((100 * repeat) / inRange.length) : 0 },
    series: series.map((s) => ({ d: s.d, v: n(s.gmv), orders: n(s.orders) })), dist: distOut, heat, DAY, BLK, products, groups: groups.map((g) => ({ g: g.g, rev: n(g.rev), units: n(g.units) })),
    buyers: { fresh: fresh.length, repeat, total: inRange.length, segments: seg, top: [...inRange].sort((a, b) => n(b.spend) - n(a.spend)).slice(0, 8).map((c) => ({ name: c.name, orders: n(c.orders), spend: n(c.spend) })) },
    geo: geo.map((g) => ({ s: g.s, orders: n(g.orders), gmv: n(g.gmv), buyers: n(g.buyers), aov: n(g.orders) ? n(g.gmv) / n(g.orders) : 0 })), returns: { reasons: ret.map((r) => ({ reason: r.reason, qty: n(r.qty) })), top: retTop.map((r) => ({ name: r.name, sku: r.sku, qty: n(r.qty) })) },
  };
}
const inr = (x: number) => `₹${Math.round(x).toLocaleString("en-IN")}`, ch = (d: number | null) => (d === null ? "" : d > 0 ? ` (up ${d}%)` : d < 0 ? ` (down ${Math.abs(d)}%)` : " (flat)");
/** A short plain-language summary written from the numbers (no AI needed, so it always works). */
export function overviewText(a: Analytics): string[] {
  const k = a.kpi, label = RANGES.find((r) => r.days === a.f.days)?.label.toLowerCase() ?? `last ${a.f.days} days`; if (!a.hasData) return ["There are no confirmed, dispatched or delivered orders in this period yet. Once orders come in, a summary appears here."];
  const out: string[] = [`${a.f.state ? a.f.state + ": " : ""}In the ${label} you had ${k.orders} orders worth ${inr(k.gmv)}${ch(k.gmvDelta)} compared with the period before. The average order was ${inr(k.aov)}${ch(k.aovDelta)} from ${k.buyers} buyers.`];
  const top = [...a.products].sort((x, y) => y.rev - x.rev)[0], rising = [...a.products].filter((p) => p.growth !== null && p.prevRev > 0 && p.rev > 0).sort((x, y) => (y.growth ?? 0) - (x.growth ?? 0))[0];
  if (top) out.push(`${top.name} is the top seller (${inr(top.rev)}, ${top.units} units).${rising && rising.id !== top.id && (rising.growth ?? 0) > 10 ? ` ${rising.name} is the fastest riser, up ${rising.growth}%.` : ""}`);
  const peakIdx = a.heat.flat().indexOf(Math.max(...a.heat.flat())); if (peakIdx >= 0 && a.heat.flat()[peakIdx] > 0) out.push(`Most orders arrive on ${a.DAY[Math.floor(peakIdx / 4)]} between ${a.BLK[peakIdx % 4]}.`);
  const topState = a.geo.find((g) => g.s !== "Not set"); if (topState && a.geo.length > 1) out.push(`${topState.s} brings the most revenue (${inr(topState.gmv)}).`);
  out.push(`${k.unpaidPct}% of orders are still unpaid${k.partialPct ? ` and ${k.partialPct}% part-paid` : ""}. ${k.returnPct === null ? "" : k.retUnits ? `Returns are ${k.returnPct}% of units sold.` : "No returns were recorded."} ${a.buyers.total ? `${k.repeatPct}% of buyers had ordered before.` : ""}`.trim());
  return out;
}
