# Hosting Xfree Studio with Hostinger Web/Business/Cloud

## Separation

**Hostinger Web/Business/Cloud:** serve compiled `frontend/dist/` as ordinary
static files under `app.xfree.in`. Do not attempt to host the Rust worker/API in
this shared hosting environment without a verified supported server process
runtime.

**Separate VPS/container host:** compile and run the Rust API; use
`api.xfree.in` with a Caddy TLS reverse proxy.

Preserve `www.xfree.in` on its existing deployment until a separate
migration is approved.

## Static frontend

```bash
cd frontend
npm install
npm run build
```

In Hostinger hPanel, configure `app.xfree.in`, upload the contents
of `frontend/dist/` to the assigned document root, including
the hidden `.htaccess` file. Refresh a nested SPA route after upload.

The default build runs real tools *in the browser*, without any Rust API.
`VITE_API_BASE_URL` defaults to empty. Do not put service credentials
in frontend environment variables.

## Rust development backend

```bash
cd backend
cargo test --workspace
cargo run -p xfree-studio-api
```

Default binding is `127.0.0.1:8080` for development.

## Separate container host

Provision and secure a container-capable host, configure DNS:
`api.xfree.in` → backend VPS public IP.

```bash
cp deploy/.env.example deploy/.env
docker compose --env-file deploy/.env -f deploy/compose.yaml up -d --build
```

The provided Caddy configuration allows a public `/health` endpoint but
**intentionally returns 403 for /v1 and /experimental**. This is by design:
the present starter API has no public identity, quota or tenant isolation.
Do not remove this restriction merely to make the web UI call the API.
First implement server-side authentication, authorization, rate limiting,
abuse prevention, storage and audit logging.

Deploy with off-host backups, explicit host firewall rules, an unattended
security patch policy, health checks, image provenance and rollback procedures.

## Smoke tests

```bash
curl https://api.xfree.in/health
curl -i https://api.xfree.in/v1/agents
```

Expect 200 from health and 403 from `/v1/agents` until production gates pass.
