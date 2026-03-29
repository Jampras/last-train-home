# 20 - V8 Biome Identity Pass

## Goal

Make each route instantly recognizable by atmosphere, skyline, and ground treatment before the player reads any label.

## What Changed

- the route palette and horizon treatment now vary more aggressively by biome
- `Patio de Carga` now reads as industrial:
  - rust glow
  - stacked freight mass
  - crane lines
  - harder silhouettes
- `Travessia Inundada` now reads as wet and open:
  - colder mist
  - timber rhythm
  - reflection bands
  - broader water cues
- `Borda do Canil` now reads as oppressive:
  - fence repetition
  - warning lights
  - kennel block silhouettes
  - tighter hostile framing
- atmosphere mist color now shifts by biome instead of using one neutral pass everywhere
- the ground bed and rail color now respond to biome context instead of staying globally identical

## Files Updated

- `src/phaser/scenes/StationRunScene.ts`

## New Standard

- route identity should be visible in one screenshot without text
- palette alone is not enough; silhouette rhythm and horizon mass must also change
- every biome should preserve the train as the warm anchor while changing the world around it

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
