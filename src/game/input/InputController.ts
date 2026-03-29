import type { InputAction } from './actions'

type SwipePreset = 'tight' | 'balanced' | 'relaxed'

const TAP_THRESHOLD_MS = 260
const SWIPE_THRESHOLDS: Record<SwipePreset, number> = {
  tight: 18,
  balanced: 28,
  relaxed: 40,
}

interface PointerTracker {
  id: number
  startX: number
  startY: number
  currentX: number
  currentY: number
  startTime: number
}

export class InputController {
  private activeActions = new Set<InputAction>()
  private queuedActions = new Set<InputAction>()
  private pointers = new Map<number, PointerTracker>()
  private clearTimers = new Map<InputAction, number>()
  private moveThreshold = SWIPE_THRESHOLDS.balanced

  bindKeyboard(): void {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
    window.addEventListener('blur', this.clearAll)
  }

  bindTouch(surface: HTMLElement): void {
    surface.addEventListener('pointerdown', this.handlePointerDown)
    surface.addEventListener('pointermove', this.handlePointerMove)
    surface.addEventListener('pointerup', this.handlePointerUp)
    surface.addEventListener('pointercancel', this.handlePointerCancel)
    surface.style.touchAction = 'none'
  }

  isActive(action: InputAction): boolean {
    return this.activeActions.has(action)
  }

  consume(action: InputAction): boolean {
    const hadAction = this.queuedActions.has(action)

    if (hadAction) {
      this.queuedActions.delete(action)
    }

    return hadAction
  }

  trigger(action: InputAction, durationMs = 0): void {
    this.queuedActions.add(action)

    if (durationMs > 0) {
      this.activeActions.add(action)
      const previousTimer = this.clearTimers.get(action)

      if (previousTimer) {
        window.clearTimeout(previousTimer)
      }

      const timer = window.setTimeout(() => {
        this.activeActions.delete(action)
        this.clearTimers.delete(action)
      }, durationMs)

      this.clearTimers.set(action, timer)
    }
  }

  updateTouchPreset(preset: SwipePreset): void {
    this.moveThreshold = SWIPE_THRESHOLDS[preset]
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    window.removeEventListener('blur', this.clearAll)
    this.reset()
  }

  reset(): void {
    this.activeActions.clear()
    this.queuedActions.clear()
    this.pointers.clear()

    for (const timer of this.clearTimers.values()) {
      window.clearTimeout(timer)
    }

    this.clearTimers.clear()
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.repeat) {
      return
    }

    if (event.key === 'a' || event.key === 'ArrowLeft') {
      this.activeActions.add('move_left')
    }

    if (event.key === 'd' || event.key === 'ArrowRight') {
      this.activeActions.add('move_right')
    }

    if (event.key === 'w' || event.key === 'ArrowUp') {
      this.queuedActions.add('interact')
    }

    if (event.key === ' ' || event.key === 'Enter') {
      this.queuedActions.add('confirm')
    }

    if (event.key === 'Shift') {
      this.queuedActions.add('leader_skill')
    }

    if (event.key === 'q' || event.key === 'Q') {
      this.queuedActions.add('crew_command')
    }

    if (event.key === 'Escape' || event.key === 'Tab') {
      this.queuedActions.add('pause')
    }
  }

  private handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'a' || event.key === 'ArrowLeft') {
      this.activeActions.delete('move_left')
    }

    if (event.key === 'd' || event.key === 'ArrowRight') {
      this.activeActions.delete('move_right')
    }
  }

  private handlePointerDown = (event: PointerEvent): void => {
    this.pointers.set(event.pointerId, {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
      startTime: performance.now(),
    })

    if (this.pointers.size >= 2) {
      this.queuedActions.add('pause')
    }
  }

  private handlePointerMove = (event: PointerEvent): void => {
    const pointer = this.pointers.get(event.pointerId)

    if (!pointer) {
      return
    }

    pointer.currentX = event.clientX
    pointer.currentY = event.clientY

    const deltaX = pointer.currentX - pointer.startX
    const deltaY = pointer.currentY - pointer.startY

    if (Math.abs(deltaX) > this.moveThreshold && Math.abs(deltaX) > Math.abs(deltaY)) {
      this.activeActions.add(deltaX < 0 ? 'move_left' : 'move_right')
      this.activeActions.delete(deltaX < 0 ? 'move_right' : 'move_left')
    }
  }

  private handlePointerUp = (event: PointerEvent): void => {
    const pointer = this.pointers.get(event.pointerId)

    if (!pointer) {
      return
    }

    const deltaX = pointer.currentX - pointer.startX
    const deltaY = pointer.currentY - pointer.startY
    const elapsed = performance.now() - pointer.startTime

    if (Math.abs(deltaX) < this.moveThreshold && Math.abs(deltaY) < this.moveThreshold && elapsed <= TAP_THRESHOLD_MS) {
      this.queuedActions.add('confirm')
    } else if (deltaY < -this.moveThreshold && Math.abs(deltaY) > Math.abs(deltaX)) {
      this.queuedActions.add('interact')
    }

    this.finishPointer(event.pointerId)
  }

  private handlePointerCancel = (event: PointerEvent): void => {
    this.finishPointer(event.pointerId)
  }

  private finishPointer(pointerId: number): void {
    this.pointers.delete(pointerId)

    if (this.pointers.size === 0) {
      this.activeActions.delete('move_left')
      this.activeActions.delete('move_right')
    }
  }

  private clearAll = (): void => {
    this.reset()
  }
}
