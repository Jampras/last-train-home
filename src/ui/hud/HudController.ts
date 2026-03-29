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
    const blockingOverlay = state.settingsPanelOpen || state.currentMemory !== null || state.lastRunSummary !== null
    const isHub = state.currentScene === 'hub'
    const isPrologue = state.currentScene === 'prologue'
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

    this.shell.appShell.dataset.scene = state.currentScene
    this.shell.clockChip.textContent = clockLabel
    this.shell.resourceChip.textContent = isPrologue
      ? 'Siga o pai | acenda a luz | volte ao trem'
      : resourceSource
        ? `Suc ${resourceSource.scrap} | Tec ${resourceSource.cloth} | Oleo ${resourceSource.lampOil} | Com ${resourceSource.food} | Carv ${resourceSource.coal}`
        : `Mem ${state.progress.memoryTokens} | Frag ${state.progress.blueprintFragments} | Rotas ${state.progress.routeMarks}`
    this.shell.statusChip.textContent = statusLabel

    this.shell.infoPanel.hidden = !isHub
    this.shell.infoPanel.innerHTML = isHub
      ? `
              <h1 class="hud-title">${leader.name}</h1>
              <p class="hud-subtitle">${leader.signature} | ${leader.runPerk}</p>
              <div class="hud-grid">
                <div class="hud-stat">
                  <span class="hud-stat__label">Maestria</span>
                  <span class="hud-stat__value">${mastery.unlocked ? 'Liberada' : `${mastery.points}/${mastery.requiredPoints}`}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Desafio</span>
                  <span class="hud-stat__value">${leader.masteryGoal}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Recompensa</span>
                  <span class="hud-stat__value">${leader.masteryReward}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Rota atual</span>
                  <span class="hud-stat__value">${currentRoute?.name ?? 'Sem rota'} | ${currentRoute?.danger ?? '-'}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Projeto do lider</span>
                  <span class="hud-stat__value">${this.getProjectStatus(selectedWagon, wagonBuilt, wagonUpgraded, mastery.unlocked)}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Mapa de rotas</span>
                  <span class="hud-stat__value">${state.routeNodes.map((route) => `${route.name} [${route.status}]`).join(' | ')}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Vagoes permanentes</span>
                  <span class="hud-stat__value">${state.builtWagonIds.length} montados | ${state.upgradedWagonIds.length} evoluidos</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Pistas</span>
                  <span class="hud-stat__value">${state.clues.length}/4 reunidas${state.endingUnlocked ? ' | desfecho pronto' : ''}</span>
                </div>
                <div class="hud-stat">
                  <span class="hud-stat__label">Ultima nota</span>
                  <span class="hud-stat__value">${state.lastOutcome}</span>
                </div>
              </div>
              <p class="hud-prompt">Cada volta aumenta o trem. Escolha um lider, monte um vagao e siga a trilha do ataque que abriu o prologo.</p>
            `
      : ''

    this.shell.promptPanel.hidden = isHub || blockingOverlay
    this.shell.promptEyebrow.textContent = isPrologue
      ? 'Prologo | ultima estacao segura'
      : `${state.run?.stationName ?? 'Estacao'} | ${leader.name}`
    this.shell.promptTitle.textContent = state.contextPrompt
    this.shell.promptBody.textContent = isPrologue
      ? `${state.lastOutcome} A/D ou swipe lateral. Espaco, Enter ou toque para interagir.`
      : `Integridade ${state.run?.trainIntegrity ?? 0}/${state.run?.maxTrainIntegrity ?? 0} | ${this.getNextWindowLabel(state)} | ${state.run?.canDepart ? 'saida liberada' : 'segure a linha'} | ${this.getRunProjectText(selectedWagon, wagonUpgraded)}`

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
      this.shell.summaryTitle.textContent = state.currentMemory.title
      this.shell.summaryBody.innerHTML = `
        <p><strong>${state.currentMemory.speaker}</strong></p>
        <p>${state.currentMemory.body}</p>
      `
      this.shell.dismissSummaryButton.textContent = 'Fechar memoria'
    } else if (state.lastRunSummary) {
      this.shell.summaryPanel.hidden = false
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
    this.shell.touchOverlay.hidden = !state.userSettings.touchControlsEnabled
    this.shell.previousButton.disabled = blockingOverlay
    this.shell.nextButton.disabled = blockingOverlay
    this.shell.settingsButton.disabled = state.settingsPanelOpen
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

    this.shell.buildButton.textContent = this.getBuildButtonLabel(selectedWagon, wagonBuilt, wagonUpgraded, mastery.unlocked)
    this.shell.crewButton.textContent = state.run?.recruitedCats.length ? 'Tripulacao' : 'Sem tripulacao'
    this.shell.subtitlesButton.textContent = `Legendas: ${state.userSettings.subtitlesEnabled ? 'ligadas' : 'desligadas'}`
    this.shell.audioButton.textContent = `Audio: ${state.userSettings.audioEnabled ? 'ligado' : 'desligado'}`
    this.shell.motionButton.textContent = `Movimento: ${state.userSettings.reducedMotion ? 'reduzido' : 'padrao'}`
    this.shell.touchButton.textContent = `Touch: ${state.userSettings.touchControlsEnabled ? 'botoes visiveis' : 'apenas swipe'}`
    this.shell.swipeButton.textContent = `Swipe: ${this.formatSwipePreset(state.userSettings.swipePreset)}`
    this.shell.actionButton.textContent = isHub
      ? state.endingUnlocked && !state.endingCompleted
        ? 'Ver desfecho'
        : 'Partir para a estacao'
      : state.run?.canDepart
        ? 'Partir com o trem'
        : 'Retirada tatica'
  }

  private getRunStatusLabel(state: GameState): string {
    if (!state.run) {
      return 'Sem run ativa'
    }

    const merchant = state.run.merchant?.active ? `mercador ${state.run.merchant.arrivalTime}` : 'sem mercador'
    const departure = state.run.canDepart ? 'partida aberta' : 'linha ativa'
    return `${departure} | ${merchant}`
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

  private getRunProjectText(
    selectedWagon: GameState['wagonBlueprints'][number] | null,
    wagonUpgraded: boolean,
  ): string {
    if (!selectedWagon) {
      return 'sem modulo especial'
    }

    return wagonUpgraded ? selectedWagon.upgradeDescription : `${selectedWagon.name} em forma basica`
  }

  private getBuildButtonLabel(
    selectedWagon: GameState['wagonBlueprints'][number] | null,
    wagonBuilt: boolean,
    wagonUpgraded: boolean,
    masteryUnlocked: boolean,
  ): string {
    if (!selectedWagon) {
      return 'Montar vagao'
    }

    if (!wagonBuilt) {
      return `Montar ${selectedWagon.name}`
    }

    if (wagonUpgraded) {
      return `${selectedWagon.upgradeName} ativo`
    }

    return masteryUnlocked ? `Evoluir ${selectedWagon.name}` : 'Maestria para evoluir'
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
