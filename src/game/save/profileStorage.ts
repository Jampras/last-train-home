import { leaders } from '../content/leaders'
import { createInitialRouteNodes, wagonBlueprints } from '../content/wagons'
import type {
  DifficultyId,
  GameState,
  LeaderMasteryState,
  ProgressState,
  RouteNode,
  RunSummary,
  StoryClueState,
  SwipePreset,
  UserSettings,
} from '../simulation/core/types'

const STORAGE_KEY = 'last-train-home.profile'
const VALID_DIFFICULTIES: DifficultyId[] = ['aconchegante', 'jornada']
const VALID_SWIPE_PRESETS: SwipePreset[] = ['tight', 'balanced', 'relaxed']
const VALID_ROUTE_STATUSES = ['current', 'available', 'locked', 'cleared'] as const

export interface PersistedProfile {
  prologueCompleted: boolean
  selectedLeaderId: string
  difficulty: DifficultyId
  leaderMastery: Record<string, LeaderMasteryState>
  builtWagonIds: string[]
  upgradedWagonIds: string[]
  routeNodes: RouteNode[]
  activeRouteId: string
  clues: StoryClueState[]
  endingUnlocked: boolean
  endingCompleted: boolean
  userSettings: UserSettings
  lastRunSummary: RunSummary | null
  progress: ProgressState
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function sanitizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function sanitizeString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function sanitizeCount(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : fallback
}

function sanitizeDifficulty(value: unknown): DifficultyId | undefined {
  return VALID_DIFFICULTIES.find((difficulty) => difficulty === value)
}

function sanitizeSwipePreset(value: unknown): SwipePreset | undefined {
  return VALID_SWIPE_PRESETS.find((preset) => preset === value)
}

function sanitizeProgressState(value: unknown): ProgressState | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  return {
    memoryTokens: sanitizeCount(value.memoryTokens),
    blueprintFragments: sanitizeCount(value.blueprintFragments),
    routeMarks: sanitizeCount(value.routeMarks),
  }
}

function sanitizeUserSettings(value: unknown): UserSettings | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  return {
    subtitlesEnabled: sanitizeBoolean(value.subtitlesEnabled, true),
    audioEnabled: sanitizeBoolean(value.audioEnabled, true),
    reducedMotion: sanitizeBoolean(value.reducedMotion, false),
    touchControlsEnabled: sanitizeBoolean(value.touchControlsEnabled, false),
    swipePreset: sanitizeSwipePreset(value.swipePreset) ?? 'balanced',
  }
}

function sanitizeLeaderMastery(value: unknown): Record<string, LeaderMasteryState> | undefined {
  if (!isRecord(value)) {
    return undefined
  }

  return Object.fromEntries(
    leaders.map((leader) => {
      const candidate = value[leader.id]
      const rawEntry = isRecord(candidate) ? candidate : null

      return [
        leader.id,
        {
          leaderId: leader.id,
          points: sanitizeCount(rawEntry?.points),
          requiredPoints: Math.max(1, sanitizeCount(rawEntry?.requiredPoints, 3)),
          unlocked: sanitizeBoolean(rawEntry?.unlocked, false),
        },
      ]
    }),
  )
}

function sanitizeStringIdArray(value: unknown, allowedValues: Set<string>): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  return [...new Set(value.filter((entry): entry is string => typeof entry === 'string' && allowedValues.has(entry)))]
}

function sanitizeRouteNodes(value: unknown): RouteNode[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const templateRoutes = createInitialRouteNodes()
  const rawMap = new Map<string, Record<string, unknown>>()

  for (const entry of value) {
    if (!isRecord(entry)) {
      continue
    }

    const id = sanitizeString(entry.id)

    if (templateRoutes.some((route) => route.id === id)) {
      rawMap.set(id, entry)
    }
  }

  const hydrated = templateRoutes.map((route) => {
    const rawRoute = rawMap.get(route.id)
    const nextStatus = VALID_ROUTE_STATUSES.find((status) => status === rawRoute?.status)

    return {
      ...route,
      status: nextStatus ?? route.status,
    }
  })

  const currentRoutes = hydrated.filter((route) => route.status === 'current')

  if (currentRoutes.length > 1) {
    let keptCurrent = false

    return hydrated.map((route) => {
      if (route.status !== 'current') {
        return route
      }

      if (!keptCurrent) {
        keptCurrent = true
        return route
      }

      return { ...route, status: 'available' }
    })
  }

  return hydrated
}

function sanitizeClues(value: unknown): StoryClueState[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const seen = new Set<string>()
  const validRouteIds = new Set(createInitialRouteNodes().map((route) => route.id))
  const clues: StoryClueState[] = []

  for (const entry of value) {
    if (!isRecord(entry)) {
      continue
    }

    const id = sanitizeString(entry.id)
    const routeId = sanitizeString(entry.routeId)

    if (!id || seen.has(id) || !validRouteIds.has(routeId as StoryClueState['routeId'])) {
      continue
    }

    seen.add(id)
    clues.push({
      id,
      routeId: routeId as StoryClueState['routeId'],
      title: sanitizeString(entry.title, 'Pista recuperada'),
      faction: sanitizeString(entry.faction, 'Desconhecida'),
      excerpt: sanitizeString(entry.excerpt, ''),
    })
  }

  return clues
}

