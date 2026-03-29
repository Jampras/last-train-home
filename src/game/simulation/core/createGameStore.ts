import { resolveClockEvent } from '../../content/events'
import { leaders } from '../../content/leaders'
import { getEndingMemory, getStoryEntryForRoute } from '../../content/story'
import { createInitialRouteNodes, wagonBlueprints } from '../../content/wagons'
import { loadPersistedProfile, savePersistedProfile } from '../../save/profileStorage'
import type {
  BuildNodeState,
  ClockPhase,
  ClockState,
  CrewRole,
  DifficultyId,
  EnemyUnitState,
  EventBanner,
  GameState,
  LaneSide,
  LeaderMasteryState,
  ProgressState,
  RecruitNodeState,
  ResourceNodeState,
  ResourceState,
  RouteNode,
  RunState,
  RunSummary,
  UserSettings,
} from './types'

type Listener = (state: GameState) => void
type WindowKey = 'dawn' | 'morning' | 'noon' | 'nightfall' | 'midnight' | 'predawn'
type MasteryAwardResult = {
  pointsEarned: number
  challengeCompleted: boolean
  unlocked: boolean
  message: string
}

const WINDOW_MARKERS: Array<{ minute: number; key: WindowKey }> = [
  { minute: 0, key: 'midnight' },
  { minute: 180, key: 'predawn' },
  { minute: 360, key: 'dawn' },
  { minute: 480, key: 'morning' },
  { minute: 720, key: 'noon' },
  { minute: 1200, key: 'nightfall' },
]
const CREW_ROLE_ORDER: CrewRole[] = ['scavenger', 'builder', 'lamplighter', 'defender', 'cook']
const DEFAULT_CREW_COLORS = [0xc89fae, 0x95c4a5, 0x94b3d1, 0xf2c078, 0xd8c5ae]

function createClock(totalMinutes: number): ClockState {
  const minuteOfDay = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440
  const day = Math.floor(totalMinutes / 1440) + 1
  const hours = Math.floor(minuteOfDay / 60)
  const minutes = minuteOfDay % 60

  let phase: ClockPhase

  if (minuteOfDay >= 360 && minuteOfDay < 540) {
    phase = 'dawn'
  } else if (minuteOfDay >= 540 && minuteOfDay < 1080) {
    phase = 'day'
  } else if (minuteOfDay >= 1080 && minuteOfDay < 1200) {
    phase = 'dusk'
  } else {
    phase = 'night'
  }

  return {
    day,
    totalMinutes,
    timeLabel: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    phase,
  }
}

function clampResource(value: number): number {
  return Math.max(0, value)
}

function emptyResources(): ResourceState {
  return {
    scrap: 0,
    cloth: 0,
    lampOil: 0,
    food: 0,
    coal: 0,
  }
}

function getClockAdvanceRate(difficulty: DifficultyId): number {
  return difficulty === 'aconchegante' ? 7.25 : 8
}

function getBaseRunResources(difficulty: DifficultyId): ResourceState {
  if (difficulty === 'aconchegante') {
    return {
      scrap: 7,
      cloth: 4,
      lampOil: 4,
      food: 4,
      coal: 3,
    }
  }

  return {
    scrap: 6,
    cloth: 3,
    lampOil: 3,
    food: 3,
    coal: 2,
  }
}

function getStarterBuildNodes(difficulty: DifficultyId): BuildNodeState[] {
  const nodes = buildNodes()

  if (difficulty === 'aconchegante') {
    return nodes.map((node) => {
      if (node.id === 'west-lamp' || node.id === 'center-bench' || node.id === 'east-shelter') {
        return { ...node, tier: 1 }
      }

      return node
    })
  }

  return nodes.map((node) => (node.id === 'west-lamp' ? { ...node, tier: 1 } : node))
}

function getStarterResourceNodes(difficulty: DifficultyId): ResourceNodeState[] {
  const nodes = resourceNodes()

  if (difficulty === 'aconchegante') {
    return nodes.map((node) => ({
      ...node,
      amount: node.amount + 1,
    }))
  }

  return nodes.map((node) =>
    node.kind === 'scrap' || node.kind === 'food' ? { ...node, amount: node.amount + 1 } : node,
  )
}

function buildNodes(): BuildNodeState[] {
  return [
    { id: 'west-lamp', label: 'Lampiao Oeste', x: 720, side: 'west', kind: 'light', tier: 0, maxTier: 2, baseCost: 2 },
    { id: 'west-chain', label: 'Corrente de Luz', x: 860, side: 'west', kind: 'light', tier: 0, maxTier: 2, baseCost: 2 },
    { id: 'west-post', label: 'Posto de Vigia', x: 980, side: 'west', kind: 'defense', tier: 0, maxTier: 2, baseCost: 3 },
    { id: 'center-bench', label: 'Bancada de Sucata', x: 1240, side: 'west', kind: 'utility', tier: 0, maxTier: 2, baseCost: 2 },
    { id: 'east-shelter', label: 'Abrigo Leste', x: 1580, side: 'east', kind: 'support', tier: 0, maxTier: 2, baseCost: 2 },
    { id: 'east-kitchen', label: 'Cozinha de Campo', x: 1710, side: 'east', kind: 'utility', tier: 0, maxTier: 2, baseCost: 2 },
    { id: 'east-bell', label: 'Sino de Alerta', x: 1820, side: 'east', kind: 'defense', tier: 0, maxTier: 2, baseCost: 3 },
  ]
}

function resourceNodes(): ResourceNodeState[] {
  return [
    { id: 'west-scrap', label: 'Caixa de Sucata', x: 540, kind: 'scrap', amount: 2, collected: false },
    { id: 'west-cloth', label: 'Fardo de Tecido', x: 860, kind: 'cloth', amount: 1, collected: false },
    { id: 'east-food', label: 'Cesta de Mantimentos', x: 1680, kind: 'food', amount: 2, collected: false },
    { id: 'east-oil', label: 'Tambor de Oleo', x: 2020, kind: 'lampOil', amount: 1, collected: false },
  ]
}

function recruitNodes(): RecruitNodeState[] {
  return [
    { id: 'recruit-pipoca', catName: 'Pipoca', label: 'Filhote escondido', x: 640, recruited: false },
    { id: 'recruit-lili', catName: 'Lili', label: 'Gata vigia perdida', x: 1460, recruited: false },
    { id: 'recruit-toro', catName: 'Toro', label: 'Gato de carga ferido', x: 1940, recruited: false },
    { id: 'recruit-juca', catName: 'Juca', label: 'Mensageiro acuado', x: 2260, recruited: false },
  ]
}

function createEnemy(
  id: string,
  kind: EnemyUnitState['kind'],
  lane: LaneSide,
  x: number,
  speed: number,
  damage: number,
): EnemyUnitState {
  return {
    id,
    kind,
    lane,
    x,
    speed,
    damage,
    active: true,
  }
}

function createRunState(difficulty: DifficultyId): RunState {
  const nodes = getStarterBuildNodes(difficulty)
  const pickups = getStarterResourceNodes(difficulty)
  const recruits = recruitNodes()
  const maxTrainIntegrity = difficulty === 'aconchegante' ? 8 : 7

  return {
    routeId: 'quiet-platform',
    stationName: 'Plataforma Silenciosa',
    biome: 'Plataforma',
    worldWidth: 2600,
    trainX: 1300,
    playerX: 1300,
    moveSpeed: difficulty === 'aconchegante' ? 278 : 270,
    status: 'active',
    clock: createClock(360),
    resources: getBaseRunResources(difficulty),
    buildNodes: nodes,
    resourceNodes: pickups,
    recruitNodes: recruits,
    recruitedCats: [],
    selectedRecruitIndex: 0,
    enemies: [],
    nightsSurvived: 0,
    maxTrainIntegrity,
    trainIntegrity: maxTrainIntegrity,
    nightsGoal: 1,
    waveSpawnedForNight: 0,
    canDepart: false,
    history: [],
    metrics: {
      structuralHits: 0,
      builtTiers: 0,
      resourceNodesCollected: 0,
      totalResourceNodes: pickups.length,
      mysteryEventsTriggered: 0,
      resourcesCollected: emptyResources(),
      recruitsSaved: 0,
    },
    merchant: null,
  }
}

