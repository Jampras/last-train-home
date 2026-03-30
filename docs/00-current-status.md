# 00 - Current Status (Single Source of Truth)

Last update:

- `2026-03-29`

Purpose:

- this file is the official and consolidated status for the project
- use this file for product stage, readiness, blockers, and next sprint
- `progress.md` remains as execution history log only

## Project Stage

- stage: `post-P14`
- status: `ready to start P15`
- release type: `release candidate playable`

## What Is Complete

- playable prologue with disaster and time skip
- persistent hub with routes, wagons, mastery progression, and ending v1
- run loop with day/night, enemies, structures, merchant, summary, and return
- 6 cat leaders implemented in data and selection flow
- 4 active routes in campaign flow
- keyboard + touch + swipe support
- responsive shell with desktop and portrait-mobile support
- automated smoke coverage for desktop and mobile
- live deployment and public repository:
  - Vercel: [https://gameweb-xi.vercel.app](https://gameweb-xi.vercel.app)
  - GitHub: [https://github.com/Jampras/last-train-home](https://github.com/Jampras/last-train-home)

## Quality Baseline (Latest Verified)

- `npm run lint`: passing
- `npm run test`: passing (`14` tests)
- `npm run build`: passing
- `npm run test:smoke -- --url=http://127.0.0.1:4173`: passing
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`: passing

## Current Gap To Expected Objective

Remaining product sprints to hit the full objective:

1. `P15` event pool and memorable stations
2. `P16` leaders, wagons, and mastery depth
3. `P17` audio identity and reactive sound
4. `P18` progression, economy, and difficulty tuning
5. `P19` performance, payload, and device comfort
6. `P20` demo packaging and release prep

## Known Weak Points (Open)

- Phaser bundle remains the largest payload cost in production build
- art is still partially placeholder-driven (strong baseline, not final content pack)
- browser matrix is not yet fully manually validated on real Safari iPhone/iPad and Android hardware

## Immediate Next Action

- start `P15` with route-specific events and stronger run-to-run variety
- update this file at the end of each sprint with:
  - stage
  - pass/fail quality baseline
  - next sprint
