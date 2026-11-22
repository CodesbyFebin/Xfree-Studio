# Xfree Studio Ω

Rust-first agentic platform foundation for desktop, web and future A2A/MCP interoperability.

> **Status:** v0.1 development foundation. Not production-safe or certified A2A/MCP compliant. The public frontend is intended for Hostinger Web/Business/Cloud hosting; the Rust backend requires a separate container host/VPS.

## Architecture

- `frontend/` — React + Vite static frontend, build for `app.xfree.in`
- `backend/` — Rust workspace: Axum API, agent-task core, policy guard and deterministic tools
- `deploy/` — container-host configuration for `api.xfree.in`, Caddy TLS
- `docs/` — hosting architecture and implementation roadmap

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
