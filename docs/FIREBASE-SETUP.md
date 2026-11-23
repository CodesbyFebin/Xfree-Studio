# Firebase setup — project xfree-studio

The Firebase CLI project alias is configured to `xfree-studio`. This does **not** register a web app or enable Firebase services remotely.

## First-time console steps
1. Firebase Console → xfree-studio → Project settings → Your apps → Add app → Web. Register **XFree Studio** and copy the web config.
2. Authentication → Sign-in method → enable **Google**, **Email/Password**, and **Phone**. Set support email, authorized domains, and SMS region policy. Phone sign-in uses reCAPTCHA and may require billing or SMS quota configuration. Use Firebase test phone numbers during development.
3. Firestore → Create database in production mode, select region, then deploy security rules.
4. Copy `frontend/.env.firebase.example` to `frontend/.env.local`, filling public `VITE_FIREBASE_*` values from the registered app. Never put private service account keys in the browser.
5. `npm install -g firebase-tools`; `firebase login`; `firebase use xfree-studio`.
6. `firebase deploy --only firestore:rules,firestore:indexes --project xfree-studio`.
7. `cd frontend && npm install && npm run build && cd ..`.
8. `firebase deploy --only hosting --project xfree-studio`.

## Verify before submission
- Test Google, email/password registration/sign-in, and phone SMS verification with authorized domains and configured test numbers.
- Test two accounts: neither can read or write the other's Firestore projects. Test anonymous denial.
- Test sign out, local-only project save, cloud save/load, and browser preview.
- Run CI checks and verify deployed Hosting URL. Do not expose the unauthenticated Rust API publicly.
- Gemini/AI execution, App Check enforcement, monitoring, and server-side rate limits remain future work; do not claim they are enabled.

## Optional agent skills
`npx skills add firebase/agent-skills` can install Firebase agent guidance in a compatible coding-agent environment. This is a developer tooling step, not Firebase deployment or application registration.