function cloneRoutes(routes?: RouteNode[]): RouteNode[] {
  if (!routes || routes.length === 0) {
    return createInitialRouteNodes()
  }

  return routes.map((route) => ({ ...route }))
}

function getInitialActiveRouteId(routes: RouteNode[], persistedRouteId?: string): string {
  return (
    routes.find((route) => route.id === persistedRouteId)?.id ??
    routes.find((route) => route.status === 'current')?.id ??
    routes[0]?.id ??
    'quiet-platform'
  )
}

function emptyProgress(): ProgressState {
  return {
    memoryTokens: 0,
    blueprintFragments: 0,
    routeMarks: 0,
  }
}

function defaultUserSettings(): UserSettings {
  return {
    subtitlesEnabled: true,
    audioEnabled: true,
    reducedMotion: false,
    touchControlsEnabled: false,
    swipePreset: 'balanced',
  }
}

function createLeaderMasteryState(
  persisted?: Record<string, LeaderMasteryState>,
): Record<string, LeaderMasteryState> {
  return Object.fromEntries(
    leaders.map((leader) => {
      const saved = persisted?.[leader.id]

      return [
        leader.id,
        {
          leaderId: leader.id,
          points: saved?.points ?? 0,
          requiredPoints: saved?.requiredPoints ?? 3,
          unlocked: saved?.unlocked ?? false,
        },
      ]
    }),
  )
}

function rewardForRun(run: RunState, difficulty: DifficultyId): ProgressState {
  const builtTiers = run.metrics.builtTiers
  const successBonus = run.canDepart ? 1 : 0
  const recruitBonus = Math.min(2, run.metrics.recruitsSaved)
  const difficultyBonus = difficulty === 'aconchegante' ? 1 : 0
  const explorationBonus = run.metrics.resourceNodesCollected >= 2 ? 1 : 0

  return {
    memoryTokens: Math.max(1 + difficultyBonus, builtTiers + run.nightsSurvived + recruitBonus + successBonus + explorationBonus),
    blueprintFragments: Math.max(
      difficultyBonus,
      Math.floor((builtTiers + run.metrics.resourceNodesCollected + successBonus) / 3),
    ),
    routeMarks: Math.max(1, run.nightsSurvived + successBonus),
  }
}

function createInitialState(): GameState {
  const persisted = loadPersistedProfile()
  const hydratedRoutes = cloneRoutes(persisted?.routeNodes)
  const prologueCompleted = persisted?.prologueCompleted ?? false
  const selectedLeaderId =
    leaders.find((leader) => leader.id === persisted?.selectedLeaderId)?.id ?? leaders[0].id
  const leaderMastery = createLeaderMasteryState(persisted?.leaderMastery)
  const userSettings = { ...defaultUserSettings(), ...persisted?.userSettings }

  return {
    currentScene: prologueCompleted ? 'hub' : 'prologue',
    prologueCompleted,
    difficulty: persisted?.difficulty ?? 'jornada',
    leaders,
    selectedLeaderId,
    leaderMastery,
    wagonBlueprints,
    builtWagonIds: persisted?.builtWagonIds ?? [],
    upgradedWagonIds: persisted?.upgradedWagonIds ?? [],
    routeNodes: hydratedRoutes,
    activeRouteId: getInitialActiveRouteId(hydratedRoutes, persisted?.activeRouteId),
    clues: persisted?.clues ?? [],
    currentMemory: null,
    endingUnlocked: persisted?.endingUnlocked ?? false,
    endingCompleted: persisted?.endingCompleted ?? false,
    userSettings,
    settingsPanelOpen: false,
    helpPanelOpen: false,
    lastRunSummary: persisted?.lastRunSummary ?? null,
    progress: persisted?.progress ?? emptyProgress(),
    run: null,
    currentEvent: prologueCompleted
      ? null
      : {
          tone: 'mixed',
          title: 'Estacao Segura',
          body: 'Seu pai quer que voce observe, ajude e fique sempre perto da luz.',
          at: 'Prologo',
          ttlSeconds: 999,
        },
    contextPrompt: prologueCompleted
      ? 'Escolha um lider, monte um vagao e prepare a proxima partida.'
      : 'Aprenda com seu pai: mova-se pelos trilhos e siga as instrucoes.',
    lastOutcome: prologueCompleted
      ? 'O Trem-Santuario aguarda o proximo destino.'
      : 'Ainda havia paz na ultima estacao segura.',
  }
}

export class GameStore {
  private state = createInitialState()
  private listeners = new Set<Listener>()

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    listener(this.state)

