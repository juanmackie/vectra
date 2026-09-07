# VECTRA agent contract

## Purpose

VECTRA is a browser-only mathematical pattern generator. It uses vanilla HTML,
CSS, and JavaScript to create equation-driven artwork with local history,
shareable URL state, and SVG/PNG export.

## Ownership

- `index.html` owns the application shell, controls, and accessibility markup.
- `js/main.js` owns pattern generation, state, rendering, history, and exports.
- `js/about.js` owns the about-page presentation.
- `css/` owns visual presentation; `common/` owns self-hosted fonts and
  license files.

## Local Contracts

- The app has no build step, runtime dependencies, accounts, or server API.
  Keep processing local and preserve the CPU/browser baseline.
- URL hashes and localStorage are untrusted input. Validate type, range, enum,
  and color values before applying them or embedding them in SVG.
- Keep generated artwork deterministic for the same validated state. Keep
  share URLs, local history, SVG export, PNG export, and keyboard/touch access.
- Prefer the smallest clear change. Do not add frameworks, dependencies, or
  speculative abstraction. Never commit secrets, local environment files,
  agent/session state, plans, or generated build output.
- Do not commit, push, deploy, or perform destructive operations without
  explicit authorization.

## Verification

- Serve the root with `python -m http.server 8000` and inspect the generator in
  a browser: load, switch all pattern systems, adjust controls, restore history,
  load a share URL, and export SVG/PNG.
- Verify malformed URL state falls back safely and cannot add markup to exported
  SVG. Test keyboard focus and the mobile layout when visible UI changes.
- Run `node --check` on every JavaScript file when algorithm or rendering code
  changes.
- Run `git diff --check` and inspect repository status before closeout.

## Child DOX Index

- No child `AGENTS.md` files. Root-owned source, styles, assets, and pages are
  covered by this contract.
