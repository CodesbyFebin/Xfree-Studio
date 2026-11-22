# Xfree Studio Ω Architecture

## Scope

Fresh Rust-first foundation rather than a transplant of the legacy Xfree website.

- `frontend/`: Hostinger-compatible static web UI with real browser-local text tools
- `backend/crates/agent-core`: typed task lifecycle
- `backend/crates/policy`: explicit policy decision types (not yet an authorization system)
- `backend/crates/tools`: deterministic Rust text tools, no fake LLM results
- `backend/crates/api`: Axum development API and experimental JSON-RPC

## Protocol policy

The experimental JSON-RPC endpoint is **not** MCP transport conformance.
The A2A endpoint deliberately returns HTTP 501; no agent card is published.
To claim interoperability: select an official A2A/MCP spec revision, implement
authentication, transport/session semantics, streaming, task lifecycle, schema
validation and the upstream conformance suite.

## Upgrade path

1. Durable SQL-backed tasks, idempotency, leases, retries, cancellation.
2. Authentication (OIDC/PKCE), tenant isolation and approval workflows.
3. Secure plugin sandbox with CPU/memory/IO budgets and outbound allowlists.
4. Official MCP SDK integration and wire-level conformance checks.
5. Official A2A SDK integration and cross-implementation tests.
6. Provider-neutral cloud and local LLM gateway; explicit per-task budgets.
7. Tauri desktop shell and local SQLite offline runtime.
8. PostgreSQL cloud workers, event outbox, OpenTelemetry.
9. Versioned workflows, compatibility migrations and signed plugin system.

## Known limitations

In-memory task storage resets on restart. No arbitrary generated code execution,
LLM planning, persistent agents, sandbox, tenant separation or production auth.
Do not expose development endpoints publicly.

## Historical source

The old `CodesbyFebin/xfree` repository contains related TypeScript intent,
workflow and tool code. Reuse behaviors and tests selectively; avoid copying
deployment assumptions or claiming feature parity without test evidence.
