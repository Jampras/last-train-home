import type { ShellRefs } from '../../app/shell/createShell'
import { getLeaderById } from '../../game/content/leaders'
import type { InputController } from '../../game/input/InputController'
import type { GameStore } from '../../game/simulation/core/createGameStore'
import type { GameState } from '../../game/simulation/core/types'

export class HudController {
  constructor(
    private readonly shell: ShellRefs,
    private readonly store: GameStore,
    private readonly inputController: InputController,
  ) {
    this.bindActions()
  }

  render(state: GameState): void {
    const leader = getLeaderById(state.selectedLeaderId)
    const mastery = state.leaderMastery[leader.id]
    const resourceSource = state.run?.resources
    const currentRoute = state.routeNodes.find((route) => route.id === state.activeRouteId)
    const selectedWagon = state.wagonBlueprints.find((wagon) => wagon.leaderId === state.selectedLeaderId) ?? null
    const wagonBuilt = selectedWagon ? state.builtWagonIds.includes(selectedWagon.id) : false
    const wagonUpgraded = selectedWagon ? state.upgradedWagonIds.includes(selectedWagon.id) : false
    const blockingOverlay =
      state.settingsPanelOpen ||
      state.helpPanelOpen ||
      state.currentMemory !== null ||
      state.lastRunSummary !== null
    const isHub = state.currentScene === 'hub'
    const isPrologue = state.currentScene === 'prologue'
    const controlsHint = state.userSettings.touchControlsEnabled
      ? 'Deslize para mover | use os botoes para agir'
      : 'A/D move | Espaco interage | Q papel | Shift habilidade'
    const dayLabel =
      isPrologue ? 'Prologo' : state.run ? `Dia ${state.run.clock.day}` : 'Hub'
    const clockLabel =
      isPrologue
        ? 'Memoria viva'
        : state.run
          ? `${state.run.clock.timeLabel} | ${dayLabel}`
          : 'Trem-santuario'
    const statusLabel =
      isPrologue
        ? 'Safezone | sem risco real'
        : state.run
          ? this.getRunStatusLabel(state)
          : `Rota ${currentRoute?.name ?? 'Sem rota'} | perigo ${currentRoute?.danger ?? '-'}`
    const runTone = this.getRunTone(state)

    this.shell.appShell.dataset.scene = state.currentScene
    this.shell.appShell.dataset.touch = state.userSettings.touchControlsEnabled ? 'on' : 'off'
    this.shell.clockChip.textContent = clockLabel
    this.shell.resourceChip.textContent = isPrologue
      ? 'Siga o pai | acenda a luz | volte ao trem'
      : resourceSource
        ? `Suc ${resourceSource.scrap} | Tec ${resourceSource.cloth} | Oleo ${resourceSource.lampOil} | Com ${resourceSource.food} | Carv ${resourceSource.coal}`
        : `Mem ${state.progress.memoryTokens} | Frag ${state.progress.blueprintFragments} | Rotas ${state.progress.routeMarks}`
    this.shell.statusChip.textContent = statusLabel
    this.shell.clockChip.dataset.tone = isHub ? 'hub' : isPrologue ? 'guide' : runTone
    this.shell.resourceChip.dataset.tone = isHub ? 'hub' : state.run?.canDepart ? 'ready' : runTone === 'danger' ? 'danger-soft' : 'guide'
    this.shell.statusChip.dataset.tone = isHub ? 'hub' : isPrologue ? 'guide' : runTone

    this.shell.infoPanel.hidden = !isHub
    this.shell.infoPanel.innerHTML = isHub
      ? `
              <div class="hud-panel__eyebrow">Comando atual</div>
              <h1 class="hud-title">${leader.name}</h1>
              <p class="hud-subtitle">${leader.signature}</p>
              <p class="hud-panel__lead">Proxima saida: ${currentRoute?.name ?? 'Sem rota'} | ${this.getProjectStatus(selectedWagon, wagonBuilt, wagonUpgraded, mastery.unlocked)}</p>
              <div class="hud-grid">
                <div class="hud-stat">
                  <span class="hud-stat__label">Maestria</span>
                  <span class="hud-stat__value">${mastery.unlocked ? 'Liberada' : `${mastery.points}/${mastery.requiredPoints}`}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Projeto</span>
                  <span class="hud-stat__value">${wagonUpgraded ? 'Evoluido' : wagonBuilt ? 'Montado' : 'Pronto'}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Rota</span>
                  <span class="hud-stat__value">${currentRoute?.name ?? 'Sem rota'} | ${currentRoute?.danger ?? '-'}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Banco</span>
                  <span class="hud-stat__value">${state.progress.memoryTokens} mem | ${state.progress.blueprintFragments} frag | ${state.progress.routeMarks} rotas</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Pistas</span>
                  <span class="hud-stat__value">${state.clues.length}/4${state.endingUnlocked ? ' | final pronto' : ''}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Ultima nota</span>
                  <span class="hud-stat__value">${this.getLastOutcomeSummary(state.lastOutcome)}</span>
                </div>
              </div>
              <div class="hud-panel__divider"></div>
              <p class="hud-prompt">Troque de lider, ajuste a rota e parta. O trem cresce a cada volta.</p>
            `
      : ''

    this.shell.promptPanel.hidden = isHub || blockingOverlay
    this.shell.promptPanel.dataset.scene = state.currentScene
    this.shell.promptPanel.dataset.tone = isPrologue ? 'guide' : runTone
    this.shell.promptEyebrow.textContent = isPrologue
      ? 'Prologo | ultima estacao segura'
      : `${state.run?.stationName ?? 'Estacao'} | ${leader.name}`
    this.shell.promptTitle.textContent = this.getPromptTitle(state)
    this.shell.promptBody.textContent = isPrologue
      ? `${controlsHint} | ${this.getPrologueSupport(state)}`
      : `${this.getRunStatusLine(state)} | ${controlsHint}`
    this.shell.promptTags.innerHTML = this.getPromptTags(state)
      .map((tag) => `<span class="hud-prompt-tag">${tag}</span>`)
      .join('')

    const event = state.currentEvent

    if (event && state.userSettings.subtitlesEnabled) {
      this.shell.eventBanner.hidden = false
      this.shell.eventBanner.dataset.tone = event.tone
      this.shell.eventTitle.textContent = `${event.title} | ${event.at}`
      this.shell.eventBody.textContent = event.body
    } else {
      this.shell.eventBanner.hidden = true
    }

    if (state.currentMemory) {
      this.shell.summaryPanel.hidden = false
      this.shell.summaryPanel.dataset.mode = 'memory'
      this.shell.summaryEyebrow.textContent = 'Memoria do trem'
      this.shell.summaryTitle.textContent = state.currentMemory.title
      this.shell.summaryBody.innerHTML = `
        <p class="summary-panel__lead"><strong>${state.currentMemory.speaker}</strong></p>
        <p>${state.currentMemory.body}</p>
      `
      this.shell.dismissSummaryButton.textContent = 'Fechar memoria'
    } else if (state.lastRunSummary) {
      this.shell.summaryPanel.hidden = false
      this.shell.summaryPanel.dataset.mode = 'summary'
      this.shell.summaryEyebrow.textContent = state.lastRunSummary.success ? 'Relatorio de retorno' : 'Retirada registrada'
      this.shell.summaryTitle.textContent = state.lastRunSummary.success
        ? 'Resumo da ultima run'
        : 'Retirada registrada'
      this.shell.summaryBody.innerHTML = `
        <p>${state.lastRunSummary.headline}</p>
        <p>Lider: ${state.lastRunSummary.leaderName} | Estacao: ${state.lastRunSummary.stationName} | Modo: ${state.lastRunSummary.difficulty === 'aconchegante' ? 'Aconchegante' : 'Jornada'}</p>
        <p>Noites: ${state.lastRunSummary.nightsSurvived} | Marcas: ${state.lastRunSummary.builtTiers} | Integridade final: ${state.lastRunSummary.trainIntegrityLeft} | Recrutas salvos: ${state.lastRunSummary.recruitsSaved}</p>
        <p>Ganhos da run: ${state.lastRunSummary.rewards.memoryTokens} memorias, ${state.lastRunSummary.rewards.blueprintFragments} fragmentos, ${state.lastRunSummary.rewards.routeMarks} marcas de rota.</p>
        <p>Banco do trem agora: ${state.lastRunSummary.progressTotals.memoryTokens} memorias, ${state.lastRunSummary.progressTotals.blueprintFragments} fragmentos, ${state.lastRunSummary.progressTotals.routeMarks} marcas.</p>
        <p>Recursos trazidos: sucata ${state.lastRunSummary.resourcesReturned.scrap}, tecido ${state.lastRunSummary.resourcesReturned.cloth}, oleo ${state.lastRunSummary.resourcesReturned.lampOil}, comida ${state.lastRunSummary.resourcesReturned.food}, carvao ${state.lastRunSummary.resourcesReturned.coal}.</p>
        <p>${state.lastRunSummary.merchantSurvived ? 'O mercador sobreviveu a noite e reforcou a partida.' : 'Nenhum acerto especial do mercador foi registrado nesta run.'}</p>
        <p>${state.lastRunSummary.clueUnlockedTitle ? `Nova pista destravada: ${state.lastRunSummary.clueUnlockedTitle}.` : 'Nenhuma pista nova nesta volta, mas o progresso foi mantido.'}</p>
        <p>${state.lastRunSummary.nextRouteName ? `Proxima parada recomendada: ${state.lastRunSummary.nextRouteName}.` : 'Nenhuma rota nova aberta nesta volta.'}</p>
        <p>Maestria: +${state.lastRunSummary.masteryPointsEarned} ponto(s)${state.lastRunSummary.masteryChallengeCompleted ? ' com bonus de desafio' : ''}.</p>
        <p>${state.lastRunSummary.masteryUnlocked ? `Nova evolucao liberada: ${state.lastRunSummary.masteryReward}` : `Proximo marco: ${state.lastRunSummary.masteryReward}`}</p>
      `
      this.shell.dismissSummaryButton.textContent = 'Fechar resumo'
    } else {
      this.shell.summaryPanel.hidden = true
      this.shell.summaryPanel.dataset.mode = ''
    }

    this.shell.previousButton.hidden = !isHub
    this.shell.nextButton.hidden = !isHub
    this.shell.settingsButton.hidden = false
    this.shell.modeButton.hidden = !isHub
    this.shell.routeButton.hidden = !isHub
    this.shell.buildButton.hidden = !isHub
    this.shell.crewButton.hidden = isHub || isPrologue
    this.shell.skillButton.hidden = isHub || isPrologue
    this.shell.actionButton.hidden = isPrologue
    this.shell.settingsPanel.hidden = !state.settingsPanelOpen
    this.shell.helpPanel.hidden = !state.helpPanelOpen
    this.shell.touchOverlay.hidden = !state.userSettings.touchControlsEnabled
    this.shell.previousButton.disabled = blockingOverlay
    this.shell.nextButton.disabled = blockingOverlay
    this.shell.settingsButton.disabled = state.settingsPanelOpen
    this.shell.helpButton.disabled = state.helpPanelOpen
    this.shell.modeButton.disabled = blockingOverlay
    this.shell.routeButton.disabled = blockingOverlay
    this.shell.buildButton.disabled = blockingOverlay
    this.shell.crewButton.disabled = blockingOverlay || !state.run?.recruitedCats.length
    this.shell.skillButton.disabled = blockingOverlay
    this.shell.actionButton.disabled = blockingOverlay
    this.shell.touchLeftButton.disabled = blockingOverlay
    this.shell.touchRightButton.disabled = blockingOverlay
    this.shell.touchInteractButton.disabled = blockingOverlay
    this.shell.touchSkillButton.disabled = blockingOverlay
    this.shell.touchCrewButton.disabled = blockingOverlay
    this.shell.helpTitle.textContent = this.getHelpTitle(state)
    this.shell.helpBody.innerHTML = this.getHelpBody(state)

    this.shell.previousButton.textContent = 'Lider -'
    this.shell.nextButton.textContent = 'Lider +'
    this.shell.buildButton.textContent = this.getBuildButtonLabel(selectedWagon, wagonBuilt, wagonUpgraded, mastery.unlocked)
    this.shell.crewButton.textContent = state.run?.recruitedCats.length ? 'Equipe' : 'Sem equipe'
    this.shell.skillButton.textContent = isHub ? 'Poder' : 'Poder'
    this.shell.subtitlesButton.textContent = `Legendas: ${state.userSettings.subtitlesEnabled ? 'ligadas' : 'desligadas'}`
    this.shell.audioButton.textContent = `Audio: ${state.userSettings.audioEnabled ? 'ligado' : 'desligado'}`
    this.shell.motionButton.textContent = `Movimento: ${state.userSettings.reducedMotion ? 'reduzido' : 'padrao'}`
    this.shell.touchButton.textContent = `Touch: ${state.userSettings.touchControlsEnabled ? 'botoes visiveis' : 'apenas swipe'}`
    this.shell.swipeButton.textContent = `Swipe: ${this.formatSwipePreset(state.userSettings.swipePreset)}`
    this.shell.actionButton.textContent = isHub
      ? state.endingUnlocked && !state.endingCompleted
        ? 'Ver desfecho'
        : 'Partir'
      : state.run?.canDepart
        ? 'Partir'
        : 'Sair agora'
    this.shell.actionButton.dataset.tone = isHub ? 'ready' : state.run?.canDepart ? 'ready' : runTone === 'danger' ? 'danger' : 'guide'
    this.shell.skillButton.dataset.tone = runTone === 'danger' ? 'danger-soft' : 'guide'
    this.shell.crewButton.dataset.tone = state.run?.recruitedCats.length ? 'guide' : 'muted'
    this.shell.buildButton.dataset.tone = isHub ? 'guide' : runTone === 'danger' ? 'danger-soft' : 'guide'
  }

