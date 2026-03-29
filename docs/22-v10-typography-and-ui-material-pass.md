# 22 - V10 Typography and UI Material Pass

## Goal

Make the interface feel authored and native to the train world instead of reading like prototype chrome layered over the game.

## What Changed

- typography hierarchy was tightened:
  - display serif stays on scene titles and major modal headers
  - chips, buttons, eyebrows, and utility labels now use the UI sans in uppercase editorial rhythm
- the HUD material language now reads as crafted metal, smoked glass, and warm paper instead of flat translucent boxes
- the hub detail panel received a more deliberate editorial structure:
  - eyebrow
  - larger leader heading
  - divider before closing guidance
- memory and run-summary overlays now have a title treatment with eyebrow metadata
- settings panel now shares the same framed material language as memory/summary overlays
- touch controls and action docks were restyled to match the same material system

## Files Updated

- `src/app/shell/createShell.ts`
- `src/ui/hud/HudController.ts`
- `src/styles.css`

## New Standard

- gameplay utility text should not compete with emotional scene titles
- controls should read as instrument labels, not generic app buttons
- every major panel should feel like part of the train's visual culture
- overlays should feel denser and richer without increasing layout weight

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`
