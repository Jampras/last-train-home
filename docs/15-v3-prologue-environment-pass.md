# 15 - V3 Prologue Environment Pass

## Goal

Turn the prologue into the first real visual benchmark of the project.

## What Changed

- the sky now uses layered atmosphere instead of a flat banded backdrop
- the safezone gained distant station silhouettes, poles, roofs, and horizon rhythm
- the train was rebuilt as a longer, weighted object with roofline, windows, wheels, chimney, and compartment door
- props were recomposed into crate clusters, lamp post, barricade line, and safer compartment staging
- ground and rails now read in distinct bands
- the disaster gained its own visual state with intrusion light, fence pressure, silhouettes, and darker atmosphere
- the in-canvas text was reduced to a cinematic subtitle so the HUD remains the main prompt surface

## New Standard

- prologue must read as a scene first, not a test map
- calm and disaster must feel like two emotional states of the same place
- the train must carry warmth while the breach comes from the cold edge of the frame
- the opening should still be readable without detailed character art

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`

Updated screenshots were generated under `output/playwright/` for desktop and mobile.
