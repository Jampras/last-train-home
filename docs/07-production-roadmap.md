# 07 - Production Roadmap

## Delivery Goal

Ship a complete playable web game on Vercel with:

- prologue
- train hub
- multiple station runs
- permanent progression
- multiple cat leaders
- keyboard and touch controls
- end-of-run summaries
- polished presentation

## Current Status

As of the latest documented pass:

- core visual foundation through `V12` is complete
- prologue, hub, run loop, persistence, and ending v1 are already working
- GitHub and Vercel publication are live

The next roadmap focus is:

- onboarding clarity
- run readability
- content depth
- progression tuning
- performance and release prep

See:

- `25-post-v12-execution-roadmap.md`

## Production Phases

### Phase 0 - Pre-Production Lock

Outputs:

- all current documentation approved
- final working title decision
- visual direction board
- feature priority lock for version 1

Exit criteria:

- no unresolved questions about core loop
- no unresolved questions about progression model
- first-release scope frozen

### Phase 1 - Vertical Slice

Outputs:

- one playable station run
- one leader
- one train hub loop
- one day/night cycle
- one event cue
- one enemy wave set

Exit criteria:

- can play from hub to run to summary
- progression data persists
- one complete beginner experience works

### Phase 2 - Core Systems Completion

Outputs:

- full run framework
- event scheduler
- role assignment
- multiple station structures
- merchant event
- mastery challenge tracking

Exit criteria:

- all core systems exist in functional form
- balance rough pass completed

### Phase 3 - Content Expansion

Outputs:

- 4 station biomes
- 6 leaders
- story beats through version 1 ending
- event pool breadth
- enemy roster completion

Exit criteria:

- game content supports many distinct runs
- progression cadence feels strong across several hours

### Phase 4 - Web and Touch Polish

Outputs:

- responsive HUD
- swipe control tuning
- mobile readability pass
- performance pass

Exit criteria:

- desktop and touch both feel first-class
- no blocking UX issue remains

### Phase 5 - QA and Release

Outputs:

- bug triage complete
- save migration tested
- deployment pipeline validated
- store page copy and screenshots ready

Exit criteria:

- release candidate approved
- Vercel deployment stable

## Team Roles Needed

Minimum execution team:

- game designer
- gameplay programmer
- UI programmer or frontend engineer
- 2D artist and animator
- sound designer and composer
- QA support

One person can cover multiple roles in a solo or small team setup, but these responsibilities still need explicit ownership.

## Priority Rules

Must-have before polish:

- progression loop
- station run loop
- cat leader differentiation
- train growth visibility
- keyboard and touch support
- saving and loading

Can wait until later:

- extra difficulty mode beyond medium
- cosmetics beyond readability and warmth
- optional achievement meta outside mastery

## Major Risks

### 1. Scope Creep

The mix of systems can explode if every cat, wagon, and event gets too bespoke.

Mitigation:

- keep leader kit count small and high-impact
- reuse structure frameworks
- keep event definitions data-driven

### 2. Touch Friction

Gesture controls can feel vague if interactions are overloaded.

Mitigation:

- prototype touch from sprint 1
- keep gestures few and stable
- include optional accessibility button overlay

### 3. Weak Progression Cadence

If too many runs end without strong rewards, retention will drop.

Mitigation:

- hard rule that every run grants visible progress
- tune unlock costs around early player success

### 4. Excessive Harshness

If the game becomes too punishing, it will betray the intended audience.

Mitigation:

- balance around `Jornada`, not hard mode
- bias early event pools toward positive outcomes
- preserve partial rewards on failed runs

## Next Sprint Track

Recommended next execution order after visual consolidation:

1. `P13` Onboarding and First 20 Minutes
2. `P14` Run Readability and Feedback
3. `P15` Event Pool and Memorable Stations
4. `P16` Leaders, Wagons, and Mastery Depth
5. `P17` Audio Identity and Reactive Sound
6. `P18` Progression, Economy, and Difficulty Tuning
7. `P19` Performance, Payload, and Device Comfort
8. `P20` Demo Packaging and Release Prep
