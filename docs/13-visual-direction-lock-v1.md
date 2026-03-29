# 13 - Visual Direction Lock V1

## Status

This document closes `Sprint V1 - Visual Direction Lock`.

Outputs delivered:

- final visual thesis
- locked palette families
- locked typography pair
- locked material language
- locked shape rules
- 3 target mockups for:
  - prologue
  - hub
  - run
- base theme tokens added to the project

Related files:

- [index.html](C:\Users\Jotape\Documents\gameweb\index.html)
- [styles.css](C:\Users\Jotape\Documents\gameweb\src\styles.css)
- [PrologueScene.ts](C:\Users\Jotape\Documents\gameweb\src\phaser\scenes\PrologueScene.ts)
- [TrainHubScene.ts](C:\Users\Jotape\Documents\gameweb\src\phaser\scenes\TrainHubScene.ts)
- [v1-prologue-target.svg](C:\Users\Jotape\Documents\gameweb\docs\mockups\v1-prologue-target.svg)
- [v1-hub-target.svg](C:\Users\Jotape\Documents\gameweb\docs\mockups\v1-hub-target.svg)
- [v1-run-target.svg](C:\Users\Jotape\Documents\gameweb\docs\mockups\v1-run-target.svg)

## Visual Thesis

`Last Train Home` should feel like a hand-painted railway fable:
warm inside the train, cold outside the light, elegant in silhouette, and calm enough to let melancholy breathe.

The visual target is:

- painterly
- layered
- soft-edged
- emotionally warm
- readable in motion
- restrained in UI chrome

The world should never read as:

- dashboard UI
- flat vector prototype
- noisy fantasy clutter
- neon survival game

## Typography Lock

Display type:

- `Cormorant Garamond`

Role:

- title cards
- chips
- action buttons
- scene titles
- memory titles

Reason:

- editorial, literary, soft, old-world without becoming baroque

UI text type:

- `Manrope`

Role:

- body copy
- prompts
- labels
- secondary information

Reason:

- clean and modern enough for web readability
- calmer than generic system sans
- supports dense HUD text without looking corporate

## Palette Lock

### Core pigments

- `Ink Night` `#10202B`
- `Sky Dusk` `#355565`
- `Mist Blue` `#6C8B99`
- `Cream Paper` `#F3E6CE`
- `Copper Lantern` `#D9A35F`
- `Ember Rust` `#A95A47`
- `Sage Cloth` `#7E9A82`
- `Wagon Wood` `#6F4C3A`
- `Coal Steel` `#2A3740`

### Use rules

- backgrounds are built from `Ink Night`, `Sky Dusk`, and `Mist Blue`
- readable text lands on `Cream Paper`
- warmth comes from `Copper Lantern`, not bright yellow
- danger comes from `Ember Rust`, not saturated red
- support/safety accents come from `Sage Cloth`
- train structure and props sit between `Wagon Wood` and `Coal Steel`

### Emotional split

Inside the train:

- warm amber
- cream cloth
- copper light
- softened wood

Outside the light:

- mist blue
- cold slate
- coal steel
- rust warning

## Material Language Lock

The game should feel built from:

- worn timber
- patched canvas
- hand-stitched cloth
- aged copper
- smoky glass
- cold rail steel

Avoid:

- glossy sci-fi surfaces
- hard plastic
- polished fantasy metal
- flat white UI panels

## Shape Language Lock

### Cats

- rounded torso
- readable ears
- visible tail rhythm
- soft taper in limbs
- silhouette reads before costume detail

### Train

- long horizontal body
- slightly arched roofline
- windows as warm punctuation
- visible weight and suspension
- not a rectangle with wheels

### Humans

- narrower, more vertical silhouettes
- lanterns, nets, coats, poles
- partially obscured faces
- tension from posture and tool shape, not gore

### Dogs

- low forward mass
- aggressive shoulder line
- each class reads differently by head and back line

### Environment

- broad soft shapes first
- detail second
- avoid repeated identical boxes
- every cluster should feel composed, not stamped

## Composition Lock

Gameplay screens should follow this hierarchy:

1. world and character silhouette
2. prompt or danger signal
3. compact state strip
4. secondary controls
5. large overlays only when player attention is intentionally interrupted

The center of the screen should remain visually open during normal play.

## Scene Targets

### Prologue

Mood:

- safe, faded, nostalgic, then suddenly wrong

Composition:

- train low and long across the middle
- lamp glow as the first warm anchor
- wide sky and negative space
- danger intrudes from one side at night

### Hub

Mood:

- intimate, repaired, communal

Composition:

- train is the hero object
- route map secondary
- text lives in one quiet anchored region
- progression is shown by wagon growth and light

### Run

Mood:

- exposed, lyrical, tense at night

Composition:

- horizon and background layers provide atmosphere
- structures punctuate the lane
- player silhouette remains readable against the ground band
- event banner stays compact and cinematic

## What V2 Must Preserve

The next sprint may change layout, but it must keep:

- typography pair
- palette family
- material language
- composition rule that the scene stays primary
- warm-inside vs cold-outside split

## Done Criteria

V1 is considered complete because:

- visual decisions are now explicit instead of ad hoc
- the project has target mockups
- the codebase already reflects the selected fonts and theme tokens
- V2 can now focus on HUD/layout without reopening palette or typography
