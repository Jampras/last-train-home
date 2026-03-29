# 19 - V7 First Run Environment Pass

## Goal

Bring the first playable station to the same level of intent already reached in the prologue and hub.

## What Changed

- the first run scene was rebuilt as an authored environment instead of a lane with placeholders
- the sky now has layered glow, horizon mass, and a clearer station skyline
- the ground, ballast, and rails now read in distinct bands
- the train gained a stronger silhouette and warmer windows
- resource pickups now read by material:
  - scrap pile
  - cloth bundle
  - food basket
  - oil crate
- build nodes now read by function:
  - light post
  - barricade
  - support shelter
  - utility bench
- the merchant now reads as a stall with a lit canopy instead of a block marker
- recruit cats now sit in more believable hiding spots
- train integrity feedback now reads as a dedicated hanging plate instead of a raw flat bar

## Files Updated

- `src/phaser/scenes/StationRunScene.ts`

## New Standard

- the first route should feel like a real place before route variety is expanded further
- screenshots from the run should show atmosphere and readable function at the same time
- pickups and structures should communicate purpose through shape before text
- the train should remain the warm anchor even in the run scene

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
