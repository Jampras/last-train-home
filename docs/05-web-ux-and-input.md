# 05 - Web UX and Input

## Platform Goals

The game must feel good on:

- desktop browsers with keyboard
- tablets with touch
- phones with touch

Mouse support can exist for menus, but the gameplay layer should not depend on precision pointer play.

## Input Philosophy

The main input language should mirror the clarity of `Kingdom`:

- horizontal motion first
- simple context actions
- readable gestures
- low button count

## Desktop Controls

### Mandatory Mapping

- `A` or `Left Arrow`: move left
- `D` or `Right Arrow`: move right
- `W` or `Up Arrow`: interact
- `S` or `Down Arrow`: quick drop or contextual cancel
- `Space`: spend or confirm contextual action
- `Shift`: leader active ability
- `Tab`: quick role overview
- `Esc`: pause

### Optional Mapping

- `Q` and `E`: cycle targetable build nodes or nearby groups
- `R`: ring bell or context alert if that system exists

## Touch Controls

### Mandatory Gesture Language

- swipe left: move left
- swipe right: move right
- tap hold on build point: inspect or preview build
- tap release on valid target: confirm action
- upward short swipe near interactible: interact
- two-finger tap: pause

### Important Touch Rule

Do not render a giant permanent virtual D-pad by default.

Primary design target:

- gesture-first interaction
- low-chrome edge hints
- optional accessibility toggle for on-screen movement buttons

## Touch Zones

Recommended screen zones:

- lower-left and lower-right: motion swipes
- center: contextual interact prompts
- top corners: pause and log access

The center of the screen must stay visually clear during active play.

## HUD Layout

The HUD should be DOM-based, not canvas-rendered.

Persistent HUD elements:

- station clock
- resource strip
- train status
- current leader icon and ability state
- one compact event banner

Transient HUD:

- contextual interaction prompt
- event cue card
- mastery challenge progress toast
- danger side indicator

## Mobile Layout Rules

- top-left: clock and day/night
- top-right: train status and pause
- bottom-center: context prompt
- bottom edge: optional accessibility action chips

Never cover the middle of the playfield with dense panels during normal play.

## Accessibility

Required options:

- subtitle size small, medium, large
- reduced screen shake
- reduced flashing lights
- separate sliders for music, ambience, and event cues
- color-safe enemy warning indicators
- optional on-screen buttons for touch users

## Sound UX

Clock events rely on unique audio signatures. Therefore:

- event cue sounds must be distinct
- event cue sounds must not be buried under music
- important warning cues need visual backup for accessibility

## Responsive Targets

### Desktop

- baseline target: `1280x720`
- ideal target: `1920x1080`

### Tablet

- baseline target: `1024x768`

### Phone

- baseline target: `390x844`
- support landscape first
- support portrait menus if needed, but gameplay should default to landscape

## Menu Surfaces

Separate DOM surfaces:

- main menu
- route map
- train management
- pause menu
- settings
- end-of-run summary

All of them should suspend or clearly gate gameplay input.
