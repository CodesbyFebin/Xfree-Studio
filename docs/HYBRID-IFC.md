# Hybrid IFC MVP

The existing React/Vite frontend is retained. The Firebase dependency declares ^12.5.0; installed version and real hardware availability must be checked before demo. See [Firebase web hybrid setup](https://firebase.google.com/docs/ai-logic/hybrid/web/get-started).

Inputs default to LOCAL_ONLY. Explicit PUBLIC consent permits hybrid inference; heuristic detection can restrict it again. INTERNAL and TAINTED are denied cloud access. The Workflow Lab executes an editable JSON dependency graph with topological ordering, cycle rejection and label joins. A drag-and-drop canvas is not implemented. Private inference uses ONLY_ON_DEVICE and never retries in cloud. Hybrid public tasks choose preferred device/cloud using a heuristic. Trace source is read from the SDK response, not inferred from the requested mode.

Scope: the build-brief inference path only. This is not a system-wide IFC guarantee. Browser extensions, other app surfaces, storage, telemetry and SDK behavior require separate review. The Workflow Lab includes a public-only IndexedDB queue and deterministic local word-count tool. Recovery is at-least-once and only automatically triggered while the lab is mounted; recovered jobs run inference only. No declassification, visual drag-and-drop canvas, model-generated tool calls, private retry queue or external fallback is implemented. Freshness reports UNKNOWN because no external grounding source is configured. The freshness helper is tested against timestamps.

## Acceptance checks (not yet executed)

- Build: `cd frontend && npm ci && npm run build`.
- Private input online: actual on_device response; inspect network payloads.
- Private input with local model unavailable: error, no cloud request containing prompt.
- PUBLIC direct and multi-step inputs: inspect requested mode and actual source.
- PUBLIC input containing fake SSN: local-only override.
- Private input must not populate the project workspace.
- Confirm configured cloud model is available in Firebase project.

## Workflow Lab checks (not yet executed)

- Open AI or Automation tab; run private and public inputs.
- Disconnect before running a public multi-step input; verify queue persists after reload.
- Reconnect with lab mounted; verify actual cloud response and queue removal.
- Verify restricted input never enters queue.
- Verify word-count receipt matches actual output.
- Test multiple tabs and interrupted recovery before claiming reliable exactly-once behavior.

## Regression suite

Run `cd frontend && npm test` on Node 22.13+ and `npm run build`. Tests cover routing, taint, graph ordering, invalid tools and freshness. The suite has not yet been executed in the target environment. Offline recovery remains inference-only and does not resume the full graph.
