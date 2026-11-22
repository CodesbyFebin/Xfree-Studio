# Xfree Studio v1 — implementation plan and acceptance gates

## Current increment (feat/v1-agentic-workspace)
- Browser-local spec generation and deterministic static project scaffold (HTML/CSS/JS).
- Editable multi-file workspace, sandboxed iframe preview, local persistence and JSON export.
- Neon-green visual refresh matching Xfree's reference identity.
- Rust `xf-agent-plan` crate: deterministic supervisor/planner/coder/tester/reviewer plan with explicit approval markers; no execution or fabricated AI output.
- Existing development API, experimental JSON-RPC and A2A 501 response remain unchanged.

## Target architecture
`Hostinger app.xfree.in` (static frontend) → authenticated `api.xfree.in` Rust Axum API on a separate container host → policy and task orchestration → isolated workers → PostgreSQL and artifacts. Browser-local generation does not require the API.

## Ordered implementation PRs
1. **Workspace and specs** (this branch): source editor, generated project artifacts, preview and export; tests and UI CI.
2. **Rust durable task runtime**: Postgres migrations for tenant, project, task, step, event, approval and artifact; atomic state transitions, idempotency, lease/heartbeat, cancellation, recovery.
3. **Secure coding agent**: OIDC/PKCE, repository allowlists, per-user quotas, explicit patch approval, isolated container workspace, test runner, output diff, immutable audit.
4. **Real prompt-to-app**: server-side provider adapters with constrained JSON output, iterative generation and validation, artifact manifest, preview build and human review.
5. **MCP compliance**: pinned official MCP SDK, initialization, capability negotiation, Streamable HTTP, auth, tools, errors, transport and conformance tests; keep demo route isolated.
6. **A2A compliance**: pinned Agent2Agent SDK/protocol, discovery, authenticated task/message/artifact lifecycle, streaming, remote allowlists, conformance tests; no untrusted remote execution.
7. **Deployment automation**: GitHub App installation, scoped short-lived tokens, repository/branch protection, CI builds, signed artifact publication, preview deployment, explicit publish approval, rollback.
8. **Production hardening**: CSP, rate limits, SAST, dependency scanning, egress policies, secret management, backups, tracing, SLOs and penetration test.

## Core data tables (planned)
`tenants(id)`, `users(id,tenant_id)`, `projects(id,tenant_id,owner_id,version)`,
`files(project_id,path,revision,blob_ref)`, `specs(project_id,revision,content)`,
`tasks(id,tenant_id,status,idempotency_key)`, `task_steps(task_id,step_id,state,lease_until)`,
`approvals(id,task_id,actor_id,decision)`, `artifacts(id,tenant_id,blob_ref)`,
`deployments(id,project_id,environment,revision,status)`, `audit_events(id,tenant_id,actor_id,action,created_at)`.
Enforce row-level tenant isolation or equivalent authorization in every query.

## Security constraints
- Do not expose the existing unauthenticated `/v1/tasks` or `/experimental/*` endpoints publicly.
- Never place AI provider credentials in Vite frontend environment variables.
- Do not run generated code inside the API process or privileged desktop process.
- Browser preview iframe has `sandbox="allow-scripts"` without `allow-same-origin`.
- Treat generated specs and files as untrusted data; require explicit approval for external side effects.
- Static templates are **not** AI-driven generation; the Rust plan is **not** autonomous execution.

## Deployment
- Build frontend via `cd frontend && npm ci && npm run build` once a committed lockfile is available. Otherwise use `npm install && npm run build`.
- Upload `frontend/dist` to Hostinger `app.xfree.in` document root.
- Keep `VITE_API_BASE_URL` unset for local-only mode until backend auth and quotas are implemented.
- Deploy Rust backend separately on VPS/container host; existing Caddy blocks all non-health public paths.
- Publish through reviewed PR and GitHub Actions checks; no automatic production push from prompt text.

## Definition of done for v1
Working editor, versioned specs, real prompt-to-app with tests, secure sandboxed execution, A2A/MCP conformance, GitHub/deployment approvals, cross-tenant isolation, backup/restore, monitoring, accessible responsive UI and rollback drill.
