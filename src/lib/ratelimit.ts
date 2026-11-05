const hits = new Map<string, number[]>();
/** True if this call is within the limit. Uses Upstash Redis when configured (shared across servers), otherwise per-instance memory. */
export async function allow(key: string, max: number, ms: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL, tok = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && tok) { try { const r: any = await fetch(`${url}/pipeline`, { method: "POST", headers: { Authorization: `Bearer ${tok}` }, body: JSON.stringify([["INCR", `rl:${key}`], ["PEXPIRE", `rl:${key}`, ms, "NX"]]) }).then((x) => x.json()); const n = Number(r?.[0]?.result); if (!Number.isNaN(n)) return n <= max; } catch { /* fall back */ } }
  const now = Date.now(), arr = (hits.get(key) ?? []).filter((t) => now - t < ms); if (arr.length >= max) return false;
  arr.push(now); hits.set(key, arr); if (hits.size > 5000) hits.clear(); return true;
}
/** AI spend guard, one place for every AI endpoint: a short burst limit and a daily cap per business, so one account (or one stolen API key) cannot drain the AI quota. Raise or lower the daily cap with AI_DAILY_LIMIT. */
export async function aiAllowed(orgId: string): Promise<boolean> {
  const day = Number(process.env.AI_DAILY_LIMIT) > 0 ? Math.floor(Number(process.env.AI_DAILY_LIMIT)) : 300;
  return (await allow(`ai:${orgId}`, 20, 60_000)) && (await allow(`aid:${orgId}`, day, 86_400_000));
}
