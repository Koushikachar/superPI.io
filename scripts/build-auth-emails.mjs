// Writes the branded sign-up / reset / magic-link / change-email / security-code emails to supabase/email-templates/*.html
// Run:  npm run emails   (Node 22.6+)
import { writeFileSync, mkdirSync } from "node:fs";
import { AUTH_EMAILS } from "../src/lib/emailTemplate.ts";
mkdirSync("supabase/email-templates", { recursive: true });
for (const e of AUTH_EMAILS) { writeFileSync(`supabase/email-templates/${e.file}.html`, e.html); console.log(`${e.file}.html   subject: ${e.subject}`); }
