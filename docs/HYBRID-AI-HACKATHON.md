# Hybrid AI demo status

## What this branch implements

Xfree Studio uses Firebase AI Logic to generate a short product build brief. The user can choose Hybrid, On-device only, or Cloud only. The response displays the inference source reported by the SDK. Hybrid prefers on-device inference and can send the prompt to Firebase AI Logic cloud when local inference is unavailable. Device-only mode does not fall back to cloud.

The Projects workspace creates a small static starter from local templates. Its files can be edited, saved in browser storage, exported, previewed in a sandboxed iframe, and optionally synced to the signed-in user's Firestore collection.

## Not implemented

This repository does not currently implement AI code review, selected-file upload for review, review latency telemetry, consent-gated cloud fallback, automatic code changes, an autonomous coding agent, or automated test execution. The Rust API is a separate development/demo service and is not part of the browser AI workflow.

Do not use this document as a code-review demo script. Use [`HACKATHON-SUBMISSION.md`](HACKATHON-SUBMISSION.md) for the current build-brief demo outline. Demonstrate on-device inference or cloud fallback only after observing the corresponding source badge in a real session.

## Privacy and verification notes

- Hybrid mode may send the idea prompt to Firebase AI Logic cloud without a separate consent dialog. The UI discloses this fallback; use Device-only when the prompt must stay on the device.
- App Check protects configured AI Logic requests. It does not make a cloud request local or guarantee that a request succeeds.
- The repository cannot establish that Firebase Console settings, hosted configuration, device support, or model quotas are correct. Verify these in the deployed app before making claims about live inference.
- Do not send secrets or sensitive personal information in prompts.
