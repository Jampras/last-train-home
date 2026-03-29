import { beforeEach, describe, expect, it } from 'vitest'
import { GameStore } from './createGameStore'

describe('GameStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('starts a run and returns to the hub with persistent rewards', () => {
    const store = new GameStore()

    expect(store.getState().currentScene).toBe('prologue')

    store.completePrologue()

    expect(store.getState().currentScene).toBe('hub')

    store.startRun()

    const runState = store.getState()
    expect(runState.currentScene).toBe('run')
    expect(runState.run).not.toBeNull()

    store.tryInteract()
    store.returnToHub()

    const finalState = store.getState()
    expect(finalState.currentScene).toBe('hub')
    expect(finalState.progress.memoryTokens).toBeGreaterThan(0)
  })

  it('collects a nearby resource node during a run', () => {
    const store = new GameStore()

    store.completePrologue()
    store.startRun()
    store.moveLeader(1, 1.4)

    const beforeCollect = store.getState().run?.resources.food ?? 0
    store.tryInteract()
    const afterCollect = store.getState().run?.resources.food ?? 0

    expect(afterCollect).toBeGreaterThan(beforeCollect)
  })

  it('builds the selected leader wagon in the hub when resources are available', () => {
    const store = new GameStore()

    store.completePrologue()
    store.getState().progress.memoryTokens = 3
    store.getState().progress.blueprintFragments = 3

    store.buildSelectedLeaderWagon()

    expect(store.getState().builtWagonIds).toContain('wagon-mimi')
    expect(store.getState().progress.memoryTokens).toBe(2)
    expect(store.getState().progress.blueprintFragments).toBe(2)
  })

  it('creates a run summary and advances the route after a successful departure', () => {
    const store = new GameStore()

    store.completePrologue()
    store.startRun()

    for (let index = 0; index < 1300; index += 1) {
      store.advanceRun(0.2)

      if (store.getState().run?.canDepart) {
        break
      }
    }

    expect(store.getState().run?.canDepart).toBe(true)

    store.leaveRun()

    expect(store.getState().currentScene).toBe('hub')
    expect(store.getState().lastRunSummary).not.toBeNull()
    expect(store.getState().activeRouteId).toBe('freight-yard')
    expect(store.getState().clues.length).toBe(1)
    expect(store.getState().currentMemory?.title).toBe('Livro de Vigia Rasgado')
    expect(store.getState().lastRunSummary?.clueUnlockedTitle).toBe('Livro de Vigia Rasgado')
    expect(store.getState().lastRunSummary?.nextRouteName).toBe('Patio de Carga')
    expect(store.getState().lastRunSummary?.progressTotals.memoryTokens).toBeGreaterThan(0)
  })

  it('grants persistent mastery progress for the selected leader across runs', () => {
    const store = new GameStore()

    store.completePrologue()

    for (let index = 0; index < 3; index += 1) {
      store.startRun()
      store.returnToHub()
    }

    expect(store.getState().leaderMastery.mimi.points).toBe(3)
    expect(store.getState().leaderMastery.mimi.unlocked).toBe(true)
    expect(store.getState().lastRunSummary?.masteryPointsEarned).toBeGreaterThanOrEqual(0)
  })

  it('applies upgraded wagon bonuses on later runs for the same leader', () => {
    const store = new GameStore()

    store.completePrologue()
    store.getState().progress.memoryTokens = 10
    store.getState().progress.blueprintFragments = 10

    store.buildSelectedLeaderWagon()

    store.getState().leaderMastery.mimi.points = 3
    store.getState().leaderMastery.mimi.unlocked = true

    store.buildSelectedLeaderWagon()
    store.startRun()

    expect(store.getState().upgradedWagonIds).toContain('wagon-mimi')
    expect(store.getState().run?.maxTrainIntegrity).toBe(8)
    expect(store.getState().run?.buildNodes.filter((node) => node.kind === 'defense').every((node) => node.tier >= 1)).toBe(
      true,
    )
  })

  it('keeps the merchant through the night and resolves payout at dawn', () => {
    const store = new GameStore()

    store.completePrologue()
    store.startRun()

    for (let index = 0; index < 900; index += 1) {
      store.advanceRun(0.2)

      if (store.getState().run?.merchant?.active) {
        break
      }
    }

    const merchantResources = store.getState().run?.resources.scrap ?? 0
    expect(store.getState().run?.merchant?.active).toBe(true)

    for (let index = 0; index < 2200; index += 1) {
      store.advanceRun(0.2)

      if (store.getState().run?.merchant === null) {
        break
      }
    }

    expect(store.getState().run?.merchant).toBeNull()
    expect(store.getState().run?.resources.scrap ?? 0).toBeGreaterThanOrEqual(merchantResources)
    expect(store.getState().currentEvent?.title).toBe('Acerto ao Amanhecer')
  })

  it('starts the expanded station with at least six structures and reaches at least five enemy archetypes over longer runs', () => {
    const store = new GameStore()

    store.completePrologue()
    store.startRun()

    expect(store.getState().run?.buildNodes.length).toBeGreaterThanOrEqual(6)
    const seenKinds = new Set<string>()

    for (let index = 0; index < 1500; index += 1) {
      store.advanceRun(0.2)
      for (const enemy of store.getState().run?.enemies ?? []) {
        seenKinds.add(enemy.kind)
      }

      if (seenKinds.size >= 5) {
        break
      }
    }

    expect(seenKinds.size).toBeGreaterThanOrEqual(5)
  })

  it('recruits cats and lets crew roles support the run over time', () => {
    const store = new GameStore()

    store.completePrologue()
    store.startRun()
    store.moveLeader(-1, 2.6)
    store.tryInteract()

    expect(store.getState().run?.recruitedCats.length).toBe(1)
    expect(store.getState().run?.metrics.recruitsSaved).toBe(1)

    const beforeScrap = store.getState().run?.resources.scrap ?? 0
    store.advanceRun(23)

    expect(store.getState().run?.resources.scrap ?? 0).toBeGreaterThan(beforeScrap)

    const previousRole = store.getState().run?.recruitedCats[0]?.role
    store.cycleCrewRole()
    expect(store.getState().run?.recruitedCats[0]?.role).not.toBe(previousRole)
  })

  it('applies route-specific biome profile when starting a non-initial station', () => {
    const store = new GameStore()

    store.completePrologue()
    store.getState().routeNodes = store.getState().routeNodes.map((route) => ({
      ...route,
      status: route.id === 'flooded-crossing' ? 'current' : route.id === 'quiet-platform' ? 'cleared' : 'available',
    }))
    store.getState().activeRouteId = 'flooded-crossing'

    store.startRun()

    expect(store.getState().run?.routeId).toBe('flooded-crossing')
    expect(store.getState().run?.biome).toBe('Mare')
    expect(store.getState().run?.moveSpeed).toBeLessThan(270)
  })

  it('can resolve the version one ending once it is unlocked in the hub', () => {
    const store = new GameStore()

    store.completePrologue()
    store.getState().endingUnlocked = true
    store.getState().endingCompleted = false

    store.startRun()

    expect(store.getState().currentScene).toBe('hub')
    expect(store.getState().endingCompleted).toBe(true)
    expect(store.getState().currentMemory?.title).toBe('O Que o Trem Carrega')
  })

  it('persists accessibility settings and swipe presets', () => {
    const store = new GameStore()

    store.completePrologue()
    store.toggleAudio()
    store.toggleSubtitles()
    store.toggleReducedMotion()
    store.toggleTouchControls()
    store.cycleSwipePreset()

    expect(store.getState().userSettings.audioEnabled).toBe(false)
    expect(store.getState().userSettings.subtitlesEnabled).toBe(false)
    expect(store.getState().userSettings.reducedMotion).toBe(true)
    expect(store.getState().userSettings.touchControlsEnabled).toBe(true)
    expect(store.getState().userSettings.swipePreset).toBe('relaxed')

    const rehydrated = new GameStore()
    expect(rehydrated.getState().userSettings.audioEnabled).toBe(false)
    expect(rehydrated.getState().userSettings.touchControlsEnabled).toBe(true)
    expect(rehydrated.getState().userSettings.swipePreset).toBe('relaxed')
  })

  it('sanitizes corrupted persisted profiles and migrates old save fragments safely', () => {
    window.localStorage.setItem(
      'last-train-home.profile',
      JSON.stringify({
        prologueCompleted: true,
        selectedLeaderId: 'lider-falso',
        difficulty: 'pesadelo',
        builtWagonIds: ['wagon-mimi'],
        upgradedWagonIds: ['wagon-lua'],
        activeRouteId: 'rota-falsa',
        userSettings: {
          audioEnabled: false,
          swipePreset: 'gigante',
        },
        progress: {
          memoryTokens: 4.8,
          blueprintFragments: -2,
          routeMarks: 'muito',
        },
        routeNodes: [
          { id: 'quiet-platform', status: 'cleared' },
          { id: 'freight-yard', status: 'current' },
          { id: 'rota-falsa', status: 'locked' },
        ],
        lastRunSummary: {
          leaderName: 'Velha lider',
          stationName: 'Estacao quebrada',
          success: true,
          rewards: { memoryTokens: 1, blueprintFragments: 1, routeMarks: 1 },
          progressTotals: { memoryTokens: 5, blueprintFragments: 2, routeMarks: 2 },
        },
      }),
    )

    const store = new GameStore()

    expect(store.getState().selectedLeaderId).toBe('mimi')
    expect(store.getState().difficulty).toBe('jornada')
    expect(store.getState().builtWagonIds).toContain('wagon-lua')
    expect(store.getState().userSettings.audioEnabled).toBe(false)
    expect(store.getState().userSettings.swipePreset).toBe('balanced')
    expect(store.getState().progress.memoryTokens).toBe(4)
    expect(store.getState().progress.blueprintFragments).toBe(0)
    expect(store.getState().routeNodes.find((route) => route.id === 'quiet-platform')?.status).toBe('cleared')
    expect(store.getState().routeNodes.find((route) => route.id === 'freight-yard')?.status).toBe('current')
    expect(store.getState().lastRunSummary?.difficulty).toBe('jornada')
  })

  it('makes aconchegante more forgiving than jornada at run start and first wave', () => {
    const journey = new GameStore()
    journey.completePrologue()
    journey.startRun()

    for (let index = 0; index < 900; index += 1) {
      journey.advanceRun(0.2)

      if ((journey.getState().run?.enemies.length ?? 0) > 0) {
        break
      }
    }

    const journeyRun = journey.getState().run

    window.localStorage.clear()

    const cozy = new GameStore()
    cozy.completePrologue()
    cozy.toggleDifficulty()
    cozy.startRun()

    for (let index = 0; index < 900; index += 1) {
      cozy.advanceRun(0.2)

      if ((cozy.getState().run?.enemies.length ?? 0) > 0) {
        break
      }
    }

    const cozyRun = cozy.getState().run

    expect(cozyRun?.maxTrainIntegrity).toBeGreaterThan(journeyRun?.maxTrainIntegrity ?? 0)
    expect(cozyRun?.resources.scrap).toBeGreaterThan(journeyRun?.resources.scrap ?? 0)
    expect(cozyRun?.buildNodes.filter((node) => node.tier > 0).length).toBeGreaterThan(
      journeyRun?.buildNodes.filter((node) => node.tier > 0).length ?? 0,
    )
    expect(cozyRun?.enemies.length).toBeLessThan(journeyRun?.enemies.length ?? Number.POSITIVE_INFINITY)
  })
})