    return () => {
      this.listeners.delete(listener)
    }
  }

  getState(): GameState {
    return this.state
  }

  hasBlockingOverlay(): boolean {
    return (
      this.state.settingsPanelOpen ||
      this.state.helpPanelOpen ||
      this.state.currentMemory !== null ||
      this.state.lastRunSummary !== null
    )
  }

  selectNextLeader(): void {
    if (this.state.currentScene !== 'hub') {
      return
    }

    const currentIndex = this.state.leaders.findIndex((leader) => leader.id === this.state.selectedLeaderId)
    const nextLeader = this.state.leaders[(currentIndex + 1) % this.state.leaders.length]

    this.state.selectedLeaderId = nextLeader.id
    this.state.lastOutcome = `${nextLeader.name} assume a linha de frente.`
    this.emit()
  }

  selectPreviousLeader(): void {
    if (this.state.currentScene !== 'hub') {
      return
    }

    const currentIndex = this.state.leaders.findIndex((leader) => leader.id === this.state.selectedLeaderId)
    const previousLeader =
      this.state.leaders[(currentIndex - 1 + this.state.leaders.length) % this.state.leaders.length]

    this.state.selectedLeaderId = previousLeader.id
    this.state.lastOutcome = `${previousLeader.name} assume a linha de frente.`
    this.emit()
  }

  toggleDifficulty(): void {
    if (this.state.currentScene !== 'hub') {
      return
    }

    this.state.difficulty = this.state.difficulty === 'aconchegante' ? 'jornada' : 'aconchegante'
    this.state.lastOutcome =
      this.state.difficulty === 'aconchegante'
        ? 'Modo Aconchegante: mais recursos, mais margem de erro e rotas finais suavizadas.'
        : 'Modo Jornada: ainda acolhe no inicio, mas pede leitura melhor das noites e dos eventos.'
    this.emit()
  }

  startRun(): void {
    if (this.state.currentScene !== 'hub') {
      return
    }

    if (this.state.endingUnlocked && !this.state.endingCompleted) {
      this.completeEnding()
      return
    }

    const activeRoute = this.state.routeNodes.find((route) => route.id === this.state.activeRouteId)
    this.state.currentScene = 'run'
    this.state.run = createRunState(this.state.difficulty)
    this.state.run.routeId = activeRoute?.id ?? 'quiet-platform'
    this.state.run.biome = activeRoute?.biome ?? 'Plataforma'
    this.state.run.stationName = activeRoute?.name ?? this.state.run.stationName
    this.applyRouteProfile(this.state.run)
    this.applySelectedLeaderUpgrade(this.state.run)
    this.state.lastRunSummary = null
    this.state.currentEvent = {
      tone: 'mixed',
      title: 'Nova Estacao',
      body: 'Colete recursos, fortaleca a linha e sobreviva ate o amanhecer para liberar a partida do trem.',
      at: '06:00',
      ttlSeconds: 6,
    }
    this.state.contextPrompt = 'Explore a plataforma. Recursos proximos podem ser coletados com Espaco ou Interagir.'
    this.emit()
  }

  returnToHub(reason?: string): void {
    const run = this.state.run

    if (run) {
      const rewards = rewardForRun(run, this.state.difficulty)
      const masteryResult = this.awardLeaderMastery(run)
      this.state.progress.memoryTokens += rewards.memoryTokens
      this.state.progress.blueprintFragments += rewards.blueprintFragments
      this.state.progress.routeMarks += rewards.routeMarks
      this.state.lastOutcome =
        reason ??
        `Retorno ao trem com ${rewards.memoryTokens} memorias, ${rewards.blueprintFragments} fragmentos e ${rewards.routeMarks} marcas de rota.`
      const clueUnlockedTitle = run.canDepart ? this.unlockStoryForRoute(run.routeId) : null
      const nextRouteName = this.advanceRouteAfterRun(run)
      if (run.canDepart) {
        this.state.lastOutcome = clueUnlockedTitle
          ? `${this.state.lastOutcome} Nova pista: ${clueUnlockedTitle}.`
          : this.state.lastOutcome
      }
      this.refreshEndingState()
      this.state.lastRunSummary = this.createRunSummary(
        run,
        this.state.lastOutcome,
        rewards,
        masteryResult,
        clueUnlockedTitle,
        nextRouteName,
      )

      if (masteryResult.unlocked) {
        this.state.currentEvent = {
          tone: 'positive',
          title: 'Maestria Destravada',
          body: masteryResult.message,
          at: 'Hub',
          ttlSeconds: 8,
        }
      }
    }

    this.state.currentScene = 'hub'
    this.state.prologueCompleted = true
    this.state.run = null
    this.state.currentEvent =
      this.state.currentEvent?.title === 'Maestria Destravada' ? this.state.currentEvent : null
    this.state.contextPrompt = 'Escolha um lider, monte um vagao e prepare a proxima partida.'
    this.emit()
  }

  buildSelectedLeaderWagon(): void {
    if (this.state.currentScene !== 'hub') {
      return
    }

    const blueprint = this.getSelectedLeaderWagon()
    const mastery = this.state.leaderMastery[this.state.selectedLeaderId]
    const wagonBuilt = this.state.builtWagonIds.includes(blueprint?.id ?? '')
    const wagonUpgraded = this.state.upgradedWagonIds.includes(blueprint?.id ?? '')

    if (!blueprint) {
      return
    }

    if (wagonBuilt && wagonUpgraded) {
      this.state.lastOutcome = `${blueprint.upgradeName} ja protege este trecho do trem.`
      this.emit()
      return
    }

    if (wagonBuilt && !mastery?.unlocked) {
      this.state.currentEvent = {
        tone: 'hostile',
        title: 'Maestria Necessaria',
        body: `Jogue mais com ${this.getSelectedLeader().name} para liberar ${blueprint.upgradeName}.`,
        at: 'Hub',
        ttlSeconds: 6,
      }
      this.emit()
      return
    }

    if (!wagonBuilt) {
      if (
        this.state.progress.blueprintFragments < blueprint.costBlueprints ||
        this.state.progress.memoryTokens < blueprint.costMemories
      ) {
        this.state.currentEvent = {
          tone: 'hostile',
          title: 'Projeto Incompleto',
          body: `Faltam recursos para montar ${blueprint.name}. Custo: ${blueprint.costBlueprints} fragmentos e ${blueprint.costMemories} memorias.`,
          at: 'Hub',
          ttlSeconds: 6,
        }
        this.emit()
        return
      }

      this.state.progress.blueprintFragments -= blueprint.costBlueprints
      this.state.progress.memoryTokens -= blueprint.costMemories
      this.state.builtWagonIds = [...this.state.builtWagonIds, blueprint.id]
      this.state.currentEvent = {
        tone: 'positive',
        title: 'Novo Vagao',
        body: `${blueprint.name} foi encaixado ao Trem-Santuario.`,
        at: 'Hub',
        ttlSeconds: 8,
      }
      this.state.lastOutcome = `${blueprint.name} agora viaja com a tripulacao.`
      this.emit()
      return
    }

    if (
      this.state.progress.blueprintFragments < blueprint.upgradeCostBlueprints ||
      this.state.progress.memoryTokens < blueprint.upgradeCostMemories
    ) {
      this.state.currentEvent = {
        tone: 'hostile',
        title: 'Evolucao Incompleta',
        body: `Faltam recursos para evoluir ${blueprint.name}. Custo: ${blueprint.upgradeCostBlueprints} fragmentos e ${blueprint.upgradeCostMemories} memorias.`,
        at: 'Hub',
        ttlSeconds: 6,
      }
      this.emit()
      return
    }

    this.state.progress.blueprintFragments -= blueprint.upgradeCostBlueprints
    this.state.progress.memoryTokens -= blueprint.upgradeCostMemories
    this.state.upgradedWagonIds = [...this.state.upgradedWagonIds, blueprint.id]
    this.state.currentEvent = {
      tone: 'positive',
      title: 'Vagao Evoluido',
      body: `${blueprint.upgradeName} agora protege a proxima run de ${this.getSelectedLeader().name}.`,
      at: 'Hub',
      ttlSeconds: 8,
    }
    this.state.lastOutcome = `${blueprint.upgradeName} foi ligado ao trem.`
    this.emit()
  }

  advanceRouteSelection(): void {
    if (this.state.currentScene !== 'hub') {
      return
    }

    const selectable = this.state.routeNodes.filter((route) => route.status === 'current' || route.status === 'available')
    const currentIndex = selectable.findIndex((route) => route.id === this.state.activeRouteId)
    const nextRoute = selectable[(currentIndex + 1) % selectable.length]

    this.state.routeNodes = this.state.routeNodes.map((route) => {
      if (route.id === this.state.activeRouteId && route.status === 'current') {
        return { ...route, status: 'available' }
      }

      if (route.id === nextRoute.id) {
        return { ...route, status: 'current' }
      }

      return route
    })
    this.state.activeRouteId = nextRoute.id
    this.state.lastOutcome = `Proxima parada marcada: ${nextRoute.name}.`
    this.emit()
  }

  clearLastRunSummary(): void {
    if (!this.state.lastRunSummary) {
      return
    }

    this.state.lastRunSummary = null
    this.emit()
  }

  toggleSettingsPanel(): void {
    if (!this.state.settingsPanelOpen) {
      this.state.helpPanelOpen = false
    }
    this.state.settingsPanelOpen = !this.state.settingsPanelOpen
    this.emit(false)
  }

  toggleHelpPanel(): void {
    if (!this.state.helpPanelOpen) {
      this.state.settingsPanelOpen = false
    }
    this.state.helpPanelOpen = !this.state.helpPanelOpen
    this.emit(false)
  }

  toggleSubtitles(): void {
    this.state.userSettings.subtitlesEnabled = !this.state.userSettings.subtitlesEnabled
    this.emit()
  }

  toggleAudio(): void {
    this.state.userSettings.audioEnabled = !this.state.userSettings.audioEnabled
    this.emit()
  }

  toggleReducedMotion(): void {
    this.state.userSettings.reducedMotion = !this.state.userSettings.reducedMotion
    this.emit()
  }

  toggleTouchControls(): void {
    this.state.userSettings.touchControlsEnabled = !this.state.userSettings.touchControlsEnabled
    this.emit()
  }

  cycleSwipePreset(): void {
    const order = ['tight', 'balanced', 'relaxed'] as const
    const currentIndex = order.findIndex((preset) => preset === this.state.userSettings.swipePreset)
    this.state.userSettings.swipePreset = order[(currentIndex + 1) % order.length]
    this.emit()
  }

  dismissCurrentMemory(): void {
    if (!this.state.currentMemory) {
      return
    }

    this.state.currentMemory = null
    this.emit()
  }

  cycleCrewRole(): void {
    const run = this.state.run

    if (!run || run.recruitedCats.length === 0) {
      return
    }

    const recruit = run.recruitedCats[run.selectedRecruitIndex % run.recruitedCats.length]
    const currentIndex = CREW_ROLE_ORDER.findIndex((role) => role === recruit.role)
    recruit.role = CREW_ROLE_ORDER[(currentIndex + 1) % CREW_ROLE_ORDER.length]
    run.selectedRecruitIndex = (run.selectedRecruitIndex + 1) % run.recruitedCats.length
    this.state.currentEvent = {
      tone: 'mixed',
      title: 'Papel Alterado',
      body: `${recruit.catName} agora atua como ${this.formatCrewRole(recruit.role)}.`,
      at: run.clock.timeLabel,
      ttlSeconds: 4,
      cue: 'mixed',
    }
    this.refreshContextPrompt()
    this.emit()
  }

  moveLeader(direction: -1 | 1, deltaSeconds: number): void {
    const run = this.state.run

    if (!run || (run.status !== 'active' && run.status !== 'ready_to_depart')) {
      return
    }

    run.playerX = Math.min(run.worldWidth - 80, Math.max(80, run.playerX + direction * run.moveSpeed * deltaSeconds))
    this.refreshContextPrompt()
    this.emit(false)
  }

  advanceRun(deltaSeconds: number): void {
    const run = this.state.run

    if (!run || (run.status !== 'active' && run.status !== 'ready_to_depart')) {
      return
    }

    if (this.state.currentEvent) {
      this.state.currentEvent.ttlSeconds = Math.max(0, this.state.currentEvent.ttlSeconds - deltaSeconds)

      if (this.state.currentEvent.ttlSeconds === 0) {
        this.state.currentEvent = null
      }
    }

    const previousMinutes = run.clock.totalMinutes
    const nextMinutes = previousMinutes + deltaSeconds * getClockAdvanceRate(this.state.difficulty)

    run.clock = createClock(nextMinutes)
    run.nightsSurvived = Math.max(0, run.clock.day - 1)

    this.maybeSpawnWave(run)
    this.advanceEnemies(run, deltaSeconds)
    this.advanceCrew(run, deltaSeconds)
    this.evaluateRunStatus(run)

    for (const marker of this.getCrossedWindows(previousMinutes, nextMinutes)) {
      this.applyClockEvent(marker)
    }

    this.emit(false)
  }

  tickUi(deltaSeconds: number): void {
    if (this.state.run || !this.state.currentEvent) {
      return
    }

    if (this.state.currentEvent.ttlSeconds >= 900) {
      return
    }

    this.state.currentEvent.ttlSeconds = Math.max(0, this.state.currentEvent.ttlSeconds - deltaSeconds)

    if (this.state.currentEvent.ttlSeconds === 0) {
      this.state.currentEvent = null
    }

    this.emit(false)
  }

  tryInteract(): void {
    const run = this.state.run

    if (!run) {
      return
    }

    if (run.canDepart && Math.abs(run.playerX - run.trainX) <= 140) {
      this.finishRun('success', 'A tripulacao partiu ao amanhecer com a estacao finalmente domada.')
      return
    }

    const nearbyRecruitNode = this.getNearbyRecruitNode()

    if (nearbyRecruitNode && !nearbyRecruitNode.recruited) {
      nearbyRecruitNode.recruited = true
      run.metrics.recruitsSaved += 1
      run.recruitedCats.push({
        id: nearbyRecruitNode.id,
        catName: nearbyRecruitNode.catName,
        role: CREW_ROLE_ORDER[run.recruitedCats.length % CREW_ROLE_ORDER.length],
        cooldownSeconds: 10,
        color: DEFAULT_CREW_COLORS[run.recruitedCats.length % DEFAULT_CREW_COLORS.length],
      })
      this.state.currentEvent = {
        tone: 'positive',
        title: 'Novo Recruta',
        body: `${nearbyRecruitNode.catName} subiu no Trem-Santuario e entrou na escala da noite.`,
        at: run.clock.timeLabel,
        ttlSeconds: 5,
        cue: 'positive',
      }
      this.refreshContextPrompt()
      this.emit()
      return
    }

    const nearbyResourceNode = this.getNearbyResourceNode()

    if (nearbyResourceNode && !nearbyResourceNode.collected) {
      nearbyResourceNode.collected = true
      run.resources[nearbyResourceNode.kind] = clampResource(run.resources[nearbyResourceNode.kind] + nearbyResourceNode.amount)
      run.metrics.resourcesCollected[nearbyResourceNode.kind] += nearbyResourceNode.amount
      run.metrics.resourceNodesCollected += 1
      run.history.push(`${nearbyResourceNode.label} coletado.`)
      this.state.currentEvent = {
        tone: 'positive',
        title: nearbyResourceNode.label,
        body: `Voce garantiu +${nearbyResourceNode.amount} de ${this.formatResourceName(nearbyResourceNode.kind)}.`,
        at: run.clock.timeLabel,
        ttlSeconds: 4,
        cue: 'positive',
      }
      this.refreshContextPrompt()
      this.emit()
      return
    }

    const nearbyNode = this.getNearbyNode()

    if (!nearbyNode) {
      this.state.currentEvent = {
        tone: 'mixed',
        title: 'Sem Marco Proximo',
        body: 'Aproxime-se de um marco de construcao para gastar sucata.',
        at: run.clock.timeLabel,
        ttlSeconds: 3,
      }
      this.emit()
      return
    }

    if (nearbyNode.tier >= nearbyNode.maxTier) {
      this.state.currentEvent = {
        tone: 'positive',
        title: 'Estrutura Completa',
        body: `${nearbyNode.label} ja esta no nivel maximo desta run.`,
        at: run.clock.timeLabel,
        ttlSeconds: 3,
      }
      this.emit()
      return
    }

    const buildCost = nearbyNode.baseCost + nearbyNode.tier

    if (run.resources.scrap < buildCost) {
      this.state.currentEvent = {
        tone: 'hostile',
        title: 'Sucata Insuficiente',
        body: `Faltam ${buildCost - run.resources.scrap} pontos de sucata para elevar ${nearbyNode.label}.`,
        at: run.clock.timeLabel,
        ttlSeconds: 3,
      }
      this.emit()
      return
    }

    run.resources.scrap -= buildCost
    run.resources.cloth += nearbyNode.id.includes('shelter') ? 1 : 0
    run.resources.lampOil += nearbyNode.id.includes('lamp') ? 1 : 0
    run.resources.scrap += nearbyNode.id.includes('bench') ? 1 : 0
    run.resources.food += nearbyNode.id.includes('kitchen') ? 1 : 0
    nearbyNode.tier += 1
    run.metrics.builtTiers += 1
    run.history.push(`${nearbyNode.label} alcancou o nivel ${nearbyNode.tier}.`)
    this.state.currentEvent = {
      tone: 'positive',
      title: 'Construcao Elevada',
      body: `${nearbyNode.label} foi elevada para o nivel ${nearbyNode.tier}.`,
      at: run.clock.timeLabel,
      ttlSeconds: 4,
    }
    this.refreshContextPrompt()
    this.emit()
  }

  useLeaderSkill(): void {
    const run = this.state.run
    const leaderId = this.state.selectedLeaderId

    if (!run || (run.status !== 'active' && run.status !== 'ready_to_depart')) {
      return
    }

    if (leaderId === 'mimi') {
      run.resources.scrap += 1
      run.resources.coal += 1
      this.makeLeaderEvent('positive', 'Guindaste Improvisado', 'Mimi recuperou sucata e ajustou o trem para a proxima investida.')
    } else if (leaderId === 'tico') {
      run.resources.lampOil += 2
      this.makeLeaderEvent('positive', 'Chama Segura', 'Tico reforcou a corrente de luz e recuperou oleo util.')
    } else if (leaderId === 'nina') {
      run.resources.cloth += 2
      this.makeLeaderEvent('positive', 'Retalhos em Ordem', 'Nina montou um kit de remendo que protege os recrutas.')
    } else if (leaderId === 'bento') {
      run.resources.food += 2
      this.makeLeaderEvent('positive', 'Cozinha de Emergencia', 'Bento distribuiu racoes quentes e acalmou a tripulacao.')
    } else if (leaderId === 'lua') {
      run.resources.scrap += 1
      run.resources.food += 1
      this.makeLeaderEvent('mixed', 'Rota Sussurrada', 'Lua encontrou um caminho curto e trouxe suprimentos do flanco.')
    } else {
      this.state.progress.memoryTokens += 1
      this.makeLeaderEvent('mystery', 'Eco da Memoria', 'Sombra puxou um fragmento raro do silencio da estacao.')
    }

    this.emit()
  }

  leaveRun(): void {
    const run = this.state.run

    if (!run) {
      return
    }

    if (run.canDepart) {
      this.finishRun('success', 'A tripulacao partiu com seguranca e levou os ganhos da madrugada.')
      return
    }

    this.returnToHub('A tripulacao recuou antes do colapso da linha.')
  }

  setContextPrompt(prompt: string, shouldPersist = false): void {
    this.state.contextPrompt = prompt
    this.emit(shouldPersist)
  }

  setCurrentEvent(event: EventBanner | null, shouldPersist = false): void {
    this.state.currentEvent = event
    this.emit(shouldPersist)
  }

  setLastOutcome(summary: string, shouldPersist = false): void {
    this.state.lastOutcome = summary
    this.emit(shouldPersist)
  }

  completePrologue(): void {
    this.state.prologueCompleted = true
    this.state.currentScene = 'hub'
    this.state.currentEvent = {
      tone: 'mystery',
      title: '3 anos depois',
      body: 'O trem foi remendado. Agora a lideranca pesa sobre voce.',
      at: 'Memoria',
      ttlSeconds: 8,
    }
    this.state.contextPrompt = 'Escolha um lider, monte um vagao e prepare a primeira expedicao real.'
    this.state.lastOutcome = 'Seu pai caiu naquela noite. O trem continua por sua causa.'
    this.emit()
  }

  private applyClockEvent(windowKey: WindowKey): void {
    const run = this.state.run

    if (!run) {
      return
    }

    if (windowKey === 'dawn' && run.merchant?.active) {
      this.resolveMerchantDawn(run)
      return
    }

    const event = resolveClockEvent(windowKey, this.state.difficulty, run.clock.day, run.clock.totalMinutes)

    if (event.kind === 'merchant_arrival') {
      this.activateMerchant(run)
      run.history.push(event.title)
      this.state.currentEvent = {
        tone: event.tone,
        title: event.title,
        body: event.body,
        at: run.clock.timeLabel,
        ttlSeconds: 6,
        cue: 'merchant',
      }
      return
    }

    this.applyResourceDelta(run.resources, event.rewards)
    this.applyProgressDelta(this.state.progress, event.progress)
    if (event.tone === 'mystery') {
      run.metrics.mysteryEventsTriggered += 1
    }

    if (this.isSelectedLeaderUpgradeActive('bento') && event.tone === 'positive') {
      run.resources.food = clampResource(run.resources.food + 1)
    }

    if (this.isSelectedLeaderUpgradeActive('sombra') && event.tone === 'mystery') {
      this.state.progress.memoryTokens += 1
    }

    run.history.push(event.title)
    this.state.currentEvent = {
      tone: event.tone,
      title: event.title,
      body: event.body,
      at: run.clock.timeLabel,
      ttlSeconds: 5,
      cue: event.cue ?? event.tone,
    }
  }

  private maybeSpawnWave(run: RunState): void {
    if (run.clock.phase !== 'night') {
      return
    }

    const nightId = this.getNightId(run.clock)

    if (nightId <= 0 || run.waveSpawnedForNight >= nightId) {
      return
    }

    run.waveSpawnedForNight = nightId

    const isCozy = this.state.difficulty === 'aconchegante'
    const baseSpeed = isCozy ? 48 : 58
    run.enemies.push(createEnemy(`captor-${nightId}`, 'captor', 'east', run.worldWidth - 80, baseSpeed, 1))
    run.enemies.push(createEnemy(`hound-${nightId}`, 'tracker_dog', 'west', 80, baseSpeed + 10, 1))
    run.enemies.push(createEnemy(`lanternist-${nightId}`, 'lanternist', 'east', run.worldWidth - 130, baseSpeed - 8, 1))

    if (!isCozy || nightId > 1) {
      run.enemies.push(createEnemy(`rush-${nightId}`, 'rush_dog', 'west', 110, baseSpeed + 14, 1))
    }

    if (nightId > 1) {
      run.enemies.push(createEnemy(`saboteur-${nightId}`, 'saboteur', 'east', run.worldWidth - 170, baseSpeed - 10, 1))
    }

    if (!isCozy && nightId > 1) {
      run.enemies.push(createEnemy(`handler-${nightId}`, 'handler', 'west', 140, baseSpeed - 10, 2))
    }

    this.state.currentEvent = {
      tone: 'hostile',
      title: nightId === 1 ? 'Primeira Investida' : 'Pressao na Madrugada',
      body:
        nightId === 1
          ? 'A primeira onda chegou. Ela deve ensinar a leitura da linha, nao esmagar a run.'
          : 'A estacao percebeu que o trem ainda esta aqui. A linha precisa de mais cuidado.',
      at: run.clock.timeLabel,
      ttlSeconds: 5,
      cue: 'hostile',
    }
  }

  private advanceEnemies(run: RunState, deltaSeconds: number): void {
    for (const enemy of run.enemies) {
      if (!enemy.active) {
        continue
      }

      const direction = enemy.lane === 'east' ? -1 : 1
      enemy.x += direction * enemy.speed * deltaSeconds

      const sabotagedNode = this.getEnemyTargetNode(run, enemy)

      if (sabotagedNode && sabotagedNode.tier > 0) {
        const reachedTarget =
          enemy.lane === 'east' ? enemy.x <= sabotagedNode.x + 18 : enemy.x >= sabotagedNode.x - 18

        if (reachedTarget) {
          enemy.active = false
          sabotagedNode.tier = Math.max(0, sabotagedNode.tier - (enemy.kind === 'rush_dog' ? 2 : 1))
          this.state.currentEvent = {
            tone: enemy.kind === 'lanternist' || enemy.kind === 'saboteur' ? 'hostile' : 'mixed',
            title: enemy.kind === 'lanternist' ? 'Luz Sabotada' : 'Estrutura Golpeada',
            body:
              enemy.kind === 'lanternist'
                ? `${sabotagedNode.label} perdeu forca com a lanterna inimiga.`
                : `${sabotagedNode.label} cedeu sob a investida inimiga.`,
            at: run.clock.timeLabel,
            ttlSeconds: 3,
            cue: enemy.kind === 'lanternist' || enemy.kind === 'saboteur' ? 'hostile' : 'mixed',
          }
          continue
        }
      }

      const blockingNode = this.getLaneDefenseNode(run, enemy.lane)

      if (blockingNode && blockingNode.tier > 0) {
        const reachedDefense =
          enemy.lane === 'east' ? enemy.x <= blockingNode.x + 18 : enemy.x >= blockingNode.x - 18

        if (reachedDefense) {
          enemy.active = false
          blockingNode.tier = Math.max(0, blockingNode.tier - (enemy.kind === 'rush_dog' ? 2 : 1))
          this.state.currentEvent = {
            tone: 'mixed',
            title: 'Linha Aguentou',
            body: `${blockingNode.label} segurou uma investida, mas perdeu um nivel.`,
            at: run.clock.timeLabel,
            ttlSeconds: 3,
            cue: 'mixed',
          }
          continue
        }
      }

      const reachedTrain = Math.abs(enemy.x - run.trainX) <= 110

      if (reachedTrain) {
        enemy.active = false
        run.trainIntegrity = clampResource(run.trainIntegrity - enemy.damage)
        run.metrics.structuralHits += 1
        this.state.currentEvent = {
          tone: 'hostile',
          title: 'Impacto no Trem',
          body: 'Uma unidade inimiga alcancou o trem e danificou a estrutura central.',
          at: run.clock.timeLabel,
          ttlSeconds: 4,
          cue: 'hostile',
        }
      }
    }

    run.enemies = run.enemies.filter((enemy) => enemy.active)
  }

  private advanceCrew(run: RunState, deltaSeconds: number): void {
    for (const recruit of run.recruitedCats) {
      recruit.cooldownSeconds = Math.max(0, recruit.cooldownSeconds - deltaSeconds)

      if (recruit.cooldownSeconds > 0) {
        continue
      }

      if (recruit.role === 'scavenger' && run.clock.phase !== 'night') {
        run.resources.scrap += 1
        run.metrics.resourcesCollected.scrap += 1
        recruit.cooldownSeconds = 22
        this.announceCrewAction(run, recruit.catName, 'trouxe sucata da margem da estacao.')
      } else if (recruit.role === 'builder') {
        const target = run.buildNodes.find((node) => node.tier > 0 && node.tier < node.maxTier)

        if (target) {
          target.tier += 1
          run.metrics.builtTiers += 1
          recruit.cooldownSeconds = 28
          this.announceCrewAction(run, recruit.catName, `reforcou ${target.label}.`)
        } else {
          recruit.cooldownSeconds = 12
        }
      } else if (recruit.role === 'lamplighter') {
        const target = run.buildNodes.find((node) => node.kind === 'light' && node.tier > 0 && node.tier < node.maxTier)

        if (target) {
          target.tier += 1
          run.metrics.builtTiers += 1
          recruit.cooldownSeconds = 26
          this.announceCrewAction(run, recruit.catName, `reativou ${target.label}.`)
        } else {
          run.resources.lampOil += 1
          recruit.cooldownSeconds = 24
          this.announceCrewAction(run, recruit.catName, 'reabasteceu o oleo das lampadas.')
        }
      } else if (recruit.role === 'defender' && run.enemies.length > 0) {
        const target = run.enemies[0]
        target.active = false
        recruit.cooldownSeconds = 20
        this.announceCrewAction(run, recruit.catName, 'conteve uma unidade antes dela tocar a linha.')
      } else if (recruit.role === 'cook') {
        run.resources.food += 1
        recruit.cooldownSeconds = 30
        this.announceCrewAction(run, recruit.catName, 'distribuiu uma refeicao quente para a tripulacao.')
      } else {
        recruit.cooldownSeconds = 10
      }
    }

    run.enemies = run.enemies.filter((enemy) => enemy.active)
  }

  private evaluateRunStatus(run: RunState): void {
    if (run.trainIntegrity <= 0) {
      this.finishRun('failed', 'O trem perdeu integridade demais e a estacao foi abandonada em caos.')
      return
    }

    if (run.nightsSurvived >= run.nightsGoal && run.clock.phase === 'dawn' && run.enemies.length === 0) {
      run.status = 'ready_to_depart'
      run.canDepart = true
      this.state.contextPrompt = 'O trem pode partir. Volte ao centro e interaja para encerrar a run com sucesso.'
      return
    }

    run.status = 'active'
    run.canDepart = false
    this.refreshContextPrompt()
  }

  private applyResourceDelta(resources: ResourceState, delta?: Partial<ResourceState>): void {
    if (!delta) {
      return
    }

    resources.scrap = clampResource(resources.scrap + (delta.scrap ?? 0))
    resources.cloth = clampResource(resources.cloth + (delta.cloth ?? 0))
    resources.lampOil = clampResource(resources.lampOil + (delta.lampOil ?? 0))
    resources.food = clampResource(resources.food + (delta.food ?? 0))
    resources.coal = clampResource(resources.coal + (delta.coal ?? 0))
  }

  private applyProgressDelta(progress: ProgressState, delta?: Partial<ProgressState>): void {
    if (!delta) {
      return
    }

    progress.memoryTokens = clampResource(progress.memoryTokens + (delta.memoryTokens ?? 0))
    progress.blueprintFragments = clampResource(progress.blueprintFragments + (delta.blueprintFragments ?? 0))
    progress.routeMarks = clampResource(progress.routeMarks + (delta.routeMarks ?? 0))
  }

  private getCrossedWindows(previousMinutes: number, nextMinutes: number): WindowKey[] {
    const keys: WindowKey[] = []
    const firstDay = Math.floor(previousMinutes / 1440)
    const lastDay = Math.floor(nextMinutes / 1440)

    for (let dayIndex = firstDay; dayIndex <= lastDay; dayIndex += 1) {
      for (const marker of WINDOW_MARKERS) {
        const absoluteMinute = dayIndex * 1440 + marker.minute

        if (previousMinutes < absoluteMinute && absoluteMinute <= nextMinutes) {
          keys.push(marker.key)
        }
      }
    }

    return keys
  }

  private getNearbyNode(): BuildNodeState | null {
    const run = this.state.run

    if (!run) {
      return null
    }

    return run.buildNodes.find((node) => Math.abs(node.x - run.playerX) <= 120) ?? null
  }

  private getNearbyResourceNode(): ResourceNodeState | null {
    const run = this.state.run

    if (!run) {
      return null
    }

    return run.resourceNodes.find((node) => !node.collected && Math.abs(node.x - run.playerX) <= 110) ?? null
  }

  private getNearbyRecruitNode(): RecruitNodeState | null {
    const run = this.state.run

    if (!run) {
      return null
    }

    return run.recruitNodes.find((node) => !node.recruited && Math.abs(node.x - run.playerX) <= 110) ?? null
  }

  private getLaneDefenseNode(run: RunState, lane: LaneSide): BuildNodeState | null {
    return run.buildNodes.find((node) => node.kind === 'defense' && node.side === lane) ?? null
  }

  private getEnemyTargetNode(run: RunState, enemy: EnemyUnitState): BuildNodeState | null {
    if (enemy.kind === 'lanternist') {
      return run.buildNodes.find((node) => node.kind === 'light' && node.side === enemy.lane) ?? null
    }

    if (enemy.kind === 'saboteur') {
      return run.buildNodes.find(
        (node) => (node.kind === 'utility' || node.kind === 'support' || node.kind === 'light') && node.side === enemy.lane,
      ) ?? null
    }

    return null
  }

  private refreshContextPrompt(): void {
    const run = this.state.run

    if (!run) {
      this.state.contextPrompt = 'Escolha um lider, monte um vagao e prepare a proxima partida.'
      return
    }

    if (run.canDepart && Math.abs(run.playerX - run.trainX) <= 140) {
      this.state.contextPrompt = 'O trem pode partir. Volte ao centro e interaja.'
      return
    }

    const nearbyResourceNode = this.getNearbyResourceNode()

    if (nearbyResourceNode) {
      this.state.contextPrompt = `${nearbyResourceNode.label}: chegue perto e interaja para coletar ${nearbyResourceNode.amount} de ${this.formatResourceName(nearbyResourceNode.kind)}.`
      return
    }

    const nearbyRecruitNode = this.getNearbyRecruitNode()

    if (nearbyRecruitNode) {
      this.state.contextPrompt = `${nearbyRecruitNode.catName} esta escondido. Chegue perto e interaja para resgatar esse gato.`
      return
    }

    if (Math.abs(run.playerX - run.trainX) <= 150 && run.recruitedCats.length > 0) {
      const recruit = run.recruitedCats[run.selectedRecruitIndex % run.recruitedCats.length]
      this.state.contextPrompt = `Perto do trem: use Comando para trocar o papel de ${recruit.catName}. Agora ele atua como ${this.formatCrewRole(recruit.role)}.`
      return
    }

    const nearbyNode = this.getNearbyNode()

    if (!nearbyNode) {
      this.state.contextPrompt = 'Deslize ou use A/D para explorar os extremos da plataforma.'
      return
    }

    const buildCost = nearbyNode.baseCost + nearbyNode.tier

    this.state.contextPrompt =
      nearbyNode.tier >= nearbyNode.maxTier
        ? `${nearbyNode.label} esta completo. Continue explorando ou segure a linha.`
        : `${nearbyNode.label}: chegue perto e interaja para gastar ${buildCost} sucata.`
  }

  private finishRun(status: RunState['status'], summary: string): void {
    if (!this.state.run) {
      return
    }

    this.state.run.status = status
    this.state.run.canDepart = status === 'success'

    if (status === 'failed') {
      this.state.run.resources.coal = Math.max(0, this.state.run.resources.coal - 1)
      this.state.run.resources.food = Math.max(0, this.state.run.resources.food - 1)
    }

    this.returnToHub(summary)
  }

  private getNightId(clock: ClockState): number {
    const minuteOfDay = ((Math.floor(clock.totalMinutes) % 1440) + 1440) % 1440

    if (minuteOfDay >= 1200) {
      return clock.day
    }

    if (minuteOfDay < 360) {
      return Math.max(0, clock.day - 1)
    }

    return 0
  }

  private formatResourceName(kind: keyof ResourceState): string {
    switch (kind) {
      case 'scrap':
        return 'sucata'
      case 'cloth':
        return 'tecido'
      case 'lampOil':
        return 'oleo'
      case 'food':
        return 'comida'
      case 'coal':
        return 'carvao'
    }
  }

  private formatCrewRole(role: CrewRole): string {
    if (role === 'scavenger') {
      return 'catador'
    }

    if (role === 'builder') {
      return 'construtor'
    }

    if (role === 'lamplighter') {
      return 'lampista'
    }

    if (role === 'defender') {
      return 'defensor'
    }

    return 'cozinheiro'
  }

  private announceCrewAction(run: RunState, catName: string, action: string): void {
    this.state.currentEvent = {
      tone: 'positive',
      title: 'Tripulacao em Movimento',
      body: `${catName} ${action}`,
      at: run.clock.timeLabel,
      ttlSeconds: 3,
      cue: 'positive',
    }
  }

  private createMerchantPayout(run: RunState): ResourceState {
    const lightTiers = run.buildNodes.filter((node) => node.kind === 'light').reduce((sum, node) => sum + node.tier, 0)
    const defenseTiers = run.buildNodes
      .filter((node) => node.kind === 'defense')
      .reduce((sum, node) => sum + node.tier, 0)
    const supportTiers = run.buildNodes
      .filter((node) => node.kind === 'support')
      .reduce((sum, node) => sum + node.tier, 0)

    return {
      scrap: 1 + Number(defenseTiers > 0),
      cloth: Number(supportTiers > 0),
      lampOil: 1 + Number(lightTiers > 0),
      food: 1 + Number(run.metrics.resourceNodesCollected >= 2),
      coal: this.state.difficulty === 'aconchegante' ? 1 : 0,
    }
  }

  private activateMerchant(run: RunState): void {
    run.merchant = {
      active: true,
      x: run.trainX + 240,
      arrivalDay: run.clock.day,
      arrivalTime: run.clock.timeLabel,
      dawnPayout: this.createMerchantPayout(run),
      label: 'Mercador Noturno',
    }
  }

  private resolveMerchantDawn(run: RunState): void {
    const merchant = run.merchant

    if (!merchant) {
      return
    }

    this.applyResourceDelta(run.resources, merchant.dawnPayout)
    run.history.push('O mercador deixou caixas ao amanhecer.')
    run.merchant = null
    this.state.currentEvent = {
      tone: 'positive',
      title: 'Acerto ao Amanhecer',
      body: `O mercador deixou ${merchant.dawnPayout.scrap} sucata, ${merchant.dawnPayout.food} comida e reforcos leves antes de partir.`,
      at: run.clock.timeLabel,
      ttlSeconds: 6,
      cue: 'merchant',
    }
  }

  private makeLeaderEvent(tone: EventBanner['tone'], title: string, body: string): void {
    const run = this.state.run

    if (!run) {
      return
    }

    this.state.currentEvent = {
      tone,
      title,
      body,
      at: run.clock.timeLabel,
      ttlSeconds: 4,
      cue: tone,
    }
  }

  private applyRouteProfile(run: RunState): void {
    if (run.routeId === 'freight-yard') {
      run.resources.scrap += this.state.difficulty === 'aconchegante' ? 3 : 2
      run.resourceNodes = run.resourceNodes.map((node) =>
        node.kind === 'scrap' ? { ...node, amount: node.amount + 1 } : node
      )
    } else if (run.routeId === 'flooded-crossing') {
      run.moveSpeed = this.state.difficulty === 'aconchegante' ? 248 : 238
      run.resources.lampOil += this.state.difficulty === 'aconchegante' ? 2 : 1
      run.resourceNodes = run.resourceNodes.map((node) =>
        node.kind === 'lampOil' || node.kind === 'food' ? { ...node, amount: node.amount + 1 } : node
      )
    } else if (run.routeId === 'kennel-edge') {
      run.resources.food += this.state.difficulty === 'aconchegante' ? 2 : 1
      run.resources.scrap += this.state.difficulty === 'aconchegante' ? 2 : 1
      run.maxTrainIntegrity += this.state.difficulty === 'aconchegante' ? 2 : 1
      run.trainIntegrity = run.maxTrainIntegrity
      run.buildNodes = run.buildNodes.map((node) =>
        node.kind === 'defense' ? { ...node, tier: Math.max(node.tier, 1) } : node,
      )
      run.nightsGoal = this.state.difficulty === 'aconchegante' ? 1 : 2
    }

    run.metrics.totalResourceNodes = run.resourceNodes.length
  }

  private unlockStoryForRoute(routeId: RunState['routeId']): string | null {
    const storyEntry = getStoryEntryForRoute(routeId)

    if (this.state.clues.some((clue) => clue.id === storyEntry.clue.id)) {
      return null
    }

    this.state.clues = [...this.state.clues, storyEntry.clue]
    this.state.currentMemory = storyEntry.memory
    this.state.currentEvent = {
      tone: 'mystery',
      title: storyEntry.clue.title,
      body: storyEntry.clue.excerpt,
      at: 'Hub',
      ttlSeconds: 8,
      cue: 'mystery',
    }

    return storyEntry.clue.title
  }

  private refreshEndingState(): void {
    const allRoutesCleared = this.state.routeNodes.every((route) => route.status === 'cleared')

    if (!this.state.endingCompleted && allRoutesCleared && this.state.clues.length >= 4) {
      this.state.endingUnlocked = true
      this.state.currentEvent = {
        tone: 'mystery',
        title: 'Desfecho ao Alcance',
        body: 'As quatro pistas apontam para o vagao lacrado. O Trem-Santuario pode enfim encarar a verdade.',
        at: 'Hub',
        ttlSeconds: 8,
        cue: 'mystery',
      }
    }
  }

  private completeEnding(): void {
    this.state.endingUnlocked = true
    this.state.endingCompleted = true
    this.state.currentMemory = getEndingMemory()
    this.state.currentEvent = {
      tone: 'mystery',
      title: 'Fim da Versao 1',
      body: 'A comunidade enfim entende por que o trem foi marcado naquela noite.',
      at: 'Desfecho',
      ttlSeconds: 10,
      cue: 'mystery',
    }
    this.state.lastOutcome = 'O segredo do vagao lacrado foi encarado. A jornada segue, agora com a verdade a bordo.'
    this.emit()
  }

  private getSelectedLeader() {
    return this.state.leaders.find((leader) => leader.id === this.state.selectedLeaderId) ?? this.state.leaders[0]
  }

  private getSelectedLeaderWagon() {
    return this.state.wagonBlueprints.find((wagon) => wagon.leaderId === this.state.selectedLeaderId) ?? null
  }

  private isSelectedLeaderUpgradeActive(leaderId: string): boolean {
    const wagon = this.state.wagonBlueprints.find((candidate) => candidate.leaderId === leaderId)

    return Boolean(wagon && this.state.selectedLeaderId === leaderId && this.state.upgradedWagonIds.includes(wagon.id))
  }

  private applySelectedLeaderUpgrade(run: RunState): void {
    if (!this.isSelectedLeaderUpgradeActive(this.state.selectedLeaderId)) {
      return
    }

    if (this.state.selectedLeaderId === 'mimi') {
      run.maxTrainIntegrity += 1
      run.trainIntegrity = run.maxTrainIntegrity
      run.buildNodes = run.buildNodes.map((node) =>
        node.kind === 'defense' ? { ...node, tier: Math.max(node.tier, 1) } : node
      )
    } else if (this.state.selectedLeaderId === 'tico') {
      run.resources.lampOil += 2
      run.buildNodes = run.buildNodes.map((node) =>
        node.kind === 'light' ? { ...node, tier: Math.max(node.tier, 1) } : node
      )
    } else if (this.state.selectedLeaderId === 'nina') {
      run.resources.cloth += 2
      run.buildNodes = run.buildNodes.map((node) =>
        node.kind === 'support' ? { ...node, tier: Math.max(node.tier, 1) } : node
      )
    } else if (this.state.selectedLeaderId === 'bento') {
      run.resources.food += 2
      run.resources.coal += 1
    } else if (this.state.selectedLeaderId === 'lua') {
      run.resourceNodes = [
        ...run.resourceNodes,
        { id: 'west-cache', label: 'Cache do Observatorio', x: 1120, kind: 'scrap', amount: 2, collected: false },
        { id: 'east-cache', label: 'Bolsa do Batedor', x: 1460, kind: 'food', amount: 2, collected: false },
      ]
      run.metrics.totalResourceNodes = run.resourceNodes.length
    }
  }

  private evaluateMasteryChallenge(run: RunState): boolean {
    if (this.state.selectedLeaderId === 'mimi') {
      return run.canDepart && run.metrics.structuralHits === 0
    }

    if (this.state.selectedLeaderId === 'tico') {
      return run.canDepart && run.buildNodes.filter((node) => node.kind === 'light').every((node) => node.tier >= 2)
    }

    if (this.state.selectedLeaderId === 'nina') {
      return (
        run.canDepart &&
        run.buildNodes.some((node) => node.kind === 'support' && node.tier >= 1) &&
        run.metrics.recruitsSaved >= 3
      )
    }

    if (this.state.selectedLeaderId === 'bento') {
      return run.canDepart && run.resources.food >= 4
    }

    if (this.state.selectedLeaderId === 'lua') {
      return run.metrics.resourceNodesCollected >= run.metrics.totalResourceNodes
    }

    return run.metrics.mysteryEventsTriggered >= 2
  }

  private awardLeaderMastery(run: RunState): MasteryAwardResult {
    const leader = this.getSelectedLeader()
    const mastery = this.state.leaderMastery[leader.id]
    const challengeCompleted = this.evaluateMasteryChallenge(run)
    const pointsEarned = mastery.unlocked ? 0 : Math.min(mastery.requiredPoints - mastery.points, 1 + Number(challengeCompleted))

    if (pointsEarned > 0) {
      mastery.points += pointsEarned
      mastery.unlocked = mastery.points >= mastery.requiredPoints
    }

    if (mastery.unlocked && pointsEarned > 0) {
      return {
        pointsEarned,
        challengeCompleted,
        unlocked: true,
        message: `${leader.name} dominou a propria rota. ${leader.masteryReward}`,
      }
    }

    return {
      pointsEarned,
      challengeCompleted,
      unlocked: false,
      message: challengeCompleted
        ? `${leader.name} acelerou a maestria desta viagem.`
        : `${leader.name} acumulou experiencia para o proximo avanco.`,
    }
  }

  private createRunSummary(
    run: RunState,
    headline: string,
    rewards: ProgressState,
    masteryResult: MasteryAwardResult,
    clueUnlockedTitle: string | null,
    nextRouteName: string | null,
  ): RunSummary {
    const leader = this.getSelectedLeader()

    return {
      leaderName: leader.name,
      stationName: run.stationName,
      difficulty: this.state.difficulty,
      success: run.canDepart || run.status === 'success',
      nightsSurvived: run.nightsSurvived,
      builtTiers: run.metrics.builtTiers,
      trainIntegrityLeft: run.trainIntegrity,
      recruitsSaved: run.metrics.recruitsSaved,
      merchantSurvived: Boolean(run.merchant === null && run.history.includes('O mercador deixou caixas ao amanhecer.')),
      rewards,
      progressTotals: { ...this.state.progress },
      resourcesReturned: { ...run.resources },
      headline,
      clueUnlockedTitle,
      nextRouteName,
      masteryPointsEarned: masteryResult.pointsEarned,
      masteryChallengeCompleted: masteryResult.challengeCompleted,
      masteryUnlocked: masteryResult.unlocked,
      masteryReward: leader.masteryReward,
    }
  }

  private advanceRouteAfterRun(run: RunState): string | null {
    if (!run.canDepart) {
      return null
    }

    const routeIndex = this.state.routeNodes.findIndex((route) => route.id === this.state.activeRouteId)

    if (routeIndex === -1) {
      return null
    }

    this.state.routeNodes = this.state.routeNodes.map((route, index) => {
      if (index === routeIndex) {
        return { ...route, status: 'cleared' }
      }

      if (index === routeIndex + 1 && route.status === 'locked') {
        return { ...route, status: 'available' }
      }

      return route
    })

    const nextRoute =
      this.state.routeNodes.find((route, index) => index === routeIndex + 1 && route.status !== 'locked') ??
      this.state.routeNodes.find((route) => route.status === 'available')

    if (nextRoute) {
      this.state.routeNodes = this.state.routeNodes.map((route) => {
        if (route.id === nextRoute.id) {
          return { ...route, status: 'current' }
        }

        if (route.id === this.state.activeRouteId && route.status === 'current') {
          return { ...route, status: 'cleared' }
        }

        return route
      })
      this.state.activeRouteId = nextRoute.id
      return nextRoute.name
    }

    return null
  }

  private emit(shouldPersist = true): void {
    if (shouldPersist) {
      savePersistedProfile(this.state)
    }

    for (const listener of this.listeners) {
      listener(this.state)
    }
  }
}
