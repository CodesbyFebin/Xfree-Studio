# XFree Studio — zero-cost-first infrastructure plan

**Goal:** Demonstrate a real Firebase-powered XFree homepage at `/` and Studio at `/studio` while staying on the Firebase **Spark** no-cost plan wherever possible. This is a cost-control architecture, **not a promise of unlimited free service**.

Reference: [ripienaar/free-for-dev](https://github.com/ripienaar/free-for-dev) — community-maintained free-tier catalog. Check current quotas and product availability on official provider pages before enabling features; catalog limits can change.

## Baseline stack

| Layer | Choice | Reason / constraints |
| --- | --- | --- |
| UI and local editing | React 19 + Vite + TypeScript | Static build; local editing remains functional without cloud access |
| Authentication | Firebase Authentication | Google and Email/Password; Phone requires additional provider setup, SMS region policy and may incur charges or require a billing plan; keep phone optional |
| Project persistence | Cloud Firestore | Per-user documents under `users/{uid}/projects/{projectId}`; deploy `firestore.rules` and test with separate accounts |
| Frontend hosting | Firebase Hosting | SPA rewrite for `/studio`; use Spark-compatible Hosting, **not App Hosting** |
| AI prototype | Firebase AI Logic + Gemini Developer API | Enable only if the chosen model/provider is supported for the project's billing status; quota limits, App Check, prompt privacy, and abuse controls need verification |
| CI and source | GitHub Actions + GitHub | Existing frontend/Rust/security checks; review usage quotas |
| DNS and edge | Cloudflare Free (optional) | Only if a custom domain and CDN/DNS features are needed; don't duplicate Firebase Hosting without a reason |
| Monitoring | Firebase/Google Analytics (optional) | Enable with user consent and applicable privacy notice; avoid unnecessary SDKs in MVP |
| Configuration | Firebase Remote Config (later) | Optional for model/prompt settings; **never store secrets in Remote Config** |
| Rust API | Local development only | Current API lacks production authentication and authorization. Do not expose it publicly on a free VM or proxy |
| Media | No cloud uploads in MVP | Firebase Storage and other object stores may have billing or quota constraints; use project text documents only |

## MVP deployment sequence

1. Confirm the Firebase project ID is **`xfree-studio`** and register a Web app in Firebase Console → Project settings → Your apps. Copy its **public web config**.
2. Enable Google and Email/Password sign-in in Firebase Authentication. Add the deployed domain to Authorized domains. Enable Phone only after reviewing SMS requirements and quotas.
3. Create Cloud Firestore in production mode and select a region. Deploy the repo's owner-scoped rules; test denial for anonymous and cross-account access.
4. Populate `frontend/.env.local` with the `VITE_FIREBASE_*` values from the Web app. These are public identifiers, **not** Admin SDK credentials. Never commit `.env.local` or service-account keys.
5. Build and deploy the static SPA:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use xfree-studio
   firebase deploy --only firestore:rules,firestore:indexes --project xfree-studio
   cd frontend
   npm install
   npm run build
   cd ..
   firebase deploy --only hosting --project xfree-studio
   ```
6. Verify the live `/` and `/studio` routes, sign-in/out, local save, explicit Firestore cloud save/load, and mobile responsiveness. Verify Firestore isolation with two accounts.
7. Only then enable Gemini in a controlled demo, using an appropriate Firebase AI Logic provider/model, App Check, request budgets and quota monitoring. Do not claim AI execution until tested end-to-end.

## Guardrails

- **Spark is not a general-purpose free backend compute plan.** Cloud Run, Cloud Functions, App Hosting, phone SMS, Storage, and some AI configurations may require Blaze/billing or have different availability. Verify the specific product and region before enabling it.
- Firestore free usage is bounded by document storage, reads/writes/deletes, and network usage. Consult [Firestore pricing](https://firebase.google.com/docs/firestore/quotas) and [Firebase pricing](https://firebase.google.com/pricing).
- AI free tiers are subject to provider/model availability and request/token limits. Consult [Firebase AI Logic](https://firebase.google.com/docs/ai-logic) and [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing).
- Firebase web config does **not** authorize a deploy. A Firebase account with project access must authenticate to Firebase CLI or connect a trusted deployment integration.
- Never expose a service-account key, AI provider server key, or unauthenticated Rust API to the browser.
- Firestore rules are necessary but do not replace testing, monitoring, App Check, and user-level limits.
- Do not integrate AdMob into the web MVP as though it were web display ads; AdMob is designed for mobile apps. Monetization is outside the hackathon-critical path.

## Cost monitoring and stop conditions

Before public traffic: set conservative per-product quotas and alerts where supported, review Firebase usage dashboards, and document an incident switch to disable AI calls or cloud writes. If a feature requires billing, **do not silently upgrade to Blaze**. Obtain explicit owner approval, set budgets/alerts, and verify billing exposure first.

## Current evidence vs. work remaining

- **In repository:** XFree landing page, Studio route, Firebase Auth integration, optional Firestore project sync, Firestore rules, Firebase Hosting config, GitHub CI.
- **Not verified live:** Firebase Web app registration, project credentials in deployment, provider enablement, Firestore rules deployment, Hosting URL, real user smoke tests.
- **Not implemented/verified:** production Gemini agent execution, Firebase App Check enforcement, Remote Config, Analytics integration, production Rust API security, automated Firebase emulator rules tests.

## References

- [free-for-dev catalog](https://github.com/ripienaar/free-for-dev)
- [Firebase pricing](https://firebase.google.com/pricing)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [Firebase AI Logic](https://firebase.google.com/docs/ai-logic)
- [Cloudflare free plan](https://www.cloudflare.com/plans/)
- [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
