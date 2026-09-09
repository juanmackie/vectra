# vectra agent contract

## Operating Standard

- Apply `C:\Users\juanm\Documents\GitHub\Vibe Coding Rules 10.md` (V10) as the repository operating standard; read it in full before substantive work.
- This file is the nearest-owning contract. It refines the parent policy with repository-specific facts and cannot weaken a mandatory parent rule; conflicts resolve to the parent.

## Scope and Ownership

Vectra is a browser-only mathematical pattern generator: vanilla HTML, CSS, and JavaScript turning equations into artwork with local history, shareable URL state, and SVG/PNG export. No build step, no runtime dependencies, no external CDNs, no accounts, no server API.

- `index.html` — application shell, controls, accessibility markup.
- `js/main.js` — pattern generation, state, rendering, history, exports.
- `js/about.js` — about-page presentation.
- `about.html`, `license.html` — features/usage guide and third-party license overview.
- `css/` — visual presentation (`style.css`, `about.css`).
- `common/` — self-hosted fonts (Bebas Neue, Geist Sans) and their license files (`common/LICENSES/`).
- `README.md` — user-facing docs; keep its structure, feature list, and getting-started steps accurate when behavior changes.
- `screenshot.png`, `screenshot-about.png` — README imagery; refresh only when the UI changes materially.

No child `AGENTS.md` files exist; this root contract covers the entire repository.

## Constraints

- Keep all processing local in the browser. No frameworks, package dependencies, build tooling, external CDNs, speculative abstraction, or server calls. Preserve the CPU/browser baseline.
- URL hashes and localStorage are untrusted input. Validate type, range, enum, and color values before applying them, and sanitize before embedding anything into exported SVG so malformed state cannot inject markup.
- Generated artwork must stay deterministic for the same validated state.
- Preserve the shipped feature set: all 8 pattern systems, real-time controls and presets, palettes and gradient editor, morphing, lock/shuffle, SVG (1000×1000 editable, plus simplified line art) and PNG (3000×3000) export, share URLs encoding full state, 8-entry localStorage history, keyboard and touch access, mobile layout, and the Copy Share URL button (Clipboard API, secure-context only — serve over localhost/HTTPS).
- Third-party font licenses in `common/LICENSES/` must stay alongside the font files they cover; license.html and `common/LICENSES/` are the license disclosures for Bebas Neue (SIL OFL 1.1) and Lucide icons (ISC).
- Keep index.html semantics intact: labels, focus behavior, ARIA attributes, and disabled/loading/error states for controls are part of the contract, not presentation detail.
- Never commit secrets, local environment files, agent/session state, plans, or generated build output. Do not commit, push, deploy, or perform destructive operations without explicit authorization.

## Verification

There is no test harness, package manager, lockfile, or build system. Evidence is manual and syntactic; there is nothing to run beyond the checks below.

There is no test harness, package manager, or build system. Evidence is manual and syntactic:

- Syntax-check every JavaScript file after algorithm or rendering changes: `node --check js/main.js js/about.js`.
- Serve the root with `python3 -m http.server 8000` (or any static server) and open http://localhost:8000. Exercise in a browser: load, switch all pattern systems, adjust controls and presets, restore history, load a share URL, and export SVG/PNG.
- Confirm malformed URL state falls back safely and cannot add markup to exported SVG.
- For visible UI changes, test keyboard focus and the mobile layout.
- Before closeout, run `git diff --check` and inspect `git status`.

## Known gaps

- No automated tests exist and none are required by the project; the smallest runnable check for any logic change is `node --check` plus a manual browser pass of the affected pattern systems.
- Clipboard-based share URLs and exports were verified manually, not by any scripted harness; browser checks are the only real behavioral evidence.