  private getPromptTitle(state: GameState): string {
    const prompt = state.contextPrompt.trim()

    if (state.currentScene === 'prologue') {
      if (prompt.includes('lampiao')) {
        return 'Acenda o lampiao'
      }

      if (prompt.includes('compartimento')) {
        return 'Entre no compartimento'
      }

      if (prompt.includes('volte para o vagao') || prompt.includes('Volte para o trem')) {
        return 'Volte para o trem'
      }

      if (prompt.includes('gatinha')) {
        return 'Ajude a pequena'
      }

      if (prompt.includes('barricada')) {
        return 'Reforce a barricada'
      }

      return 'Siga seu pai'
    }

    if (state.run?.canDepart) {
      return 'Volte ao trem'
    }

    if (state.run && state.run.enemies.length > 0) {
      return state.run.enemies.length > 2 ? 'Segure a investida' : 'Defenda a linha'
    }

    if (state.run?.merchant?.active) {
      return 'Proteja o mercador'
    }

    if (prompt.includes('Comando') && prompt.includes('papel')) {
      return 'Troque o papel da tripulacao'
    }

    if ((prompt.includes('Deslize') || prompt.includes('A/D')) && prompt.includes('explorar')) {
      return 'Explore a plataforma'
    }

    if (prompt.includes('mercador')) {
      return 'Proteja o mercador'
    }

    if (prompt.includes('segure a linha')) {
      return 'Segure a linha'
    }

    const sentence = prompt.split('.')[0]?.trim() ?? prompt
    return sentence.length > 68 ? `${sentence.slice(0, 65).trim()}...` : sentence
  }

