import type { GameStore } from '../game/simulation/core/createGameStore'
import type { EventBanner, EventCue } from '../game/simulation/core/types'

type Note = {
  at: number
  duration: number
  frequency: number
  gain: number
}

export class EventAudioController {
  private audioContext: AudioContext | null = null
  private unlocked = false
  private lastEventKey = ''
  private audioEnabled = true

  constructor(private readonly store: GameStore) {
    this.bindUnlock()
    this.store.subscribe((state) => {
      this.audioEnabled = state.userSettings.audioEnabled
      const event = state.currentEvent

      if (!event) {
        return
      }

      const eventKey = `${event.title}|${event.at}|${event.body}`

      if (eventKey === this.lastEventKey) {
        return
      }

      this.lastEventKey = eventKey
      this.playCue(event)
    })
  }

  private bindUnlock(): void {
    const unlock = async () => {
      if (!this.audioContext) {
        this.audioContext = new AudioContext()
      }

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      this.unlocked = true
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }

    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })
  }

  private playCue(event: EventBanner): void {
    if (!this.unlocked || !this.audioEnabled) {
      return
    }

    const context = this.audioContext

    if (!context) {
      return
    }

    const notes = this.getPattern(event.cue ?? event.tone)
    const startTime = context.currentTime + 0.01

    for (const note of notes) {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = note.frequency > 500 ? 'triangle' : 'sine'
      oscillator.frequency.setValueAtTime(note.frequency, startTime + note.at)
      gainNode.gain.setValueAtTime(0.0001, startTime + note.at)
      gainNode.gain.linearRampToValueAtTime(note.gain, startTime + note.at + 0.02)
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + note.at + note.duration)

      oscillator.connect(gainNode)
      gainNode.connect(context.destination)
      oscillator.start(startTime + note.at)
      oscillator.stop(startTime + note.at + note.duration + 0.02)
    }
  }

  private getPattern(cue: EventCue): Note[] {
    if (cue === 'merchant') {
      return [
        { at: 0, duration: 0.18, frequency: 660, gain: 0.025 },
        { at: 0.14, duration: 0.18, frequency: 880, gain: 0.022 },
        { at: 0.3, duration: 0.24, frequency: 740, gain: 0.02 },
      ]
    }

    if (cue === 'positive') {
      return [
        { at: 0, duration: 0.16, frequency: 540, gain: 0.02 },
        { at: 0.12, duration: 0.18, frequency: 720, gain: 0.018 },
      ]
    }

    if (cue === 'mixed') {
      return [
        { at: 0, duration: 0.16, frequency: 430, gain: 0.02 },
        { at: 0.16, duration: 0.16, frequency: 520, gain: 0.018 },
      ]
    }

    if (cue === 'hostile') {
      return [
        { at: 0, duration: 0.14, frequency: 180, gain: 0.028 },
        { at: 0.1, duration: 0.14, frequency: 140, gain: 0.024 },
      ]
    }

    return [
      { at: 0, duration: 0.16, frequency: 300, gain: 0.018 },
      { at: 0.14, duration: 0.2, frequency: 460, gain: 0.015 },
      { at: 0.34, duration: 0.24, frequency: 380, gain: 0.013 },
    ]
  }
}
