# 21 - V9 FX and Lighting Pass

## Goal

Add the finish layer that makes the world feel lit, staged, and more intentional without hiding gameplay readability.

## What Changed

- the station run now has a dedicated FX lighting layer:
  - soft vignette at the frame edges
  - warm train light pools
  - stronger ground spill from built light posts
  - merchant stall glow
  - lanternist glow for hostile readability at night
  - darker pressure band during night phases
- the prologue now has a matching lightweight lighting pass:
  - lamp spill reads more clearly on the ground
  - train warmth is staged as the safe anchor
  - intrusion danger now adds a hostile red wash during the breach
- a broken accented string in the hub was normalized to ASCII-safe copy

## Files Updated

- `src/phaser/scenes/StationRunScene.ts`
- `src/phaser/scenes/PrologueScene.ts`
- `src/phaser/scenes/TrainHubScene.ts`

## New Standard

- warm light should always anchor the train and safe interactions
- hostile light should read differently from sanctuary light
- edge darkening must support focus, not obscure actionable space
- lighting should strengthen silhouette readability before adding spectacle

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
