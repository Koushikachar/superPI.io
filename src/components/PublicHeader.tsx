import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
/** The top bar of every public page. Built to fit a 320px phone: under 360px only the logo, Sign up and the theme switch show; Sign in appears from 360px, Pricing from 480px, Contact from 640px, How it works from 768px. The header keeps equal 16px margins on both sides and never runs off the edge. */
export default function PublicHeader({ current }: { current?: "pricing" | "contact" }) {
  const link = "rounded-lg px-1.5 py-2 hover:underline min-[400px]:px-2";
  return <header className="glass sticky top-3 z-10 mx-4 mt-3 flex max-w-6xl items-center justify-between gap-2 px-3 py-2 sm:px-4 md:px-6 md:py-3 min-[1216px]:mx-auto">
    <Link href="/" className="shrink-0 whitespace-nowrap text-base font-bold min-[400px]:text-lg md:text-xl">Direct<span className="text-turmeric">2</span>Hub</Link>
    <nav aria-label="Site" className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm md:gap-3">
      <Link href="/#how" className={`${link} hidden md:block`}>How it works</Link>
      {current !== "pricing" && <Link href="/pricing" className={`${link} hidden min-[480px]:block`}>Pricing</Link>}
      {current !== "contact" && <Link href="/contact" className={`${link} hidden sm:block`}>Contact</Link>}
      <Link href="/login" className={`${link} hidden min-[360px]:block`}>Sign in</Link>
      <Link href="/register" className="rounded-lg bg-navy px-3 py-2 text-center font-semibold text-white transition-colors hover:bg-brandDark dark:bg-brand dark:shadow md:px-4"><span className="sm:hidden">Sign up</span><span className="hidden sm:inline">Create account</span></Link>
      <ThemeToggle className="!h-10 !w-10" />
    </nav></header>;
}