import type { DifficultyId, TriggeredEvent } from '../simulation/core/types'

type WindowKey = 'dawn' | 'morning' | 'noon' | 'nightfall' | 'midnight' | 'predawn'

const positiveEvents: TriggeredEvent[] = [
  {
    tone: 'positive',
    title: 'Mercador ao Lado do Trilho',
    body: 'Um vendedor noturno montou banca perto do trem. Se amanhecer em seguranca, ele deixara recursos raros.',
    cue: 'merchant',
    kind: 'merchant_arrival',
  },
  {
    tone: 'positive',
    title: 'Caixote Esquecido',
    body: 'Os trilhos revelaram um carregamento pequeno de sucata e pano seco.',
    cue: 'positive',
    rewards: { scrap: 2, cloth: 1 },
  },
  {
    tone: 'positive',
    title: 'Amanhecer Generoso',
    body: 'Com a noite vencida, a tripulacao encontrou mais oleo e carv ao aproveitavel.',
    cue: 'positive',
    rewards: { lampOil: 1, coal: 1 },
  },
]

const mixedEvents: TriggeredEvent[] = [
  {
    tone: 'mixed',
    title: 'Oferta Rara',
    body: 'O mercador deixa recursos, mas a movimentacao aumenta o risco nas bordas.',
    cue: 'mixed',
    rewards: { scrap: 1, food: 1 },
  },
  {
    tone: 'mixed',
    title: 'Sinal na Neblina',
    body: 'Uma velha torre acendeu. Ha recompensa se voce sustentar a linha por mais tempo.',
    cue: 'mixed',
    rewards: { lampOil: 1 },
    progress: { routeMarks: 1 },
  },
  {
    tone: 'mixed',
    title: 'Trilho Descoberto',
    body: 'Uma rota lateral apareceu com materiais uteis, mas abre espaco para emboscadas.',
    cue: 'mixed',
    rewards: { cloth: 1, coal: 1 },
  },
]

const hostileEvents: TriggeredEvent[] = [
  {
    tone: 'hostile',
    title: 'Ataque Surpresa',
    body: 'Humanos com lanternas e redes foram vistos antes do previsto.',
    cue: 'hostile',
    rewards: { scrap: -1 },
  },
  {
    tone: 'hostile',
    title: 'Cao de Investida',
    body: 'Um cao pesado abriu uma falha em uma barricada leve.',
    cue: 'hostile',
    rewards: { food: -1 },
  },
  {
    tone: 'hostile',
    title: 'Sabotagem de Lampioes',
    body: 'Uma cadeia de luz falhou e o trem consumiu oleo extra para estabilizar o perimetro.',
    cue: 'hostile',
    rewards: { lampOil: -1 },
  },
]

const mysteryEvents: TriggeredEvent[] = [
  {
    tone: 'mystery',
    title: 'Sino Sem Dono',
    body: 'Um toque distante deixou uma memoria estranha presa no ar.',
    cue: 'mystery',
    progress: { memoryTokens: 1 },
  },
  {
    tone: 'mystery',
    title: 'Compartimento Oculto',
    body: 'O trem revelou um encaixe escondido com um fragmento de projeto.',
    cue: 'mystery',
    progress: { blueprintFragments: 1 },
  },
  {
    tone: 'mystery',
    title: 'Pegadas na Poeira',
    body: 'Algo passou antes de voces. A trilha rendeu pistas e um pouco de sucata.',
    cue: 'mystery',
    rewards: { scrap: 1 },
    progress: { routeMarks: 1 },
  },
]

function chooseFrom<T>(items: T[], indexSeed: number): T {
  return items[indexSeed % items.length]
}

export function resolveClockEvent(
  windowKey: WindowKey,
  difficulty: DifficultyId,
  day: number,
  totalMinutes: number,
): TriggeredEvent {
  const seed = day + Math.floor(totalMinutes / 60)
  const isCozy = difficulty === 'aconchegante'

  if (windowKey === 'dawn') {
    return chooseFrom(positiveEvents, seed)
  }

  if (windowKey === 'morning') {
    return chooseFrom(day <= 2 || isCozy ? [...positiveEvents, ...mixedEvents] : mixedEvents, seed)
  }

  if (windowKey === 'noon') {
    return chooseFrom(day <= 2 ? [...positiveEvents, ...mixedEvents] : [...mixedEvents, ...positiveEvents], seed)
  }

  if (windowKey === 'nightfall') {
    if (day <= 2 && seed % 2 === 1) {
      return positiveEvents[0]
    }

    if ((isCozy && day <= 3) || day <= 1) {
      return chooseFrom([...positiveEvents, ...mixedEvents], seed)
    }

    if (!isCozy && day <= 2) {
      return chooseFrom(mixedEvents, seed)
    }

    return chooseFrom([...mixedEvents, ...hostileEvents], seed)
  }

  if (windowKey === 'midnight') {
    return chooseFrom(day <= 2 ? [...mysteryEvents, ...positiveEvents] : [...mysteryEvents, ...mixedEvents], seed)
  }

  if ((isCozy && day <= 3) || day <= 1) {
    return chooseFrom([...mixedEvents, ...positiveEvents, ...mysteryEvents], seed)
  }

  if (!isCozy && day <= 2) {
    return chooseFrom([...mixedEvents, ...mysteryEvents], seed)
  }

  return chooseFrom([...hostileEvents, ...mysteryEvents], seed)
}