  private getPrologueSupport(state: GameState): string {
    if (state.contextPrompt.includes('lampiao')) {
      return 'Fique perto da luz antes da noite'
    }

    if (state.contextPrompt.includes('gatinha')) {
      return 'Interaja quando estiver ao lado dela'
    }

    if (state.contextPrompt.includes('barricada')) {
      return 'A sucata da safezone segura a entrada'
    }

    if (state.contextPrompt.includes('compartimento')) {
      return 'Corra agora; nao fique fora do trem'
    }

    return 'Aprenda o ritmo antes do desastre'
  }

  private getPromptTags(state: GameState): string[] {
    if (state.currentScene === 'prologue') {
      if (state.contextPrompt.includes('lampiao')) {
        return ['Chegue perto', 'Espaco acende', 'Fique na luz']
      }

      if (state.contextPrompt.includes('gatinha')) {
        return ['Chegue perto', 'Espaco ajuda', 'Volte ao trem']
      }

      if (state.contextPrompt.includes('barricada')) {
        return ['Chegue perto', 'Espaco reforca', 'Segure a entrada']
      }

      if (state.contextPrompt.includes('compartimento')) {
        return ['Corra', 'Entre no trem', 'Nao fique fora']
      }

      return state.userSettings.touchControlsEnabled
        ? ['Deslize', 'Toque para agir', 'Siga seu pai']
        : ['A/D move', 'Espaco age', 'Siga seu pai']
    }

    if (!state.run) {
      return ['Escolha um lider', 'Monte um vagao', 'Parta']
    }

    if (state.run.enemies.length > 0) {
      return ['Segure a linha', 'Use habilidade', 'Proteja o trem']
    }

    if (state.run.canDepart && Math.abs(state.run.playerX - state.run.trainX) <= 140) {
      return ['Chegue ao trem', 'Espaco parte', 'Feche a run']
    }

    if (state.run.canDepart) {
      return ['Volte ao trem', 'Partida pronta', 'Feche a run']
    }

    if (state.run.merchant?.active) {
      return ['Proteja a banca', 'Aguente a noite', 'Ganhe bonus']
    }

    if (state.contextPrompt.includes('coletar')) {
      return ['Chegue perto', 'Espaco coleta', 'Ganhe recursos']
    }

    if (state.contextPrompt.includes('resgatar')) {
      return ['Chegue perto', 'Espaco resgata', 'Leve ao trem']
    }

    if (state.contextPrompt.includes('trocar o papel')) {
      return ['Fique no trem', 'Q troca papel', 'Teste funcoes']
    }

    if (state.contextPrompt.includes('gastar')) {
      return ['Chegue perto', 'Espaco constroi', 'Use sucata']
    }

    return state.userSettings.touchControlsEnabled
      ? ['Deslize', 'Explore lados', 'Volte ao trem']
      : ['A/D explora', 'Shift habilidade', 'Volte ao trem']
  }

