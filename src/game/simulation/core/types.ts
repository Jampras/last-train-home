export type SceneId = 'prologue' | 'hub' | 'run'
export type DifficultyId = 'aconchegante' | 'jornada'
export type EventTone = 'positive' | 'mixed' | 'hostile' | 'mystery'
export type ClockPhase = 'dawn' | 'day' | 'dusk' | 'night'
export type RunStatus = 'active' | 'ready_to_depart' | 'success' | 'failed'
export type LaneSide = 'west' | 'east'
export type ResourceKind = keyof ResourceState
export type EnemyKind = 'captor' | 'tracker_dog' | 'lanternist' | 'saboteur' | 'rush_dog' | 'handler'
export type RouteNodeStatus = 'current' | 'available' | 'locked' | 'cleared'
export type EventCue = EventTone | 'merchant'
export type BuildKind = 'light' | 'defense' | 'support' | 'utility'
export type CrewRole = 'scavenger' | 'builder' | 'lamplighter' | 'defender' | 'cook'
export type RouteId = 'quiet-platform' | 'freight-yard' | 'flooded-crossing' | 'kennel-edge'
export type SwipePreset = 'tight' | 'balanced' | 'relaxed'

export interface LeaderDefinition {
  id: string
  name: string
  signature: string
  runPerk: string
  masteryGoal: string
  masteryReward: string
  accent: number
}

export interface LeaderMasteryState {
  leaderId: string
  points: number
  requiredPoints: number
  unlocked: boolean
}

export interface ProgressState {
  memoryTokens: number
  blueprintFragments: number
  routeMarks: number
}

export interface ResourceState {
  scrap: number
  cloth: number
  lampOil: number
  food: number
  coal: number
}

export interface BuildNodeState {
  id: string
  label: string
  x: number
  side: LaneSide
  kind: BuildKind
  tier: number
  maxTier: number
  baseCost: number
}

export interface ResourceNodeState {
  id: string
  label: string
  x: number
  kind: ResourceKind
  amount: number
  collected: boolean
}

export interface RecruitNodeState {
  id: string
  catName: string
  label: string
  x: number
  recruited: boolean
}

export interface RecruitedCatState {
  id: string
  catName: string
  role: CrewRole
  cooldownSeconds: number
  color: number
}

export interface EnemyUnitState {
  id: string
  kind: EnemyKind
  lane: LaneSide
  x: number
  speed: number
  damage: number
  active: boolean
}

export interface ClockState {
  day: number
  totalMinutes: number
  timeLabel: string
  phase: ClockPhase
}

export interface EventBanner {
  tone: EventTone
  title: string
  body: string
  at: string
  ttlSeconds: number
  cue?: EventCue
}

export interface WagonBlueprint {
  id: string
  name: string
  leaderId: string
  description: string
  costBlueprints: number
  costMemories: number
  upgradeName: string
  upgradeDescription: string
  upgradeCostBlueprints: number
  upgradeCostMemories: number
}

export interface RouteNode {
  id: RouteId
  name: string
  biome: string
  danger: string
  status: RouteNodeStatus
}

export interface StoryClueState {
  id: string
  routeId: RouteId
  title: string
  faction: string
  excerpt: string
}

export interface StoryMemoryState {
  id: string
  title: string
  body: string
  speaker: string
}

export interface UserSettings {
  subtitlesEnabled: boolean
  audioEnabled: boolean
  reducedMotion: boolean
  touchControlsEnabled: boolean
  swipePreset: SwipePreset
}

export interface RunSummary {
  leaderName: string
  stationName: string
  difficulty: DifficultyId
  success: boolean
  nightsSurvived: number
  builtTiers: number
  trainIntegrityLeft: number
  recruitsSaved: number
  merchantSurvived: boolean
  rewards: ProgressState
  progressTotals: ProgressState
  resourcesReturned: ResourceState
  headline: string
  clueUnlockedTitle: string | null
  nextRouteName: string | null
  masteryPointsEarned: number
  masteryChallengeCompleted: boolean
  masteryUnlocked: boolean
  masteryReward: string
}

export interface RunMetrics {
  structuralHits: number
  builtTiers: number
  resourceNodesCollected: number
  totalResourceNodes: number
  mysteryEventsTriggered: number
  resourcesCollected: ResourceState
  recruitsSaved: number
}

export interface MerchantState {
  active: boolean
  x: number
  arrivalDay: number
  arrivalTime: string
  dawnPayout: ResourceState
  label: string
}

export interface RunState {
  routeId: RouteId
  stationName: string
  biome: string
  worldWidth: number
  trainX: number
  playerX: number
  moveSpeed: number
  status: RunStatus
  clock: ClockState
  resources: ResourceState
  buildNodes: BuildNodeState[]
  resourceNodes: ResourceNodeState[]
  recruitNodes: RecruitNodeState[]
  recruitedCats: RecruitedCatState[]
  selectedRecruitIndex: number
  enemies: EnemyUnitState[]
  nightsSurvived: number
  maxTrainIntegrity: number
  trainIntegrity: number
  nightsGoal: number
  waveSpawnedForNight: number
  canDepart: boolean
  history: string[]
  metrics: RunMetrics
  merchant: MerchantState | null
}

export interface GameState {
  currentScene: SceneId
  prologueCompleted: boolean
  difficulty: DifficultyId
  leaders: LeaderDefinition[]
  selectedLeaderId: string
  leaderMastery: Record<string, LeaderMasteryState>
  wagonBlueprints: WagonBlueprint[]
  builtWagonIds: string[]
  upgradedWagonIds: string[]
  routeNodes: RouteNode[]
  activeRouteId: string
  clues: StoryClueState[]
  currentMemory: StoryMemoryState | null
  endingUnlocked: boolean
  endingCompleted: boolean
  userSettings: UserSettings
  settingsPanelOpen: boolean
  helpPanelOpen: boolean
  lastRunSummary: RunSummary | null
  progress: ProgressState
  run: RunState | null
  currentEvent: EventBanner | null
  contextPrompt: string
  lastOutcome: string
}

export interface TriggeredEvent {
  tone: EventTone
  title: string
  body: string
  cue?: EventCue
  kind?: 'standard' | 'merchant_arrival'
  rewards?: Partial<ResourceState>
  progress?: Partial<ProgressState>
}
