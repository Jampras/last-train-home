import type { RouteId, StoryClueState, StoryMemoryState } from '../simulation/core/types'

interface StoryEntry {
  clue: StoryClueState
  memory: StoryMemoryState
}

const storyByRoute: Record<RouteId, StoryEntry> = {
  'quiet-platform': {
    clue: {
      id: 'clue-platform-ledger',
      routeId: 'quiet-platform',
      title: 'Livro de Vigia Rasgado',
      faction: 'Equipes de Captura',
      excerpt: 'A estacao segura do prologo ja estava marcada semanas antes do ataque.',
    },
    memory: {
      id: 'memory-platform-ledger',
      title: 'Livro de Vigia Rasgado',
      speaker: 'Memoria do Pai',
      body: 'Entre caixas de oleo e poeira de trilho, voce encontra um livro partido ao meio. Nele, a estacao segura aparece circulada em vermelho. Seu pai sabia que alguem estava lendo as rotas do Trem-Santuario.',
    },
  },
  'freight-yard': {
    clue: {
      id: 'clue-yard-signal',
      routeId: 'freight-yard',
      title: 'Sinal de Patio Sabotado',
      faction: 'Sabotadores da Linha',
      excerpt: 'Os caes nao vieram sozinhos; alguem desligou postes e abriu acessos antes das investidas.',
    },
    memory: {
      id: 'memory-yard-signal',
      title: 'Sinal de Patio Sabotado',
      speaker: 'Registro de Torre',
      body: 'No patio de carga, um painel ainda pulsa. As marcas mostram desligamentos sequenciais, executados minutos antes de cada ofensiva. Isto nao era caca improvisada. Era coordenacao.',
    },
  },
  'flooded-crossing': {
    clue: {
      id: 'clue-flooded-cargo',
      routeId: 'flooded-crossing',
      title: 'Manifesto de Carga Selado',
      faction: 'Traders da Noite',
      excerpt: 'O trem transportava mais do que sobreviventes; havia um compartimento escondido sendo rastreado.',
    },
    memory: {
      id: 'memory-flooded-cargo',
      title: 'Manifesto de Carga Selado',
      speaker: 'Passageira Desconhecida',
      body: 'Sob a agua rasa da travessia, voce ergue um cilindro estanque. O manifesto nao lista suprimentos. Lista um compartimento lacrado, entregue sob a supervisao do seu pai e marcado como prioridade absoluta.',
    },
  },
  'kennel-edge': {
    clue: {
      id: 'clue-kennel-order',
      routeId: 'kennel-edge',
      title: 'Ordem do Canil Central',
      faction: 'Distrito do Canil',
      excerpt: 'A ofensiva do prologo foi autorizada para recuperar o compartimento secreto do trem, custasse o que custasse.',
    },
    memory: {
      id: 'memory-kennel-order',
      title: 'Ordem do Canil Central',
      speaker: 'Voz do Pai',
      body: 'No limite do canil, a ultima ordem encaixa tudo no lugar. O ataque daquela noite foi dirigido ao Trem-Santuario. Seu pai ficou para atras porque sabia o que havia no vagao lacrado e escolheu proteger a comunidade mesmo ocultando a verdade.',
    },
  },
}

export function getStoryEntryForRoute(routeId: RouteId): StoryEntry {
  return storyByRoute[routeId]
}

export function getEndingMemory(): StoryMemoryState {
  return {
    id: 'ending-version-one',
    title: 'O Que o Trem Carrega',
    speaker: 'Narracao',
    body: 'Com as quatro pistas reunidas, o Trem-Santuario deixa de ser apenas fuga. O vagao lacrado guarda registros, nomes e provas de uma rede inteira de captura. Seu pai nao morreu apenas defendendo uma noite. Ele morreu segurando a unica coisa capaz de expor a caca. A comunidade agora conhece o peso da verdade e escolhe seguir com ela. Fim da versao 1.',
  }
}