  private getRunStatusLine(state: GameState): string {
    if (!state.run) {
      return 'Sem run ativa'
    }

    if (state.run.canDepart) {
      return `Partida pronta | Integridade ${state.run.trainIntegrity}/${state.run.maxTrainIntegrity} | Volte ao centro do trem`
    }

    if (state.run.enemies.length > 0) {
      return `${state.run.enemies.length} invasor(es) na linha | Integridade ${state.run.trainIntegrity}/${state.run.maxTrainIntegrity} | ${this.getNextWindowLabel(state)}`
    }

    if (state.run.merchant?.active) {
      return `Mercador protegido | ${this.getNextWindowLabel(state)} | Segure ate o amanhecer`
    }

    return `Linha calma | Integridade ${state.run.trainIntegrity}/${state.run.maxTrainIntegrity} | ${this.getNextWindowLabel(state)}`
  }

  private getHelpTitle(state: GameState): string {
    if (state.currentScene === 'prologue') {
      return 'Aprenda o basico'
    }

    if (state.currentScene === 'run') {
      return 'Como sobreviver a run'
    }

    return 'Como avancar no trem'
  }

  private getHelpBody(state: GameState): string {
    const controls = state.userSettings.touchControlsEnabled
      ? [
          'Mover: deslize para os lados ou use os botoes de direcao.',
          'Agir: toque em Interagir quando estiver perto de algo importante.',
          'Habilidade: use o botao Habilidade para ativar a tecnica do lider.',
          'Comando: use Comando perto do trem para trocar o papel dos gatos recrutados.',
        ]
      : [
          'Mover: use A/D ou as setas laterais.',
          'Agir: use Espaco, Enter ou seta para cima perto de um recurso, gato ou construcao.',
          'Habilidade: use Shift para a tecnica do lider.',
          'Comando: use Q perto do trem para trocar o papel da tripulacao.',
        ]

    if (state.currentScene === 'prologue') {
      return `
        <p>O prologo ensina tres ideias: ficar perto da luz, ajudar quem ficou para tras e voltar ao trem antes da noite.</p>
        <p>${controls[0]}</p>
        <p>${controls[1]}</p>
        <p>Se ouvir o desastre, pare de explorar e corra para dentro do trem.</p>
      `
    }

    if (state.currentScene === 'run') {
      return `
        <p>Loop da run: explore de dia, colete recursos, resgate gatos, construa a linha e sobreviva ate liberar a partida.</p>
        <p>${controls[0]}</p>
        <p>${controls[1]}</p>
        <p>${controls[2]}</p>
        <p>${controls[3]}</p>
        <p>Quando o botao principal mudar para <strong>Partir</strong>, volte ao trem e encerre a run com sucesso.</p>
      `
    }

    return `
      <p>No hub voce decide quem lidera a proxima expedicao, qual rota seguir e qual vagao montar.</p>
      <p>Escolha um lider para mudar o estilo da run.</p>
      <p>Monte ou evolua vagoes para ganhar novas ferramentas permanentes.</p>
      <p>Se o desfecho estiver pronto, o botao principal muda para <strong>Ver desfecho</strong>.</p>
    `
  }

