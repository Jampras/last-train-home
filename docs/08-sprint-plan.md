# 08 - Sprint Plan

Assumption:

- 2-week sprints
- small team or solo-friendly sequencing
- each sprint ends with a playable build

## Sprint 0 - Setup and Prototypes

Goal:

- create the project foundation and validate the side-view input feel

Tasks:

- initialize Phaser + TypeScript + Vite project
- set up lint, format, test, and build scripts
- create shell scenes and route flow
- prototype desktop movement
- prototype touch swipe movement
- validate DOM HUD overlay
- add Vercel deployment config

Acceptance:

- project runs locally
- project deploys to Vercel preview
- keyboard left/right works
- touch swipe left/right works on a real device or emulator

## Sprint 1 - Prologue Vertical Slice

Goal:

- build the tutorial-safezone opening through the father death scene

Tasks:

- implement prologue station scene
- add basic interaction points
- add father guide dialogue
- add first lantern and resource interactions
- script the disaster sequence
- implement time skip transition

Acceptance:

- player can finish the prologue from start to time skip
- the tutorial teaches movement, interaction, and lighting
- the father death scene lands clearly without blocking the flow

## Sprint 2 - Main Run Foundation

Goal:

- establish the first real station run

Tasks:

- build `StationRunScene`
- create run state model
- implement station clock
- implement dawn, day, dusk, and night transitions
- add one resource loop
- add one build structure path
- add one simple enemy wave

Acceptance:

- player can enter a run from the train hub
- time advances reliably
- one night can be survived
- run can end in success or failure

## Sprint 3 - Train Hub and Persistence

Goal:

- make progression visible between runs

Tasks:

- implement train hub scene
- create save profile model
- persist unlocked content
- add one wagon build action
- add one end-of-run summary
- add route map placeholder

Acceptance:

- run rewards carry into the hub
- built wagon remains after reload
- end-of-run screen clearly shows gains

## Sprint 4 - Leader System and Mastery

Goal:

- deliver cat-led run variety

Tasks:

- implement leader selection
- add 3 initial leaders
- add leader-specific passives or abilities
- add mastery challenge tracking
- add advanced mastery reward unlock flow

Acceptance:

- choosing a leader changes gameplay meaningfully
- mastery challenge progress is visible
- completing a mastery challenge unlocks a persistent upgrade

## Sprint 5 - Event System and Merchant

Goal:

- make the station feel alive and rewarding over time

Tasks:

- implement event scheduler
- add positive, mixed, hostile, and mysterious event classes
- add unique event audio cues
- implement merchant arrival and dawn payout logic
- add event banners and indicators

Acceptance:

- events trigger at clock windows
- each event class has distinct sound and feedback
- merchant can arrive, persist, and resolve at dawn

## Sprint 6 - Expanded Enemies and Structures

Goal:

- deepen station decision-making and threat variety

Tasks:

- add dog variants
- add human variants
- add more structures and build upgrades
- add role assignment for recruited cats
- tune defense readability

Acceptance:

- at least 5 enemy archetypes exist
- at least 6 structures exist
- role differences are visible in behavior

## Sprint 7 - Narrative Layer and Biomes

Goal:

- connect progression and suspense to the broader world

Tasks:

- add memory scenes and clue system
- create 3 additional station biomes
- wire faction story fragments into station content
- add first version ending condition

Acceptance:

- players uncover story context through runs and hub moments
- biome variety changes visuals and pressure patterns
- version 1 ending can be reached

## Sprint 8 - Touch, Accessibility, and Performance

Goal:

- make the web version production-safe

Tasks:

- tune swipe thresholds
- add optional touch buttons
- add subtitle and audio settings
- reduce motion options
- optimize lighting and effects
- test low-end mobile behavior

Acceptance:

- touch is consistent and readable
- accessibility settings persist
- performance targets are met on minimum target devices

## Sprint 9 - Balance and Release Candidate

Goal:

- turn the functional game into a shippable version 1

Tasks:

- rebalance progression cadence
- tune easy and medium modes
- polish end-of-run summaries
- verify save migration behavior
- fix major bugs
- prepare release deployment

Acceptance:

- full game can be completed without blockers
- easy and medium both teach and reward progression
- release candidate deployed to Vercel
