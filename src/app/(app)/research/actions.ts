"use server";
import { redirect } from "next/navigation"; import { revalidatePath } from "next/cache"; import { randomInt } from "crypto"; import { z } from "zod";
import { db } from "@/lib/db"; import { ctx } from "@/lib/ctx"; import { checkLimit } from "@/lib/plan"; import { GST_RATES } from "@/lib/gst"; import { bySlug } from "@/lib/research-data";
const go = (slug: string, k: "e" | "ok", m: string): never => redirect(`/research/ideas/${slug}?${k}=${encodeURIComponent(m)}`);
/** "Add to my products" on an idea page: creates a normal product (the owner can edit everything afterwards). Stock starts at the opening quantity, usually 0. */
export async function addIdeaToCatalogue(fd: FormData) {
  const slug = String(fd.get("slug") ?? ""), idea = bySlug(slug); if (!idea) redirect("/research/ideas");
  const c = await ctx(); if (!["OWNER", "INVENTORY_MANAGER"].includes(c.role)) go(slug, "e", "You don't have permission to add products");
  const p = z.object({ name: z.string().trim().min(1).max(120), price: z.coerce.number().min(0).max(10_000_000), cost: z.coerce.number().min(0).max(10_000_000), taxRate: z.coerce.number().refine((v) => GST_RATES.includes(v)), opening: z.coerce.number().int().min(0).max(1_000_000).default(0) }).safeParse(Object.fromEntries(fd));
  if (!p.success) go(slug, "e", `Check the ${String(p.error.issues[0].path[0])} field`);
  const d = p.data!, lim = await checkLimit(c.orgId, "products", 1); if (lim) go(slug, "e", lim);
  const wh = await db.warehouse.findFirst({ where: { orgId: c.orgId }, orderBy: [{ isDefault: "desc" }, { id: "asc" }] }); if (!wh) go(slug, "e", "Add a warehouse first on the Warehouses page");
  const prefix = d.name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 3).map((w) => w[0]).join("").toUpperCase() || "NEW";
  for (let tries = 0; tries < 5; tries++) {
    const sku = `${prefix}-${randomInt(1000, 10000)}`;
    try {
      await db.$transaction(async (tx) => {
        const pr = await tx.product.create({ data: { orgId: c.orgId, sku, name: d.name, price: d.price, unitCost: d.cost, taxRate: d.taxRate, description: idea.why } });
        await tx.stockBalance.create({ data: { orgId: c.orgId, productId: pr.id, warehouseId: wh!.id, sellable: d.opening } });
        if (d.opening > 0) await tx.stockMovement.create({ data: { orgId: c.orgId, productId: pr.id, warehouseId: wh!.id, type: "OPENING", qty: d.opening, actorId: c.user.id, idempotencyKey: `open:${pr.id}` } });
      });
      revalidatePath("/products"); go(slug, "ok", `Added ${d.name} (SKU ${sku}).`);
    } catch (e: any) { if (e?.code !== "P2002") throw e; }
  }
  go(slug, "e", "Couldn't create a unique SKU. Try again");
}
