# Firebase setup — project xfree-studio

The Firebase CLI project alias is configured to `xfree-studio`. This does **not** register a web app or enable Firebase services remotely.

## First-time console steps
1. Firebase Console → `xfree-studio` → Project settings → Your apps → Add app → Web. Register **XFree Studio** and copy the web config.
2. Authentication → Sign-in method → enable **Google**, **Email/Password**, and **Phone**. Set support email, authorized domains, and SMS region policy. Phone sign-in uses reCAPTCHA and may require billing or SMS quota configuration. Use Firebase test phone numbers during development.
3. Firestore → Create database in production mode and select a region.
4. AI Services → AI Logic → Get started. Choose the Gemini Developer API and complete the workflow. It provisions the required service and enforces App Check for AI Logic.
5. Security → App Check → register the web app with **reCAPTCHA Enterprise**. Put the site key in `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY`; keep the Enterprise secret key in the console only. Add the production host to the provider's allowed domains.
6. Copy `frontend/.env.firebase.example` to `frontend/.env.local`, filling in the Firebase web config and App Check site key. Never put private service-account or reCAPTCHA secret keys in the browser.
7. Sign in to the CLI: `npx -y firebase-tools@latest login`. Provision AI Logic for the project: `npx -y firebase-tools@latest init ailogic`.
8. Deploy the checked-in owner-only Firestore rules and indexes: `npx -y firebase-tools@latest deploy --only firestore:rules,firestore:indexes --project xfree-studio`.
9. Build with `cd frontend && npm install && npm run build && cd ..`.
10. `npx -y firebase-tools@latest deploy --only hosting --project xfree-studio` (only if Firebase Hosting is the intended host).

## Local Auth and Firestore emulators

1. Start the emulators from the repository root: `npx -y firebase-tools@latest emulators:start --only auth,firestore --project xfree-studio`.
2. In `frontend/.env.local`, set `VITE_USE_FIREBASE_EMULATORS=true`, `VITE_APPCHECK_DEBUG=true`, and provide the App Check site key. A debug token will print in the browser console; register that token under App Check → Apps → Manage debug tokens.
3. Start Vite with `cd frontend && npm run dev`. Emulator and App Check debug connections are only enabled in Vite development mode; a production build never connects to localhost or uses a debug token.
4. Set the emulator and App Check debug flags to false (or remove them) before a production build.

## Hybrid inference demo

The assistant uses Firebase AI Logic with `PREFER_ON_DEVICE`; it reports whether each response came from Chrome's local Gemini Nano model or the Firebase cloud fallback. `Device` and `Cloud` modes let a judge compare the paths directly. Web on-device inference requires Firebase JS SDK 12.5.0+ and desktop Chrome 139+; the Chrome Prompt API/model may need to be enabled and downloaded before the first local response. See Google's [hybrid web setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started).

Cloud project saves now write ISO timestamp strings to match `firestore.rules`. Firebase web config and App Check site keys are public client configuration; never put service-account keys, App Check secret keys, or debug tokens in `VITE_*` variables.

## Verify before submission
- Test Google, email/password registration/sign-in, and phone SMS verification with authorized domains and configured test numbers.
- Test two accounts: neither can read or write the other's Firestore projects. Test anonymous denial.
- Test sign out, local-only project save, cloud save/load, and browser preview.
- Run CI checks and verify deployed Hosting URL. Do not expose the unauthenticated Rust API publicly.
- Verify the AI Logic and App Check setup in the Firebase Console before recording a demo; do not claim on-device inference unless the response badge shows **GEMINI NANO · ON DEVICE**.
- The Rust API remains unauthenticated and is not used by this AI Logic flow. Do not expose it to untrusted users.

## Optional agent skills
`npx skills add firebase/agent-skills` can install Firebase agent guidance in a compatible coding-agent environment. This is a developer tooling step, not Firebase deployment or application registration.
