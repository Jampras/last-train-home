# 09 - QA and Definition of Done

## Definition of Done for Version 1

The game is done for version 1 when all of the following are true:

- prologue is complete and polished
- the main game loop from hub to run to summary works
- at least 4 station biomes are playable
- at least 6 leader cats are unlockable
- mastery upgrades work and persist
- keyboard support is complete
- touch and swipe support is complete
- save and load are stable
- the game can be deployed and played on Vercel
- easy and medium modes are balanced enough for public testing

## Functional Test Matrix

### Core Flow

- new game start
- prologue completion
- time skip transition
- first run entry
- run success
- run failure
- return to train hub
- unlock consumption and wagon build
- next run with changed state

### Progression

- unlock new leader
- switch leader
- progress mastery challenge
- complete mastery challenge
- unlock advanced leader upgrade
- unlock route node
- unlock biome

### Systems

- day/night transitions
- event timing
- merchant arrival and departure
- dawn bonus payout
- resource pickup and spend
- role assignment
- enemy spawn scaling
- capture and rescue

### Input

- desktop keyboard only
- touch swipe movement
- touch interact
- pause on desktop
- pause on touch
- settings navigation by keyboard
- settings navigation by touch

### Save and Recovery

- autosave after run
- autosave after unlock
- reload after browser refresh
- resume after accidental tab close
- corrupted save fallback behavior

## Content Review Checklist

- each leader has a clear fantasy
- each mastery challenge matches the leader identity
- each biome changes play enough to matter
- event pool remains readable and not noisy
- run rewards stay frequent enough to maintain progression feeling

## UX Review Checklist

- HUD never hides essential action space
- event cues are understandable
- touch gestures feel intentional
- tutorial language is concise
- failure screens show retained progress clearly

## Audio Review Checklist

- event cues are distinct
- danger cues cut through ambience
- music does not hide warning sounds
- audio sliders work independently

## Performance Checklist

- desktop target meets 60 FPS in normal scenes
- mobile target stays playable during night waves
- HUD updates do not trigger heavy layout thrash
- scene transitions avoid long stalls

## Browser Coverage

Minimum browsers to validate:

- Chrome desktop
- Edge desktop
- Safari iPad
- Chrome Android
- Safari iPhone

## Release Blocking Bugs

The build cannot ship if any of these remain:

- save corruption
- input deadlock
- impossible progression state
- mastery unlock not persisting
- train hub soft lock
- run unable to end
- touch-only players unable to complete core actions

## Recommended Test Cadence

- smoke test every commit on desktop
- touch regression test every sprint
- save/load regression test every sprint
- full progression path test before each milestone

## Automated Commands

Current automated commands:

- `npm run lint`
- `npm run test`
- `npm run test:smoke -- --url=http://127.0.0.1:4173`
- `npm run test:smoke:mobile -- --url=http://127.0.0.1:4173`

Artifacts:

- reports and screenshots are written to `output/playwright/`

## Latest Audit Findings Fixed

Latest hardening pass fixed:

- run advancing behind the settings overlay
- movement still being accepted with the settings overlay open
- summary modal staying visually behind the HUD on mobile
- stale `resize` listeners causing scene errors on mobile transitions
