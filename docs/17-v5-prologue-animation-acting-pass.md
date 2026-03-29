# 17 - V5 Prologue Animation and Acting Pass

## Goal

Add life, softness, and clearer emotional acting to the opening before frame-by-frame animation exists.

## What Changed

- cat silhouettes now support lightweight pose parameters:
  - bob
  - stretch
  - tail lift
  - head lift
  - crouch
- the protagonist now breathes at rest and carries more urgency during the breach
- the father now reads as steadier in calm scenes and more braced during the disaster
- the stray kitten now trembles under threat instead of staying perfectly static
- chimney smoke and lamp glow now pulse more naturally
- the breach beat now flashes more clearly at the moment of escalation
- the timeskip gained stronger fade and vertical drift
- letterbox bars were added to help the prologue read more cinematically

## Files Updated

- `src/phaser/render/drawSilhouettes.ts`
- `src/phaser/scenes/PrologueScene.ts`
- `scripts/playtest-smoke.mjs`

## New Standard

- the opening must feel alive before the player even moves
- characters should communicate emotion through weight and posture, not only text
- disaster escalation should be legible in motion even with placeholder art
- animation polish should preserve the soft, restrained tone of the game

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