  private getRunStatusLabel(state: GameState): string {
    if (!state.run) {
      return 'Sem run ativa'
    }

    if (state.run.canDepart) {
      return 'partida pronta | volte ao trem'
    }

    if (state.run.enemies.length > 0) {
      return `${state.run.enemies.length} invasores | segure a linha`
    }

    if (state.run.trainIntegrity / state.run.maxTrainIntegrity <= 0.4) {
      return `integridade critica | ${state.run.trainIntegrity}/${state.run.maxTrainIntegrity}`
    }

    const merchant = state.run.merchant?.active ? `mercador ${state.run.merchant.arrivalTime}` : 'sem mercador'
    return `linha calma | ${merchant}`
  }

  private getRunTone(state: GameState): 'hub' | 'guide' | 'merchant' | 'danger' | 'danger-soft' | 'ready' | 'muted' {
    if (state.currentScene === 'hub') {
      return 'hub'
    }

    if (state.currentScene === 'prologue') {
      return 'guide'
    }

    if (!state.run) {
      return 'guide'
    }

    if (state.run.canDepart) {
      return 'ready'
    }

    if (state.run.enemies.length > 0 || state.run.trainIntegrity / state.run.maxTrainIntegrity <= 0.4) {
      return 'danger'
    }

    if (state.run.merchant?.active) {
      return 'merchant'
    }

    return 'guide'
  }

