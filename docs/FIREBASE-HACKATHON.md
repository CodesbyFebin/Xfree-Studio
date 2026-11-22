# Xfree Studio Firebase Hackathon Integration
Google login and opt-in Firestore project sync are implemented in the frontend. Local projects work without Firebase. The Rust agent API remains a development-only, unauthenticated deterministic-tools API: **do not expose it publicly**. No real AI agent execution, secure sandbox, production A2A/MCP or Firebase-authenticated Rust endpoints are claimed.

## Setup
1. Create Firebase project and web app in Firebase Console. Enable Google sign-in and Cloud Firestore.
2. Add app.xfree.in to Firebase Authentication authorized domains.
3. Copy frontend/.env.firebase.example to frontend/.env.local and populate the four Firebase web configuration values.
4. Run `firebase deploy --only firestore:rules,firestore:indexes --project YOUR_PROJECT_ID`.
5. Run `cd frontend && npm install && npm run build`, upload dist/ to Hostinger static site.
6. Verify that user A cannot read or modify user B's projects, and anonymous access is denied. Run Firebase Emulator Suite for rule tests.

Firebase web config is public, not a server secret. Never commit service-account credentials. Cloud sync is explicitly opt-in, not 100% local or end-to-end encrypted. Firebase account and deployment credentials must be configured by the owner.
