# #BuildHybridAI 2026 — Xfree Studio

Xfree Studio is a Web/Chrome idea-to-build-brief experience. Firebase AI Logic uses `PREFER_ON_DEVICE` so supported Chrome desktop devices can run Gemini Nano locally, with the Firebase cloud model as a fallback. The UI also exposes device-only and cloud-only modes and shows the response's actual `inferenceSource`.

## Before recording the demo

1. Follow [Firebase setup](FIREBASE-SETUP.md) to register the web app, provision Firebase AI Logic, configure App Check, and enable the desired Auth/Firestore services.
2. Use desktop Chrome 139+ with the Prompt API available. Prepare the local model before recording the on-device response.
3. Use Hybrid mode in a second environment without a local model and confirm the cloud fallback badge appears.
4. Follow the [submission draft and demo outline](HACKATHON-SUBMISSION.md). The hackathon requires a public repository with an open-source license, a hosted demo URL, and an English public YouTube demo video no longer than three minutes.

The Rust agent API remains a separate development-only surface and is not used by this AI Logic feature. Do not expose it to untrusted users.