  private getNextWindowLabel(state: GameState): string {
    if (!state.run) {
      return 'Sem relogio ativo'
    }

    const windows = [
      { minute: 0, label: '00:00 meia-noite' },
      { minute: 180, label: '03:00 vigilia' },
      { minute: 360, label: '06:00 amanhecer' },
      { minute: 480, label: '08:00 manha' },
      { minute: 720, label: '12:00 meio-dia' },
      { minute: 1200, label: '20:00 anoitecer' },
    ]
    const minuteOfDay = ((Math.floor(state.run.clock.totalMinutes) % 1440) + 1440) % 1440
    const nextWindow = windows.find((window) => window.minute > minuteOfDay) ?? windows[0]

    return `Proxima janela ${nextWindow.label}`
  }

  private getProjectStatus(
    selectedWagon: GameState['wagonBlueprints'][number] | null,
    wagonBuilt: boolean,
    wagonUpgraded: boolean,
    masteryUnlocked: boolean,
  ): string {
    if (!selectedWagon) {
      return 'Sem projeto'
    }

    if (!wagonBuilt) {
      return `${selectedWagon.name} pronto para montar`
    }

    if (wagonUpgraded) {
      return `${selectedWagon.upgradeName} ativo`
    }

    return masteryUnlocked
      ? `${selectedWagon.name} montado | evolucao liberada`
      : `${selectedWagon.name} montado | falta maestria`
  }

