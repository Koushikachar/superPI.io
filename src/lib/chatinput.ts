export type ChatMsg = { role: "user" | "assistant"; content: string };
const EMPTY = "Type a question first.";
/** Reads what the chat box sent and makes it safe to forward to the AI. No schema library: anything odd is skipped instead of failing the request.
 *  Old messages are TRIMMED (never rejected): before, one long earlier answer or a 5th question made the whole request fail with HTTP 400 "Ask a question".
 *  Only a genuinely empty or too-long NEW question is refused, and the message says why. */
export function readChat(raw: unknown, o: { keep: number; maxChars: number }): { ok: true; messages: ChatMsg[] } | { ok: false; error: string } {
  const arr = (raw as { messages?: unknown } | null)?.messages; if (!Array.isArray(arr)) return { ok: false, error: EMPTY };
  const all: ChatMsg[] = [];
  for (const x of arr.slice(-200) as { role?: unknown; content?: unknown }[]) {
    if (!x || (x.role !== "user" && x.role !== "assistant") || typeof x.content !== "string") continue;
    const content = x.content.trim(); if (content) all.push({ role: x.role, content });
  }
  const last = all.at(-1); if (!last || last.role !== "user") return { ok: false, error: EMPTY };
  if (last.content.length > o.maxChars) return { ok: false, error: `Please keep your question under ${o.maxChars} characters.` };
  const m: ChatMsg[] = [];
  for (const x of all.slice(-o.keep)) { const t: ChatMsg = { role: x.role, content: x.content.slice(0, o.maxChars) }; if (m.length && m[m.length - 1].role === "user" && t.role === "user") m.pop(); /* an earlier question that got no answer */ m.push(t); }
  while (m.length && m[0].role !== "user") m.shift(); // the AI expects the chat to start with a person
  return { ok: true, messages: m };
}
