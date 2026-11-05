# Branded sign-in emails (Supabase)

Supabase sends the sign-up confirmation, password reset, magic link, email change and security-code emails itself,
so they only look like Direct2Hub if you paste these files into the Supabase dashboard:

Supabase dashboard > Authentication > Emails (Email Templates). For each row, paste the HTML file and set the subject.

| Template in Supabase | File | Subject |
|---|---|---|
| Confirm sign up | confirm-signup.html | Confirm your Direct2Hub email |
| Reset password | reset-password.html | Reset your Direct2Hub password |
| Magic link | magic-link.html | Your Direct2Hub sign-in link |
| Change email address | change-email.html | Confirm your new Direct2Hub email |
| Reauthentication | reauthentication.html | Your Direct2Hub security code |

To rebuild the files after changing src/lib/emailTemplate.ts: `npm run emails`.

## PDF invoices (plan purchases)
Set these in your hosting environment so the plan tax invoice is complete: NEXT_PUBLIC_COMPANY_NAME, NEXT_PUBLIC_COMPANY_ADDRESS, PLATFORM_GSTIN, PLATFORM_STATE (to split CGST/SGST vs IGST) and PLATFORM_SAC (the service accounting code your CA gives you).

## 6-digit sign-up code
The sign-up screen (`/verify`) lets people type the code from the "Confirm sign up" email instead of opening the link, so that template must contain `{{ .Token }}` (the file above does).
In Supabase > Authentication > Providers > Email, keep "Email OTP Length" at 6. The code lasts for the "Email OTP Expiration" you set there (default 1 hour).
