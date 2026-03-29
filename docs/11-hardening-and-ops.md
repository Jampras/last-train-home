# 11 - Hardening and Ops

## Current Runtime Status

Validated on `2026-03-29`.

Current status:

- `npm run lint` passing
- `npm run test` passing
- smoke desktop passing
- smoke mobile passing
- `npm run build` passing
- release candidate live on [https://gameweb-xi.vercel.app](https://gameweb-xi.vercel.app)

## Hardening Work Already Applied

- save migration and sanitization for malformed browser data
- progression rebalance for `aconchegante` and `jornada`
- mastery goals aligned with real gameplay conditions
- route finale softened to avoid progression walls
- summary modal expanded with persistent progression context
- HUD overlays now block gameplay correctly
- settings modal now freezes simulation and movement
- central overlay now renders above HUD on mobile
- scene `resize` listeners cleaned on shutdown to avoid mobile crash
- desktop and mobile smoke test script added to the repo

## Automated QA Commands

Development loop:

1. `npm run dev`
2. `npm run lint`
3. `npm run test`
4. `npm run test:smoke -- --url=http://127.0.0.1:4173`
5. `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
6. `npm run build`

Artifacts:

- screenshots and reports go to `output/playwright/`

## What The Smoke Script Verifies

- boot and prologue visibility
- hub transition after prologue
- run start
- settings overlay freezing simulation
- summary overlay blocking the main action button
- accelerated progression through all routes
- desfecho unlock and completion
- absence of `console error`
- absence of `pageerror`

Script entrypoint:

- [scripts/playtest-smoke.mjs](C:\Users\Jotape\Documents\gameweb\scripts\playtest-smoke.mjs)

## Known Weak Points

- Phaser remains the largest production chunk by far; acceptable for now, but still the main payload cost.
- Art is still placeholder-heavy. Visual validation currently checks layout and state more than final polish.
- Smoke scripts rely on `window.__LTH_DEBUG`, so they are for dev validation, not production probing.
- Browser matrix is not yet fully manual across Safari iPhone/iPad and Android hardware.
- Build output shows plugin timing concentration in Vite asset/meta-url phases; this is not a blocker, but it is the current main build-time hotspot.

## Next Practical Improvements

- add a tiny manual browser matrix checklist for Safari iPhone, Safari iPad, Chrome Android and Edge desktop
- introduce lightweight sprite assets so readability checks stop depending on primitive shapes
- add a production-safe health probe or lightweight rendered-state endpoint if remote verification becomes necessary
- consider lazy-loading non-critical HUD/help content if build size becomes a public issue
