# Saiful Tailors Offers — Vercel + Firebase starter

This project is a starting implementation, not a live deployment. Before launch, complete the setup below and finish the admin offer-management APIs.

## What is included
- Bengali mobile-first customer offer page
- Monthly active campaign lookup
- Public list hides phone numbers and cancelled coupons
- Random discount amounts from ৳40 to ৳200
- Transaction-based limit of 50 claims per campaign
- Same normalized phone number can claim once per campaign (SHA-256 hash stored, raw phone is not saved)
- Downloadable text coupon record
- Admin password login starter
- Firestore locked-down rules

## Important
- Browser/device tracking is only a secondary signal; browsers can be reset or changed.
- No IMEI is collected. Normal websites cannot reliably access a phone's IMEI.
- The included admin page is only a login starter. Approve/cancel, create campaign, archive/history and redeem verification endpoints still need implementation before real shop use.
- A downloadable image/card design can be added; current starter downloads a simple text coupon.
- Do not use this for live customer data until the admin API and security review are complete.

## 1. Firebase
1. Create a Firebase project.
2. Create a Firestore database in production mode.
3. In Project settings > General > Your apps, create a Web app and copy its config values.
4. In Project settings > Service accounts, create a private key for server use. Keep it secret.
5. In Firestore Rules, publish `firestore.rules`.
6. Create an `offers` document in the `offers` collection with fields:
   - `title` (string): `Monthly Tailoring Offer`
   - `active` (boolean): `true`
   - `startAt` (string): ISO date/time e.g. `2026-10-20T00:00:00+06:00`
   - `endAt` (string): ISO date/time e.g. `2026-11-19T23:59:59+06:00`
   - `maxUsers` (number): `50`
   - `minOrderAmount` (number): `600`
   - `minDiscount` (number): `40`
   - `maxDiscount` (number): `200`

## 2. Environment variables
Copy `.env.example` to `.env.local` for local testing and fill:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (keep the whole private key; preserve newlines as `\n`)
- `ADMIN_PASSWORD` (strong, unique password)

Set the same values in Vercel Project > Settings > Environment Variables.

## 3. Deploy
Upload the project to a private GitHub repository, then import that repository into Vercel. Set environment variables before deploying.

## 4. Before real launch
Implement and test protected admin APIs for creating campaigns, approving/cancelling coupons, redeeming coupons, and archiving campaigns. Protect every admin route with verified server-side sessions. Test concurrent claims and phone-number normalization. Consider privacy notice and a retention policy.
