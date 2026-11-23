# XFree Studio — Hybrid AI Code Review

## Differentiator

**Proof-of-inference + human-in-the-loop code review.** Users select an editable project file and ask Firebase AI Logic to review it. The SDK prefers on-device Gemini Nano on supported Chrome desktop installations and can fall back to Gemini in the cloud. The UI shows the **actual response-reported inference source** (ON_DEVICE, IN_CLOUD, or UNKNOWN), elapsed time, and suggestions without automatically applying changes.

This is **not** an autonomous coding agent, automated test runner, or a guaranteed on-device inference experience. Users must review suggestions and edit source manually.

## Prerequisites

1. Firebase project `xfree-studio` with a registered Web app and Firebase AI Logic enabled using the Gemini Developer API provider.
2. Firebase App Check registered for the Web app with a reCAPTCHA v3 site key. Configure App Check enforcement for AI Logic in Firebase Console, then test real requests.
3. Add the Firebase web config to `frontend/.env.local` as `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, and `VITE_FIREBASE_APPCHECK_SITE_KEY`. Never commit .env.local or service-account credentials.
4. `cd frontend && npm install && npm run build`; deploy Firebase Hosting after CI succeeds.
5. For local development with App Check enforcement, use the official App Check debug provider and register the debug token in Console; do not deploy a debug token in production.

## Demo scenario

1. Navigate to `/studio`, open **Projects**, generate a starter, and edit a file.
2. Choose **On-device only** on supported Chrome desktop with Prompt API enabled/model installed; run a review and show the reported source.
3. Choose **Prefer on-device** and explicitly consent to possible cloud transmission; run the same review on a browser without on-device support to demonstrate automatic fallback.
4. Show actionable feedback, source attribution and manual code changes. Save privately to Firestore if configured.
5. Demonstrate a failure state without Firebase/App Check config: the UI disables AI and **does not fabricate output**.

## Safety and cost

- Only the selected file and project description are sent; max 12,000 source characters, 1,200 prompt characters. **This is not secret scanning**: don't review credentials, private data, or proprietary code without authorization.
- Cloud fallback is opt-in through a checkbox. **On-device only** never falls back to cloud, and will fail on unsupported devices.
- The SDK reports `inferenceSource` where available. UNKNOWN is not presented as local.
- Configure App Check enforcement, rate limits, model quotas, privacy notice and cost monitoring before public launch.
- Cloud model `gemini-3.5-flash-lite` is selected as documented by Firebase AI Logic at time of implementation; verify regional/provider availability and quotas.
- Firebase AI Logic hybrid requires Firebase JS SDK 12.5.0+; this branch upgrades to ^13.0.0.
- App Check integration must be tested against real Firebase project; this branch has no Firebase Console or deployment access.

References: [Firebase hybrid web guide](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started), [hybrid configuration](https://firebase.google.com/docs/ai-logic/hybrid/web/configuration-options), [App Check](https://firebase.google.com/docs/app-check).
