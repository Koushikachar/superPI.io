import { ctx } from "@/lib/ctx"; import { allow } from "@/lib/ratelimit"; import { buildDocument, DOC_KINDS, type DocKind } from "@/lib/documents";
export const dynamic = "force-dynamic"; export const runtime = "nodejs"; export const maxDuration = 30;
/** GET /api/documents/<invoice|credit-note|receipt|purchase-order|bill>/<id>[?download=1]: the PDF for one document of the signed-in business. */
export async function GET(req: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params; if (!DOC_KINDS.includes(kind as DocKind) || !/^[A-Za-z0-9_-]{6,40}$/.test(id)) return new Response("Not found", { status: 404 });
  let c: Awaited<ReturnType<typeof ctx>>; try { c = await ctx(); } catch { return new Response("Sign in first", { status: 401 }); }
  if (!(await allow(`pdf:${c.orgId}`, 60, 60_000).catch(() => true))) return new Response("Too many downloads. Wait a minute.", { status: 429 });
  const d = await buildDocument(kind as DocKind, c.orgId, id); if (!d) return new Response("Not found", { status: 404 });
  const dl = new URL(req.url).searchParams.get("download") === "1";
  return new Response(Buffer.from(d.bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${dl ? "attachment" : "inline"}; filename="${d.filename}"`, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
}
