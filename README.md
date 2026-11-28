# Xfree Studio

Turn a rough software idea into a focused build brief, then scaffold, edit, and preview a starter project. The AI assistant uses Firebase AI Logic with explicit local, hybrid, and cloud modes. Cloud processing is denied until the user opts in for that prompt.

> **Status:** Hackathon prototype. The AI demo requires Firebase AI Logic and App Check configuration. The separate Rust API is development-only and is not used by the AI feature. The frontend can be hosted as a static site; the Rust backend requires a separate container host/VPS.

## Architecture

- `frontend/` — React + Vite static frontend, build for `app.xfree.in`
- `backend/` — Rust workspace: Axum API, agent-task core, policy guard and deterministic tools
- `deploy/` — container-host configuration for `api.xfree.in`, Caddy TLS
- `docs/` — hosting architecture and implementation roadmap

## #BuildHybridAI 2026

Xfree Studio turns a short product idea into an MVP build brief. The web app uses Firebase AI Logic with an explicit privacy gate: prompts default to `LOCAL_ONLY`, and each prompt needs user consent before any cloud processing or fallback. It supports on-device-only, hybrid, and cloud-only modes, and reports the actual inference source and routing trace after successful responses. App Check protects AI Logic requests; Firebase Auth and owner-only Firestore project sync remain optional. The Know Your Agent page is a deterministic concept demo with an explainable score and optional owner-only, append-only Firestore history; its simulated signals do not establish real agent identity.

Web on-device inference requires Firebase JS SDK 12.5.0+ and desktop Chrome 139+. The first local request may require enabling Chrome's Prompt API and downloading the model. Configure the Firebase project before expecting runtime AI responses. See [Firebase setup](docs/FIREBASE-SETUP.md) and the [Devpost submission/demo draft](docs/HACKATHON-SUBMISSION.md).

## Local development

Requires Rust toolchain and Node.js 22+.

```bash
cd backend && cargo test --workspace && cargo run -p xfree-studio-api
cd frontend && npm ci && npm run dev
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
cd frontend && npm ci && npm run build
npx --yes firebase-tools@14.27.0 --config firebase.json emulators:exec --project demo-xfree-studio-rules --only firestore "cd frontend && npm run test:rules"
```

Design source: the Xfree Studio Ω blueprint and Hostinger deployment notes. Existing `CodesbyFebin/xfree` remains a separate site.

## Security note

Use development-only interfaces until production gates pass. Never store provider API keys in `VITE_*` variables.


## v1 workspace preview branch

The `feat/v1-agentic-workspace` branch introduces local spec-driven scaffolding, editable files, browser preview and a Rust deterministic multi-agent planning crate. These are incremental foundations, **not** a complete AI coding agent or interoperable A2A/MCP implementation. See [v1 implementation plan](docs/V1-IMPLEMENTATION.md).


Cloud project sync accepts up to 10 files with safe relative paths; the current starter template creates five. Firestore rules enforce the same file and content constraints and keep the project's creation timestamp stable.

The development API stores at most 1,000 tasks in memory and rejects new tasks when full; restarting clears the store. It still has no authentication or rate limiting. Do not expose it to untrusted users until the production safeguards listed above are implemented.

## Website content and routes

The frontend build statically renders the homepage and 19 focused product, feature, privacy, and guide pages. It also generates `sitemap.xml`, `robots.txt`, and `llms.txt`. The article pages describe current product behavior and limits; they do not promise search rankings. The `/studio` route remains the interactive workspace.
