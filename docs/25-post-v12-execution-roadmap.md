# 25 - Post V12 Execution Roadmap

## Goal

Move from a visually consolidated vertical slice to a stronger, clearer, more complete version 1 that feels good to learn, good to replay, and stable on the web.

This roadmap assumes:

- visual foundation V1 to V12 is complete
- the game already has a working prologue, hub, run loop, persistence, and deployment
- the biggest remaining gap is not raw rendering quality
- the biggest remaining gap is product clarity, content depth, progression cadence, and final gameplay polish

## Current Reality

What is already strong:

- prologue has emotional framing
- hub has persistence and visual identity
- station run has atmosphere and route differentiation
- keyboard and touch already work
- smoke automation already exists

What still keeps the game below the expected result:

- onboarding still relies too much on prompt reading
- runs need more memorable moment-to-moment variation
- leaders and wagons need stronger practical differentiation over many runs
- audio identity is still underdeveloped
- progression needs a more deliberate reward cadence across the first hour
- low-end device comfort and payload discipline still need a pass

## Delivery Principle

The next phase should optimize for:

- immediate understanding
- stronger feedback
- more memorable run moments
- clearer reward cadence
- more content per hour played
- safer release quality on the web

## Sprint P13 - Onboarding and First 20 Minutes

Goal:

- make the game easier to understand without adding more text

Tasks:

- convert the most important tutorial guidance into more visual or state-based teaching
- reduce repeated prompt phrasing and teach verbs in sequence
- improve first-run clarity for:
  - movement
  - interaction
  - crew role change
  - leader skill
  - retreat vs departure
- add a lightweight controls/help overlay reachable from the HUD
- review the first 20 minutes for dead time and confusion spikes

Deliverables:

- revised first-session flow
- controls/help overlay
- first-20-minutes playtest checklist

Definition of done:

- a new player can understand the basic loop with minimal explanation
- first-session confusion points are documented and reduced

Validation:

- desktop smoke
- mobile smoke
- first-session manual playtest from clean save

Estimated solo effort:

- 2 to 4 days

## Sprint P14 - Run Readability and Feedback

Goal:

- make every important state change easier to read during live play

Tasks:

- improve feedback for:
  - successful interaction
  - failed interaction
  - build completion
  - crew role change
  - train damage
  - can-depart state
  - merchant arrival and departure
- add clearer visual priority between:
  - prompt
  - event banner
  - urgent danger
  - optional info
- tighten enemy readability by role, especially in night pressure
- add stronger feedback for mastery progress earned in-run and after-run

Deliverables:

- feedback polish pass for the run loop
- clearer urgency hierarchy

Definition of done:

- players can tell what just happened and what matters next without rereading the HUD

Validation:

- run-to-summary manual test
- screenshot review at calm, mixed, and hostile moments

Estimated solo effort:

- 3 to 4 days

## Sprint P15 - Event Pool and Memorable Stations

Goal:

- make runs feel less system-demo and more story-generating

Tasks:

- expand event pool with more positive, mixed, and mystery beats
- add at least one memorable route-specific event per biome
- improve merchant variations and dawn payout readability
- add more world moments that reward staying longer without punishing too early
- ensure early event pool is generous in `aconchegante` and `jornada`

Deliverables:

- broader event pool
- route-specific event moments
- event tuning notes

Definition of done:

- repeated runs generate noticeably different but readable stories

Validation:

- multi-run manual sampling across all routes
- event occurrence sanity check

Estimated solo effort:

- 4 to 6 days

## Sprint P16 - Leaders, Wagons, and Mastery Depth

Goal:

- make leader choice matter more over several runs

Tasks:

- deepen the practical identity of each leader in play
- add stronger behavior differences between wagon basics and upgraded wagon states
- review mastery goals for fairness, clarity, and variety
- add clearer reward presentation when mastery milestones unlock
- expand the roster if needed only after current leaders feel distinct

Deliverables:

