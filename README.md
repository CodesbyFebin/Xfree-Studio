# Xfree Studio

Turn a rough software idea into a focused build brief, then scaffold, edit, and preview a starter project. The assistant uses Firebase AI Logic hybrid inference: on-device Gemini Nano when available, cloud fallback when needed.

> **Status:** Hackathon prototype. The AI demo requires Firebase AI Logic and App Check configuration. The separate Rust API is development-only and is not used by the AI feature. The frontend can be hosted as a static site; the Rust backend requires a separate container host/VPS.

## Architecture

- `frontend/` — React + Vite static frontend, build for `app.xfree.in`
- `backend/` — Rust workspace: Axum API, agent-task core, policy guard and deterministic tools
- `deploy/` — container-host configuration for `api.xfree.in`, Caddy TLS
- `docs/` — hosting architecture and implementation roadmap

## #BuildHybridAI 2026

Xfree Studio turns a short product idea into an MVP build brief. The web app uses Firebase AI Logic hybrid inference: it prefers Chrome's on-device Gemini Nano model, can be pinned to on-device-only or cloud-only, and reports the actual inference source for every response. App Check protects AI Logic requests; Firebase Auth and owner-only Firestore project sync remain optional.

Web on-device inference requires Firebase JS SDK 12.5.0+ and desktop Chrome 139+. The first local request may require enabling Chrome's Prompt API and downloading the model. Configure the Firebase project before expecting runtime AI responses. See [Firebase setup](docs/FIREBASE-SETUP.md) and the [Devpost submission/demo draft](docs/HACKATHON-SUBMISSION.md).

## Local development

Requires Rust toolchain and Node.js 22+.

```bash
cd backend && cargo test --workspace && cargo run -p xfree-studio-api
cd frontend && npm install && npm run dev
```

## Hostinger setup

Hostinger shared/Business/Cloud hosting **only serves the frontend static build**. Deploy the Rust backend to an isolated container host, configure `api.xfree.in` and TLS, then build the frontend with `VITE_API_BASE_URL=https://api.xfree.in`. Upload the contents of `frontend/dist` (including `.htaccess`) to the `app.xfree.in` document root.

**Do not expose the starter agent API to untrusted users until authentication, authorization, request limits, durable storage, audits and sandboxing are implemented.** A2A and MCP adapters are non-compliant demonstration surfaces at this stage, not official interoperable endpoints.

See `docs/ARCHITECTURE.md` and `docs/HOSTINGER.md`.

## Baseline quality gates

```bash
cargo fmt --manifest-path backend/Cargo.toml --all -- --check
cargo clippy --manifest-path backend/Cargo.toml --workspace --all-targets -- -D warnings
cargo test --manifest-path backend/Cargo.toml --workspace
cd frontend && npm run build
```

Design source: the Xfree Studio Ω blueprint and Hostinger deployment notes. Existing `CodesbyFebin/xfree` remains a separate site.

## Security note

Use development-only interfaces until production gates pass. Never store provider API keys in `VITE_*` variables.


## v1 workspace preview branch

The `feat/v1-agentic-workspace` branch introduces local spec-driven scaffolding, editable files, browser preview and a Rust deterministic multi-agent planning crate. These are incremental foundations, **not** a complete AI coding agent or interoperable A2A/MCP implementation. See [v1 implementation plan](docs/V1-IMPLEMENTATION.md).


Cloud project sync accepts up to 10 files with safe relative paths; the current starter template creates five. Firestore rules enforce the same file and content constraints and keep the project's creation timestamp stable.

The development API stores at most 1,000 tasks in memory and rejects new tasks when full; restarting clears the store. It still has no authentication or rate limiting. Do not expose it to untrusted users until the production safeguards listed above are implemented.
