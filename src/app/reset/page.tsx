import SubmitButton from "@/components/SubmitButton";
import { redirect } from "next/navigation";
import { setPassword } from "../actions"; import { sbServer } from "@/lib/supabase"; import AuthCard from "@/components/AuthCard"; import PasswordPair from "@/components/PasswordPair"; import { Err, btn } from "@/components/ui";
export const metadata = { title: "Choose a new password", description: "Set a new password for your Direct2Hub account.", robots: { index: false, follow: false } };
export default async function Reset({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  if (!(await (await sbServer()).auth.getUser()).data.user) redirect("/forgot?e=" + encodeURIComponent("Your reset link has expired. Request a new one"));
  return <AuthCard title="Choose a new password"><Err e={e} />
    <form action={setPassword} className="space-y-3">
      <PasswordPair passwordLabel="New password" />
      <SubmitButton className={`${btn} w-full`} pendingText="Updating">Update password</SubmitButton></form></AuthCard>;
}
