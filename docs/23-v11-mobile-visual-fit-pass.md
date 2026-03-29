# 23 - V11 Mobile Visual Fit Pass

## Goal

Preserve the calm, curated feel of the game on smaller screens without turning the HUD into a stacked wall of interface.

## What Changed

- mobile HUD spacing now respects safe-area insets more consistently
- top chips compress more cleanly:
  - tighter typography
  - better line wrapping
  - stacked behavior tuned by breakpoint
- the hub detail panel now behaves better on mobile:
  - shorter footprint
  - internal scroll when needed
  - two-column stat rhythm on medium-small widths
  - one-column fallback only on very narrow widths
- the bottom action dock now behaves like a horizontal control rail on mobile instead of a tall wrapped block
- settings actions keep vertical stacking on mobile instead of inheriting the horizontal rail behavior
- touch controls were reduced in visual mass:
  - smaller footprint
  - right-side column stack
  - more breathing room above safe-area padding
- the hub scene now hides route-map text clutter and redundant painted copy on narrow screens, leaving the DOM HUD to carry the information

## Files Updated

- `src/styles.css`
- `src/ui/hud/HudController.ts`
- `src/phaser/scenes/TrainHubScene.ts`

## New Standard

- mobile should preserve scene clarity before showing extra UI density
- hub information can stay rich, but it must not swallow the first screen
- touch affordances should feel present, not dominant
- scene text painted in canvas should defer to the HUD on narrow viewports

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
