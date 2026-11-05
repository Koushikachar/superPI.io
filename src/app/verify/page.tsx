import Link from "next/link";
import { resendVerification, verifyCode } from "../actions";
import AuthCard from "@/components/AuthCard";
import OtpForm from "@/components/OtpForm";
import { Err } from "@/components/ui";
export const metadata = { title: "Verify your email", description: "Confirm your email address to finish setting up Direct2Hub.", robots: { index: false, follow: false } };
export default async function Verify({ searchParams }: { searchParams: Promise<{ email?: string; e?: string; ok?: string }> }) {
  const { email = "", e, ok } = await searchParams;
  return <AuthCard title="Check your email" sub={email ? `We sent a verification link and a 6-digit code to ${email}. Open the link in this browser, or type the code below.` : "Open the verification link we emailed you, or type the 6-digit code from it."}>
    <Err e={e} />{ok && <p role="status" className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-2 text-sm text-brand">A new email was sent with a fresh code. Check your spam folder too.</p>}
    <OtpForm key={`${e ?? ""}|${ok ?? ""}`} email={email} verify={verifyCode} resend={resendVerification} justSent={!!ok} />
    <p className="mt-5 text-sm text-ink/70">Verified already? <Link href="/login" className="font-semibold text-brand underline">Sign in</Link></p>
    <p className="mt-2 text-sm text-ink/70">Wrong address? <Link href="/register" className="font-semibold text-brand underline">Start again</Link></p></AuthCard>;
}
