import { MONTHS } from "@/lib/research-data";
/** 12 small bars, one per month; this month is solid. */
export function Spark({ curve, month = new Date().getMonth(), height = 40 }: { curve: number[]; month?: number; height?: number }) {
  return <div className="flex items-end gap-[3px]" style={{ height }} role="img" aria-label="Demand by month, January to December">{curve.map((v, i) => <span key={i} title={`${MONTHS[i]}: ${v}/10`} className={`w-full rounded-sm ${i === month ? "bg-brand" : "bg-brand/30"}`} style={{ height: `${Math.max(8, v * 10)}%` }} />)}</div>;
}
