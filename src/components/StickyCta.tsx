import Link from "next/link";
/** Phones only: a "Create account" bar stays at the bottom while visitors scroll. The right side is left free for the chat bubble. */
export default function StickyCta() {
  return <div className="fixed inset-x-0 bottom-0 z-20 pl-3 pr-20 md:hidden print:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
    <Link href="/register" className="glass-dark flex min-h-12 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white">Create free account</Link></div>;
}
