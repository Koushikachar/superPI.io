import { ctx } from "@/lib/ctx"; import { aiAllowed } from "@/lib/ratelimit"; import { aiReady } from "@/lib/ai"; import { runChat } from "@/lib/aitools"; import { readChat } from "@/lib/chatinput"; import { assistantAnswer } from "@/lib/localanswer";
export const dynamic = "force-dynamic"; export const maxDuration = 60;
/** The assistant. Answers come from tools that only read the signed-in organization's own data. */
export async function POST(req: Request) {
  let c: Awaited<ReturnType<typeof ctx>>; try { c = await ctx(); } catch { return Response.json({ error: "Sign in first" }, { status: 401 }); }
  const b = readChat(await req.json().catch(() => null), { keep: 12, maxChars: 2000 }); if (!b.ok) return Response.json({ error: b.error }, { status: 400 });
  const ac = { orgId: c.orgId, orgName: c.orgName, finance: ["OWNER", "ACCOUNTANT", "ANALYST"].includes(c.role), costs: c.role !== "ORDER_STAFF" }, local = async () => Response.json({ reply: await assistantAnswer(b.messages.at(-1)!.content, ac) });
  // No AI key, over the AI limit, or the AI is down: answer straight from this business's own data instead of failing.
  if (!aiReady() || !(await aiAllowed(c.orgId).catch(() => false))) return local();
  try { return Response.json({ reply: await runChat(ac, b.messages) }); } catch { return local(); }
}
