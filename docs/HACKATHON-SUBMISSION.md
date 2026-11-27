# #BuildHybridAI 2026 — Xfree Studio submission draft

## Project name

**Xfree Studio — Idea to Build Brief**

**Platform:** Web (Chrome)

## One-line pitch

Turn a rough product idea into a focused first-release plan, with Firebase AI Logic choosing Gemini Nano on supported Chrome devices and falling back to cloud when needed.

## Project description

Most people with a useful software idea get stuck before the first commit: the audience is vague, the MVP is too big, and the next step is unclear. Xfree Studio turns one short idea into a concrete build brief: a target user, the problem, a scoped MVP, an ordered build sequence, and the biggest risks.

The brief is powered by Firebase AI Logic hybrid inference. In Hybrid mode, Xfree prefers Chrome's on-device Gemini Nano model and uses the Firebase cloud model when the local model is unavailable. Device-only mode keeps the prompt local; Cloud-only mode makes the trade-off explicit. Each response shows which inference path actually ran. Firebase App Check protects the AI Logic calls, while optional Firebase Authentication and Cloud Firestore sync user-owned project work.

Xfree Studio is for indie builders, students, and small teams who need to turn an idea into a testable first release without sending every prompt to the cloud by default.

The cloud model is Gemini 3.8 Flash. Both inference modes produce build briefs. The starter workspace uses local templates to create editable HTML, CSS, JavaScript, and a specification, with an in-browser preview and optional owner-only Firestore sync.

## What changed during the hackathon

- Replaced the assistant's placeholder responses with real Firebase AI Logic `generateContent` calls.
- Added Hybrid, Device-only, and Cloud-only inference modes and a visible `inferenceSource` result badge.
- Added on-device model preparation and progress feedback for Chrome desktop.
- Added Firebase App Check with reCAPTCHA Enterprise and a local debug-token flow.
- Reworked the landing page around the idea-to-build-brief use case and explicit inference choices.

## Three-minute demo outline

**0:00–0:20 — The problem**  
Show the short idea input: “A study planner for students who keep losing track of assignments.” Say that the hard part is turning that thought into a first useful release.

**0:20–0:45 — Hybrid setup**  
On a supported Chrome desktop, choose Hybrid and prepare Gemini Nano. Explain that the model downloads once and stays on the device.

**0:45–1:20 — Local result**  
With the app loaded and Gemini Nano ready, turn off Wi-Fi, select Device, and send the idea. Show the actual `GEMINI NANO · ON DEVICE` badge and the generated user, problem, MVP, build sequence, and risks. Point out that the result reports the SDK's inference source, rather than guessing based on the selected mode.

**1:20–1:50 — Explicit cloud choice**  
Restore Wi-Fi, choose Cloud, and send the same idea. Show the cloud source badge and explain that this mode is explicit; Hybrid instead prefers the local model.

**1:50–2:20 — Real fallback**  
Open the app in a second browser environment without an available on-device model, leave Hybrid selected, and send a short idea. Show that the SDK completes the request through cloud fallback. Keep the two environments visible in the recording or use a clean edit between them.

**2:20–2:45 — Product loop**  
Open Projects, create a local starter from the brief, edit a file, and show the sandboxed preview. Explain that Firebase sign-in and private Firestore sync are optional for project persistence.

**2:45–3:00 — Close**  
Restate the value: a clear first step for a builder, with a visible choice about where the AI runs.

## Submission readiness checklist

- [ ] Complete Firebase AI Logic setup for `xfree-studio` and confirm App Check enforcement.
- [ ] Add valid local and production Firebase config; register the production App Check provider and authorized domain.
- [ ] Verify the on-device badge on a supported Chrome desktop and the real cloud fallback on an unsupported environment.
- [ ] Verify optional Auth and Firestore sync with two accounts and confirm cross-user access is denied.
- [ ] Run the production build and exercise the complete demo in the deployed web app.
- [ ] Confirm the public GitHub repository shows the Apache-2.0 license in its About panel.
- [ ] Upload a Public YouTube demo with English audio or subtitles, no longer than three minutes, and link it in the Devpost entry.
- [ ] Include the public repository and hosted demo URL in the Devpost submission.

Do not submit claims about on-device execution until the response badge has been observed on a supported device. On-device inference for the web requires Firebase JS SDK 12.5.0+ and desktop Chrome 139+; Chrome may need its Prompt API enabled and the Gemini Nano model downloaded.
