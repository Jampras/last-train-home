# 03 - Core Loop and Systems

## Core Run Structure

Each station run follows this macro loop:

1. Arrive at station
2. Survey immediate safe area around train
3. Explore left and right branches
4. Gather resources and rescue cats
5. Build or upgrade station defenses and utility structures
6. React to scheduled or random clock events
7. Survive nights
8. Decide whether to leave, push longer, or risk collapse
9. Return to the train with rewards and unlocks

## Minute-to-Minute Loop

1. Move horizontally
2. Spot a point of interest
3. Interact or spend a resource
4. Trigger a small outcome
5. Return to safety or continue scouting

Every minute should produce visible state change:

- a lit lamp
- a rebuilt barricade
- a new recruit
- a discovered crate
- a revealed event
- a stronger side of the station

## Day and Night Clock

The game uses a visible station clock that drives:

- light level
- event windows
- merchant timing
- enemy pressure
- resource opportunities
- run pacing

### Suggested Time Map

- `06:00` dawn
- `08:00` event window A
- `12:00` event window B
- `18:00` dusk warning
- `20:00` first hostile window
- `00:00` rare night event window
- `03:00` late-night pressure spike
- `06:00` dawn resolution

## Event System

Events are announced by unique sound cues and brief visual indicators.

Event categories:

### Positive

- merchant arrives
- supply cache appears
- lost kitten calls from off-screen
- old lamp post restarts
- dawn leaves bonus materials

### Mixed

- merchant offers a strong deal but must be protected
- rare crate appears in exposed territory
- fog lowers visibility for both sides
- a signal tower opens but attracts attention

### Hostile

- surprise attack
- dog rush from alternate lane
- sabotage on a lamp chain
- capture squad arrives early

### Mysterious

- strange bell rings
- hidden compartment opens
- memory echo appears
- unknown passenger leaves a token

## Event Tuning Rule

On `Aconchegante` and `Jornada`, the event pool should bias toward positive and mixed events in the early game.

Do not let the event system become a punishment machine.

## Resources

Core resources for version 1:

- `Scrap` for repairs and construction
- `Cloth` for shelters, flags, wraps, and support upgrades
- `Lamp Oil` for light network upkeep
- `Food` for morale and recruitment
- `Coal` for train departure and heavy station machinery
- `Memory Tokens` for permanent meta progression

## Buildable Station Structures

### Mandatory Core Structures

- light post
- light chain connector
- light barricade
- heavy barricade
- lookout perch
- rescue hideout
- scrap workbench
- field kitchen

### Optional Advanced Structures

- decoy lantern
- signal bell
- elevated catwalk
- dog deterrent scent trap
- merchant shelter
- memory totem

## Cat Roles in a Run

Non-leader cats should be assignable into simple readable roles:

- scavenger
- builder
- lamplighter
- scout
- defender
- cook

Role behavior must be indirect and simple. The player should not be forced into heavy micro-management.

## Leader Actions

The player-controlled cat can:

- move left and right
- collect resources
- trigger interactions
- spend resources at build points
- revive or help allies
- issue a contextual nearby command
- use a leader-specific active ability

## Nearby Command Rule

A single contextual command button should cover:

- follow
- hold
- prioritize repair
- prioritize defense
- return to train

Only one command wheel or one contextual action set should exist. Keep command complexity low.

## Enemy Types

### Humans

- `Captor`: uses nets, attempts direct capture
- `Lanternist`: reveals hidden cats and weakens dark cover
- `Handler`: supports dog units
- `Saboteur`: targets lamp chains and weak structures
- `Station Marshal`: elite enemy for special nights

### Dogs

- `Tracker Dog`: fast scout, reveals hidden cats
- `Rush Dog`: lunges at weak barricades
- `Guard Dog`: holds a lane and protects handlers
- `Alpha Hound`: mini-boss pressure unit

## Failure States

A station run ends in failure when one of these conditions is met:

- the train becomes unable to depart
- the leader is captured
- the shelter line fully collapses and the evacuation fails

Even on failure, the player should retain some permanent gains.

## Success States

A station run can end in success by:

- fulfilling station objective and departing
- surviving a target number of nights
- recovering a key story asset
- completing the route requirement for the next node

## Push-Longer Rule

The player should often ask:

- leave now with safe gains
- stay for one more event window
- stay for mastery challenge progress
- stay to protect merchant until dawn

The game should make longer runs attractive before they become demanding.