  private getBuildButtonLabel(
    selectedWagon: GameState['wagonBlueprints'][number] | null,
    wagonBuilt: boolean,
    wagonUpgraded: boolean,
    masteryUnlocked: boolean,
  ): string {
    if (!selectedWagon) {
      return 'Projeto'
    }

    if (!wagonBuilt) {
      return 'Projeto'
    }

    if (wagonUpgraded) {
      return 'Pronto'
    }

    return masteryUnlocked ? 'Evoluir' : 'Trava'
  }

  private getLastOutcomeSummary(lastOutcome: string): string {
    if (lastOutcome.length <= 56) {
      return lastOutcome
    }

    return `${lastOutcome.slice(0, 53).trim()}...`
  }

  private formatSwipePreset(preset: string): string {
    if (preset === 'tight') {
      return 'curto'
    }

    if (preset === 'relaxed') {
      return 'amplo'
    }

    return 'equilibrado'
  }

  private bindActions(): void {
    this.shell.previousButton.addEventListener('click', () => this.store.selectPreviousLeader())
    this.shell.nextButton.addEventListener('click', () => this.store.selectNextLeader())
    this.shell.settingsButton.addEventListener('click', () => this.store.toggleSettingsPanel())
    this.shell.helpButton.addEventListener('click', () => this.store.toggleHelpPanel())
    this.shell.modeButton.addEventListener('click', () => this.store.toggleDifficulty())
    this.shell.routeButton.addEventListener('click', () => this.store.advanceRouteSelection())
    this.shell.buildButton.addEventListener('click', () => this.store.buildSelectedLeaderWagon())
    this.shell.crewButton.addEventListener('click', () => this.store.cycleCrewRole())
    this.shell.subtitlesButton.addEventListener('click', () => this.store.toggleSubtitles())
    this.shell.audioButton.addEventListener('click', () => this.store.toggleAudio())
    this.shell.motionButton.addEventListener('click', () => this.store.toggleReducedMotion())
    this.shell.touchButton.addEventListener('click', () => this.store.toggleTouchControls())
    this.shell.swipeButton.addEventListener('click', () => this.store.cycleSwipePreset())
    this.shell.closeSettingsButton.addEventListener('click', () => this.store.toggleSettingsPanel())
    this.shell.closeHelpButton.addEventListener('click', () => this.store.toggleHelpPanel())
    this.shell.dismissSummaryButton.addEventListener('click', () => {
      if (this.store.getState().currentMemory) {
        this.store.dismissCurrentMemory()
      } else {
        this.store.clearLastRunSummary()
      }
    })
    this.shell.skillButton.addEventListener('click', () => this.store.useLeaderSkill())
    this.shell.actionButton.addEventListener('click', () => {
      if (this.store.getState().currentScene === 'hub') {
        this.store.startRun()
      } else {
        this.store.leaveRun()
      }
    })
    this.bindTouchHoldButton(this.shell.touchLeftButton, 'move_left')
    this.bindTouchHoldButton(this.shell.touchRightButton, 'move_right')
    this.bindTouchButton(this.shell.touchInteractButton, 'interact')
    this.bindTouchButton(this.shell.touchSkillButton, 'leader_skill')
    this.bindTouchButton(this.shell.touchCrewButton, 'crew_command')
  }

  private bindTouchButton(button: HTMLButtonElement, action: Parameters<InputController['trigger']>[0]): void {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      this.inputController.trigger(action)
    })
  }

  private bindTouchHoldButton(button: HTMLButtonElement, action: Parameters<InputController['trigger']>[0]): void {
    let intervalId: number | null = null
    const stop = () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId)
        intervalId = null
      }
    }

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      this.inputController.trigger(action, 120)
      stop()
      intervalId = window.setInterval(() => {
        this.inputController.trigger(action, 120)
      }, 90)
    })
    button.addEventListener('pointerup', stop)
    button.addEventListener('pointercancel', stop)
    button.addEventListener('pointerleave', stop)
  }
}
