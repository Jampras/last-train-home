# 16 - V4 Character Silhouette Pass

## Goal

Replace marker-like actors with readable silhouettes that carry personality before detailed art exists.

## What Changed

- a shared silhouette renderer was added in `src/phaser/render/drawSilhouettes.ts`
- cats now read with head, ears, tail rhythm, body mass, and small role accents
- the father reads as a larger, steadier silhouette than the protagonist
- recruit kittens now read as characters in need of rescue instead of glowing dots
- crew cats in the run now read as a cluster of small bodies on the train line
- human enemies now separate by posture and tool:
  - captor with net
  - lanternist with lamp
  - saboteur with tool profile
  - handler with staff line
- dog enemies now separate from humans immediately by low forward mass and back line

## Files Updated

- `src/phaser/render/drawSilhouettes.ts`
- `src/phaser/scenes/PrologueScene.ts`
- `src/phaser/scenes/StationRunScene.ts`
- `scripts/playtest-smoke.mjs`

## New Standard

- no actor in the prologue or first run should read as a plain circle or rectangle
- cats must look soft and character-driven even before animation polish
- humans should read as vertical threat silhouettes
- dogs should read as low fast threat silhouettes

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
