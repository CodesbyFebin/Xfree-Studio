# Hybrid IFC MVP

The existing React/Vite frontend is retained. The Firebase dependency declares ^12.5.0; installed version and real hardware availability must be checked before demo. See [Firebase web hybrid setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started).

Inputs default to LOCAL_ONLY. Explicit PUBLIC consent permits hybrid inference; heuristic detection can restrict it again. INTERNAL and TAINTED are denied cloud access. The join helper propagates restrictions but is not yet wired to a DAG. Private inference uses ONLY_ON_DEVICE and never retries in cloud. Hybrid public tasks choose preferred device/cloud using a heuristic. Trace source is read from the SDK response, not inferred from the requested mode.

Scope: the build-brief inference path only. This is not a system-wide IFC guarantee. Browser extensions, other app surfaces, storage, telemetry and SDK behavior require separate review. No declassification, offline queue, tool execution, workflow canvas or external fallback is implemented here.

## Acceptance checks (not yet executed)

- Build: `cd frontend && npm ci && npm run build`.
- Private input online: actual on_device response; inspect network payloads.
- Private input with local model unavailable: error, no cloud request containing prompt.
- PUBLIC direct and multi-step inputs: inspect requested mode and actual source.
- PUBLIC input containing fake SSN: local-only override.
- Private input must not populate the project workspace.
- Confirm configured cloud model is available in Firebase project.
