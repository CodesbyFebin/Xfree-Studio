# Xfree Studio reference UI implementation

This branch recreates the structure and styling of the supplied dark/light neon-green mobile screenshots: top navigation, local/cloud toggle, X emblem, circular HUD, voice command, prompt chips, command bar, tool categories, bottom tabs and status panels.

The emblem is a **CSS approximation**, not the supplied image asset; precise visual fidelity requires committing the licensed original transparent logo asset separately. Light mode is a functional theme switch.

Functional behaviors: navigation, theme, local prompt capture, optional browser speech recognition (browser-dependent), file selection (no upload), suggestion chips and existing local project builder. The Cloud mode is a UI placeholder; no AI service, image generation, speech synthesis, A2A or MCP agent is claimed. Never expose the existing unauthenticated Rust development API publicly.

Hostinger static deploy: build frontend and upload dist/ to app.xfree.in. Keep Rust workers on separate compute hosting.
