# 06 - Technical Architecture

## Recommended Stack

- `Phaser` for rendering, timing, camera, sprite animation, and scene orchestration
- `TypeScript` for gameplay systems and content data typing
- `Vite` for frontend build and local development
- `DOM UI` for HUD, menus, overlays, and settings
- `Vercel` for static deployment of the built frontend

## High-Level Architecture Rule

Simulation state must live outside Phaser scenes.

Phaser scenes should:

- render the world
- play animations
- receive player input
- translate input into game actions
- display camera, particles, and scene feedback

Gameplay systems should:

- own clock state
- own run state
- own resources
- own AI logic
- own unlock logic
- own saveable data

## App Layers

### 1. Shell Layer

Responsibilities:

- boot app
- route between menus and gameplay
- mount DOM HUD
- persist settings
- load save data

### 2. Simulation Layer

Responsibilities:

- station generation
- event scheduler
- economy
- cat roles
- enemy behavior state
- progression tracking
- run resolution

### 3. Presentation Layer

Responsibilities:

- scene rendering
- sprite animations
- camera movement
- parallax
- weather and light effects
- hit feedback

### 4. Persistence Layer

Responsibilities:

- profile save
- unlocked cats
- wagon states
- route progression
- settings
- run summary history

## Suggested Directory Structure

```text
src/
  app/
    bootstrap/
    shell/
    routing/
  game/
    simulation/
      core/
      economy/
      clock/
      events/
      progression/
      stations/
      enemies/
      cats/
    presentation/
      scenes/
      entities/
      camera/
      fx/
      audio/
    content/
      cats/
      stations/
      events/
      relics/
      dialogue/
    input/
    save/
    ui/
  assets/
    characters/
    environment/
    ui/
    fx/
    audio/
    data/
```

## Scene Layout

Recommended Phaser scenes:

- `BootScene`
- `PreloadScene`
- `MainMenuScene`
- `PrologueScene`
- `TrainHubScene`
- `StationRunScene`
- `PauseOverlayScene`
- `RunSummaryScene`

## Core Data Models

### Save Profile

Must store:

- unlocked leaders
- completed mastery challenges
- built wagons
- route map state
- unlocked biomes
- collected memory entries
- settings

### Run State

Must store:

- station seed
- current time and day count
- current resources
- recruited cats
- built structures
- active events
- enemy pressure level
- merchant state
- current leader state

## Content-Driven Design

Most game content should live in typed data definitions, not hardcoded scene logic.

Examples:

- cat definitions
- structure definitions
- relic definitions
- station biome definitions
- event definitions
- enemy wave definitions

## Input System

Create an action-based input layer:

- `move_left`
- `move_right`
- `interact`
- `confirm`
- `cancel`
- `leader_skill`
- `pause`

Keyboard and touch should both map into the same action layer.

## Save Strategy

Use browser storage for version 1.

Recommended:

- `localStorage` for settings
- `IndexedDB` or versioned serialized save blob for profile and progression

The game must autosave:

- after each run
- after each unlock
- after each train build action
- after settings changes

## Deployment Notes for Vercel

Recommended deployment model:

- build static frontend with Vite
- output deployable assets to `dist/`
- deploy as a Vercel frontend project

If the game uses SPA routing for menu URLs or route-based shell pages, use a rewrite to `index.html`.

Reference confirmed from Vercel docs:

- Vite is supported as a frontend framework on Vercel
- SPA deep linking can be handled with a `vercel.json` rewrite to `index.html`

Suggested `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Performance Targets

Version 1 targets:

- 60 FPS on mid-range desktop browsers
- 30 to 60 FPS on recent phones in landscape
- low input latency on touch swipes
- no full-scene re-layout from DOM HUD updates

## Visual Tech Requirements

- multi-layer parallax background
- dynamic light masks or convincing fake lighting
- event cue VFX
- weather overlays
- silhouette-readable enemies

## Audio Tech Requirements

- layered ambience
- event cue channel with priority
- music ducking for critical event sounds
- separate sliders by audio category

## Tools and Pipeline

Recommended support tools:

- ESLint
- Prettier
- Vitest for simulation unit tests
- Playwright for browser smoke tests

## Non-Negotiable Engineering Rules

- no core game rules embedded directly in scene `update()` without system boundaries
- no save data based on renderer objects
- no touch-specific gameplay fork that bypasses the action input layer
- no dense HUD rendered permanently inside the Phaser canvas
