"use client";
import dynamic from "next/dynamic";
/** Charts pull in the whole recharts library: load it in the background and show a same-size placeholder so the page doesn't jump. */
const ph = () => <div className="h-56 w-full animate-pulse rounded-xl bg-surface/40" aria-hidden />;
export const SalesChart = dynamic(() => import("./Charts").then((m) => m.SalesChart), { ssr: false, loading: ph });
export const StatusChart = dynamic(() => import("./Charts").then((m) => m.StatusChart), { ssr: false, loading: ph });
