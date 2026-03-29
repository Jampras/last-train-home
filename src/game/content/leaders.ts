import type { LeaderDefinition } from '../simulation/core/types'

export const leaders: LeaderDefinition[] = [
  {
    id: 'mimi',
    name: 'Mimi, a Maquinista',
    signature: 'Oficina dos Trilhos',
    runPerk: 'Construcao pesada mais estavel e mais sucata de retorno.',
    masteryGoal: 'Passar uma noite sem dano estrutural no trem.',
    masteryReward: 'Desbloqueia a evolucao Guindaste Blindado para iniciar defesas no nivel 1.',
    accent: 0xf2c078,
  },
  {
    id: 'tico',
    name: 'Tico, o Lampista',
    signature: 'Carro-Lanterna',
    runPerk: 'Recupera oleo e estende a seguranca das cadeias de luz.',
    masteryGoal: 'Manter todas as lanternas principais acesas ate o amanhecer.',
    masteryReward: 'Desbloqueia a evolucao Farol de Vigilia para iniciar luzes no nivel 1.',
    accent: 0xf7d5a6,
  },
  {
    id: 'nina',
    name: 'Nina, a Costureira',
    signature: 'Atelie de Retalhos',
    runPerk: 'Gera tecido e reforca abrigos de recrutas.',
    masteryGoal: 'Resgatar tres gatos em uma unica run.',
    masteryReward: 'Desbloqueia a evolucao Refugio Costurado para iniciar suportes no nivel 1.',
    accent: 0xd8a7b1,
  },
  {
    id: 'bento',
    name: 'Bento, o Cozinheiro',
    signature: 'Cozinha de Trem',
    runPerk: 'Converte eventos positivos em comida extra e moral.',
    masteryGoal: 'Terminar uma estacao sem ninguem passar fome.',
    masteryReward: 'Desbloqueia a evolucao Caldeirao de Vigilia para ampliar comida e eventos positivos.',
    accent: 0xb7d58d,
  },
  {
    id: 'lua',
    name: 'Lua, a Batedora',
    signature: 'Torre de Observacao',
    runPerk: 'Antecipacao de eventos e melhores rotas laterais.',
    masteryGoal: 'Encontrar todos os recursos e caches da estacao na mesma run.',
    masteryReward: 'Desbloqueia a evolucao Carta de Campo para abrir caches extras em cada run.',
    accent: 0x94b3d1,
  },
  {
    id: 'sombra',
    name: 'Sombra, a Sussurradora',
    signature: 'Carro da Memoria',
    runPerk: 'Mais chances de eventos misteriosos e ganhos de memoria.',
    masteryGoal: 'Ativar dois eventos misteriosos em uma run.',
    masteryReward: 'Desbloqueia a evolucao Eco Profundo para extrair memoria extra de eventos misteriosos.',
    accent: 0xbba7e3,
  },
]

export function getLeaderById(id: string): LeaderDefinition {
  return leaders.find((leader) => leader.id === id) ?? leaders[0]
}
