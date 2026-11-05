import { Shell } from "@/components/Shell"; import { ctx } from "@/lib/ctx"; import { Tabs } from "@/components/research/parts"; import IdeasBoard from "@/components/research/IdeasBoard"; import { cookies } from "next/headers"; import { SAVED_COOKIE, parseSaved } from "@/lib/prefs"; import { bySlug } from "@/lib/research-data";
export const dynamic = "force-dynamic";
export default async function Ideas() {
  const c = await ctx(), saved = parseSaved((await cookies()).get(SAVED_COOKIE)?.value, (s) => !!bySlug(s));
  return <Shell title="Research: New product ideas" active="Research" admin={c.op}><Tabs active="ideas" />
    <section className="glass space-y-1 p-5"><h2 className="font-semibold">What should I sell next?</h2><p className="text-sm text-ink/70">Every idea gets a score out of 100 for <i>today</i>. It blends demand over the next three months, margin, competition, how easy the parcel is to ship and how often it is returned. Open an idea to see the month-by-month demand and work out your real profit per unit.</p></section>
    <IdeasBoard nowIso={new Date().toISOString()} savedInit={saved} /></Shell>;
}
