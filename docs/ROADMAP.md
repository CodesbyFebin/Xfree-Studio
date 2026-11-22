# Engineering gates

- **v0.1**: modular Rust crate layout, real safe text tools, typed task lifecycle, browser-local UI, safe Hostinger static deployment, GitHub CI. No external A2A/MCP claims.
- **v0.2**: OIDC auth, per-user/tenant policy, quotas, request validation, Postgres storage, automated migration tests.
- **v0.3**: durable task orchestration with leases, cancellation, recovery, idempotency and agent evaluations.
- **v0.4**: standards-conformant MCP transport/tool negotiation and official conformance tests.
- **v0.5**: standards-conformant A2A agent discovery/task lifecycle plus authenticated remote delegation.
- **v0.6**: sandboxed workers, risk-based approvals, AI provider routing and usage accounting.
- **v1.0**: independent penetration review, SLOs, backups/restore drills, signed releases, documented rollback.

Rules: never return placeholder results as completed tasks; don't leak cloud secrets
into browser bundles; require versioned contracts and backward-compatible migrations;
do not run arbitrary generated code inside the API process.
