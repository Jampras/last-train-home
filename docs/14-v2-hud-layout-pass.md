# 14 - V2 HUD Layout Pass

## Goal

Reduce interface weight during active play so screenshots read as scene first and HUD second.

## What Changed

- hub remains the information-heavy screen
- prologue and run now use:
  - compact top chips
  - a centered prompt card
  - a lighter bottom action dock
- large scene statistics were removed from persistent gameplay HUD
- summary and memory remain modal surfaces for deeper reading
- safe-area padding and mobile spacing were tightened

## Visual Rules Locked In V2

- gameplay should never carry a large left-side dashboard
- contextual instruction lives in one compact prompt surface
- action buttons in gameplay should feel quiet until needed
- detailed progression belongs to the hub or modals

## Acceptance Criteria

- center of the screen stays visually open in prologue and run
- buttons no longer compete with the playfield for attention
- mobile layout keeps the prompt readable without covering the lane
- hub still explains progression without leaking that density into gameplay