function sanitizeRunSummary(value: unknown): RunSummary | null {
  if (!isRecord(value)) {
    return null
  }

  const rewards = sanitizeProgressState(value.rewards)
  const progressTotals = sanitizeProgressState(value.progressTotals)

  if (!rewards || !progressTotals) {
    return null
  }

  return {
    leaderName: sanitizeString(value.leaderName, 'Lider desconhecido'),
    stationName: sanitizeString(value.stationName, 'Estacao sem nome'),
    difficulty: sanitizeDifficulty(value.difficulty) ?? 'jornada',
    success: sanitizeBoolean(value.success, false),
    nightsSurvived: sanitizeCount(value.nightsSurvived),
    builtTiers: sanitizeCount(value.builtTiers),
    trainIntegrityLeft: sanitizeCount(value.trainIntegrityLeft),
    recruitsSaved: sanitizeCount(value.recruitsSaved),
    merchantSurvived: sanitizeBoolean(value.merchantSurvived, false),
    rewards,
    progressTotals,
    resourcesReturned: {
      scrap: sanitizeCount(value.resourcesReturned && isRecord(value.resourcesReturned) ? value.resourcesReturned.scrap : 0),
      cloth: sanitizeCount(value.resourcesReturned && isRecord(value.resourcesReturned) ? value.resourcesReturned.cloth : 0),
      lampOil: sanitizeCount(value.resourcesReturned && isRecord(value.resourcesReturned) ? value.resourcesReturned.lampOil : 0),
      food: sanitizeCount(value.resourcesReturned && isRecord(value.resourcesReturned) ? value.resourcesReturned.food : 0),
      coal: sanitizeCount(value.resourcesReturned && isRecord(value.resourcesReturned) ? value.resourcesReturned.coal : 0),
    },
    headline: sanitizeString(value.headline, 'Resumo indisponivel.'),
    clueUnlockedTitle: sanitizeString(value.clueUnlockedTitle) || null,
    nextRouteName: sanitizeString(value.nextRouteName) || null,
    masteryPointsEarned: sanitizeCount(value.masteryPointsEarned),
    masteryChallengeCompleted: sanitizeBoolean(value.masteryChallengeCompleted, false),
    masteryUnlocked: sanitizeBoolean(value.masteryUnlocked, false),
    masteryReward: sanitizeString(value.masteryReward, 'Sem recompensa registrada.'),
  }
}

export function sanitizePersistedProfile(value: unknown): Partial<PersistedProfile> | null {
  if (!isRecord(value)) {
    return null
  }

  const validLeaderIds = new Set(leaders.map((leader) => leader.id))
  const validWagonIds = new Set(wagonBlueprints.map((wagon) => wagon.id))
  const builtWagonIds = sanitizeStringIdArray(value.builtWagonIds, validWagonIds)
  const upgradedWagonIds = sanitizeStringIdArray(value.upgradedWagonIds, validWagonIds)
  const mergedBuiltIds = new Set([...(builtWagonIds ?? []), ...(upgradedWagonIds ?? [])])
  const routeNodes = sanitizeRouteNodes(value.routeNodes)
  const progress = sanitizeProgressState(value.progress)
  const activeRouteId = sanitizeString(value.activeRouteId)

  return {
    prologueCompleted: sanitizeBoolean(value.prologueCompleted, false),
    selectedLeaderId: validLeaderIds.has(sanitizeString(value.selectedLeaderId)) ? sanitizeString(value.selectedLeaderId) : undefined,
    difficulty: sanitizeDifficulty(value.difficulty),
    leaderMastery: sanitizeLeaderMastery(value.leaderMastery),
    builtWagonIds: [...mergedBuiltIds],
    upgradedWagonIds: upgradedWagonIds ?? [],
    routeNodes,
    activeRouteId,
    clues: sanitizeClues(value.clues),
    endingUnlocked: sanitizeBoolean(value.endingUnlocked, false) || sanitizeBoolean(value.endingCompleted, false),
    endingCompleted: sanitizeBoolean(value.endingCompleted, false),
    userSettings: sanitizeUserSettings(value.userSettings),
    lastRunSummary: sanitizeRunSummary(value.lastRunSummary),
    progress,
  }
}

export function loadPersistedProfile(): Partial<PersistedProfile> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return null
    }

    return sanitizePersistedProfile(JSON.parse(raw))
  } catch {
    return null
  }
}

export function savePersistedProfile(state: GameState): void {
  const snapshot: PersistedProfile = {
    prologueCompleted: state.prologueCompleted,
    selectedLeaderId: state.selectedLeaderId,
    difficulty: state.difficulty,
    leaderMastery: state.leaderMastery,
    builtWagonIds: state.builtWagonIds,
    upgradedWagonIds: state.upgradedWagonIds,
    routeNodes: state.routeNodes,
    activeRouteId: state.activeRouteId,
    clues: state.clues,
    endingUnlocked: state.endingUnlocked,
    endingCompleted: state.endingCompleted,
    userSettings: state.userSettings,
    lastRunSummary: state.lastRunSummary,
    progress: state.progress,
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
}
