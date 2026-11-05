"use client";
import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
import { saveConsent } from "@/app/prefs-actions"; import type { Consent } from "@/lib/prefs";
type Ctx = { choice: Consent | null; asking: boolean; choose: (v: Consent) => void; reopen: () => void };
const C = createContext<Ctx>({ choice: null, asking: false, choose: () => {}, reopen: () => {} });
export const useConsent = () => useContext(C);
/** Starts from the cookie the server read, so the first paint already knows whether to show the banner. Choosing saves the cookie on the server. */
export default function ConsentProvider({ initial, children }: { initial: Consent | null; children: React.ReactNode }) {
  const [choice, setChoice] = useState<Consent | null>(initial), [asking, setAsking] = useState(initial === null), [, start] = useTransition();
  const choose = useCallback((v: Consent) => { setChoice(v); setAsking(false); start(() => { void saveConsent(v); }); }, []);
  const reopen = useCallback(() => setAsking(true), []);
  return <C.Provider value={useMemo(() => ({ choice, asking, choose, reopen }), [choice, asking, choose, reopen])}>{children}</C.Provider>;
}
