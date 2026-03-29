# 18 - V6 Hub Visual Pass

## Goal

Make the train hub feel warm, lived-in, and emotionally worth returning to.

## What Changed

- the hub scene was rebuilt around atmosphere instead of flat staging
- the sky now carries layered glow, mist, and distant station mass
- the track bed and platform gained more structure and rhythm
- the train now reads as a longer, heavier object with:
  - roofline variation
  - warm windows
  - smoke
  - carriage growth by progression
  - upgrade glow on evolved wagons
- the selected leader now appears as a hero silhouette near the train
- the route map now sits in a framed vignette instead of floating as bare circles
- in-canvas text was reduced to title, quiet context, and route labels so the HUD remains the detailed information surface

## Stability Fix Included

- the route label texts in the hub are now guarded against scene shutdown timing, preventing a Phaser runtime error during rapid scene transitions in smoke tests

## Files Updated

- `src/phaser/scenes/TrainHubScene.ts`

## New Standard

- the hub should feel like home base, not a menu backdrop
- progression must show up physically in the train silhouette
- route selection should feel like part of the world, not debug UI
- returning from a run should feel warmer than leaving it

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