- leader differentiation pass
- mastery progression pass
- wagon identity pass

Definition of done:

- players can explain why they would choose one leader over another
- mastery progression feels like real strategic expansion, not a checklist

Validation:

- back-to-back runs with different leaders
- mastery progression verification from clean and progressed saves

Estimated solo effort:

- 4 to 6 days

## Sprint P17 - Audio Identity and Reactive Sound

Goal:

- give the game a stronger emotional signature and clearer event recognition

Tasks:

- add or improve event cue families:
  - positive
  - hostile
  - mystery
  - merchant
  - dawn
- add interaction feedback sounds for build, recruit, role swap, and departure
- create stronger ambient separation for:
  - prologue
  - hub
  - each route
- review audio mix against reduced-motion and subtitle settings

Deliverables:

- event cue pass
- interaction cue pass
- ambient identity pass

Definition of done:

- players can anticipate event tone by sound alone
- the game feels materially more alive with audio on

Validation:

- manual audio review with settings toggles
- browser test on desktop and mobile

Estimated solo effort:

- 3 to 5 days

## Sprint P18 - Progression, Economy, and Difficulty Tuning

Goal:

- make progression feel stronger and more reliable over the first hours

Tasks:

- tune early unlock cadence so each run grants visible value
- rebalance memory, fragments, route marks, and wagon unlock pacing
- review `aconchegante` and `jornada` for recovery margin and frustration points
- tune event reward frequency vs danger escalation
- align run length targets for:
  - short run
  - standard run
  - long run

Deliverables:

- tuning spreadsheet or balancing notes
- revised progression targets for first hour and first three sessions

Definition of done:

- progression feels generous without becoming flat
- difficulty teaches before it punishes

Validation:

- clean-save balance run series
- progressed-save balance run series

Estimated solo effort:

- 4 to 6 days

## Sprint P19 - Performance, Payload, and Device Comfort

Goal:

- make the game safer on lower-end devices and in weaker browser conditions

Tasks:

- profile bundle and loading cost
- reduce unnecessary runtime work in scenes and HUD updates
- review mobile and low-height viewport comfort
- test degraded cases:
  - reduced motion on
  - touch overlay on
  - long play session
  - repeated scene transitions
- create a short compatibility matrix for target devices and browsers

Deliverables:

- performance pass
- device matrix
- prioritized optimization list

Definition of done:

- no major comfort issue remains on intended desktop and mobile targets

Validation:

- build audit
- smoke desktop/mobile
- manual long-session test

Estimated solo effort:

- 3 to 5 days

## Sprint P20 - Demo Packaging and Release Prep

Goal:

- prepare a clean public-facing version 1 demo

Tasks:

- choose a clear demo slice and end condition
- polish title screen, controls help, and release messaging
- capture official screenshots and short clips
- update README and docs for public handoff
- run final bug triage and known-issues pass
- publish refreshed build to GitHub and Vercel

Deliverables:

- demo-ready build
- screenshot pack
- release notes
- known issues list

Definition of done:

- a new player can start, learn, finish a satisfying slice, and understand what the game is

Validation:

- clean-save end-to-end manual playtest
- smoke desktop/mobile
- production deploy verification

Estimated solo effort:

- 2 to 4 days

## Recommended Order

1. `P13` onboarding
2. `P14` feedback
3. `P15` event pool
4. `P16` leaders and mastery
5. `P17` audio
6. `P18` progression tuning
7. `P19` performance and comfort
8. `P20` demo packaging

## What To Avoid Next

- no new large art detours before onboarding and feedback improve
- no major feature expansion before progression cadence is tuned
- no content explosion before leaders and events feel distinct enough
- no release push before device comfort and payload review

## Success Condition

The game reaches the expected result when:

- new players understand it quickly
- the first hour feels rewarding
- leaders and routes feel meaningfully different
- audio and feedback make the world feel alive
- desktop and mobile both feel intentional
- the demo build is stable, memorable, and easy to explain
