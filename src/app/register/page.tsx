import SubmitButton from "@/components/SubmitButton";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { signUp } from "../actions";
import AuthCard from "@/components/AuthCard";
import Turnstile from "@/components/Turnstile";
import PasswordPair from "@/components/PasswordPair";
import { Err, inp, btn } from "@/components/ui";
export const metadata = pageMeta({ title: "Create your free account", description: "Create a free Direct2Hub account and start tracking stock, orders and GST invoices for your business in minutes.", path: "/register" });
export default async function Register({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  if (await getUser()) redirect("/dashboard"); // already signed in
  return <AuthCard title="Create your account" sub="We'll email you a 6-digit code to verify your address."><Err e={e} />
    <form action={signUp} className="mt-3 space-y-3">
      <label className="block text-sm">Your name<input name="name" required minLength={2} maxLength={100} className={inp} autoComplete="name" /></label>
      <label className="block text-sm">Work email<input name="email" type="email" required className={inp} autoComplete="email" inputMode="email" /></label>
      <PasswordPair />
      <label className="flex items-start gap-2 text-sm"><input name="age" type="checkbox" required className="mt-1" /><span>I confirm I am 18 or older and using Direct2Hub for a business.</span></label>
      <Turnstile /><SubmitButton className={`${btn} w-full`} pendingText="Creating account">Create account</SubmitButton></form>
    <p className="mt-4 text-xs text-ink/70">By creating an account you agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
    <p className="mt-3 text-sm text-ink/70">Already registered? <Link href="/login" className="font-semibold text-brand underline">Sign in</Link></p></AuthCard>;
}
