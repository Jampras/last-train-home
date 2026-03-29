export interface ShellRefs {
  appShell: HTMLDivElement
  gameRoot: HTMLDivElement
  clockChip: HTMLDivElement
  resourceChip: HTMLDivElement
  statusChip: HTMLDivElement
  infoPanel: HTMLDivElement
  promptPanel: HTMLDivElement
  promptEyebrow: HTMLDivElement
  promptTitle: HTMLDivElement
  promptBody: HTMLDivElement
  eventBanner: HTMLDivElement
  eventTitle: HTMLDivElement
  eventBody: HTMLDivElement
  summaryPanel: HTMLDivElement
  summaryTitle: HTMLDivElement
  summaryBody: HTMLDivElement
  dismissSummaryButton: HTMLButtonElement
  settingsPanel: HTMLDivElement
  subtitlesButton: HTMLButtonElement
  audioButton: HTMLButtonElement
  motionButton: HTMLButtonElement
  touchButton: HTMLButtonElement
  swipeButton: HTMLButtonElement
  closeSettingsButton: HTMLButtonElement
  previousButton: HTMLButtonElement
  nextButton: HTMLButtonElement
  settingsButton: HTMLButtonElement
  modeButton: HTMLButtonElement
  routeButton: HTMLButtonElement
  buildButton: HTMLButtonElement
  crewButton: HTMLButtonElement
  skillButton: HTMLButtonElement
  actionButton: HTMLButtonElement
  touchOverlay: HTMLDivElement
  touchLeftButton: HTMLButtonElement
  touchRightButton: HTMLButtonElement
  touchInteractButton: HTMLButtonElement
  touchSkillButton: HTMLButtonElement
  touchCrewButton: HTMLButtonElement
}

export function createShell(mountNode: HTMLDivElement): ShellRefs {
  mountNode.innerHTML = `
    <div id="app-shell" class="app-shell" data-scene="hub">
      <div id="game-root" class="game-stage"></div>
      <div class="hud-layer">
        <div class="hud-top">
          <div id="clock-chip" class="hud-chip"></div>
          <div id="resource-chip" class="hud-chip"></div>
          <div id="status-chip" class="hud-chip"></div>
        </div>

        <div id="event-banner" class="hud-event" hidden>
          <div id="event-title" class="hud-event__title"></div>
          <div id="event-body" class="hud-event__body"></div>
        </div>

        <div id="prompt-panel" class="hud-prompt-panel" hidden>
          <div id="prompt-eyebrow" class="hud-prompt-panel__eyebrow"></div>
          <div id="prompt-title" class="hud-prompt-panel__title"></div>
          <div id="prompt-body" class="hud-prompt-panel__body"></div>
        </div>

        <div id="summary-panel" class="summary-panel" hidden>
          <div class="summary-panel__frame">
            <div id="summary-title" class="summary-panel__title"></div>
            <div id="summary-body" class="summary-panel__body"></div>
            <button id="dismiss-summary-button" type="button" class="hud-button">Fechar resumo</button>
          </div>
        </div>

        <div id="settings-panel" class="summary-panel" hidden>
          <div class="summary-panel__frame">
            <div class="summary-panel__title">Configuracoes</div>
            <div class="summary-panel__body">
              <p>Acessibilidade, toque e conforto visual para a versao web.</p>
            </div>
            <div class="hud-actions hud-actions--stack">
              <button id="subtitles-button" type="button" class="hud-button hud-button--secondary">Legendas</button>
              <button id="audio-button" type="button" class="hud-button hud-button--secondary">Audio</button>
              <button id="motion-button" type="button" class="hud-button hud-button--secondary">Movimento</button>
              <button id="touch-button" type="button" class="hud-button hud-button--secondary">Touch</button>
              <button id="swipe-button" type="button" class="hud-button hud-button--secondary">Swipe</button>
              <button id="close-settings-button" type="button" class="hud-button">Fechar ajustes</button>
            </div>
          </div>
        </div>

        <div class="hud-bottom">
          <div id="info-panel" class="hud-panel"></div>
          <div class="hud-footer">
            <div class="hud-actions">
              <button id="previous-button" type="button" class="hud-button hud-button--secondary">Anterior</button>
              <button id="next-button" type="button" class="hud-button hud-button--secondary">Proximo</button>
              <button id="settings-button" type="button" class="hud-button hud-button--secondary">Ajustes</button>
              <button id="mode-button" type="button" class="hud-button hud-button--secondary">Modo</button>
              <button id="route-button" type="button" class="hud-button hud-button--secondary">Rota</button>
              <button id="build-button" type="button" class="hud-button hud-button--secondary">Montar vagao</button>
              <button id="crew-button" type="button" class="hud-button hud-button--secondary">Comando</button>
              <button id="skill-button" type="button" class="hud-button">Habilidade</button>
              <button id="action-button" type="button" class="hud-button">Partir</button>
            </div>
          </div>
        </div>

        <div id="touch-overlay" class="touch-overlay" hidden>
          <div class="touch-overlay__left">
            <button id="touch-left-button" type="button" class="touch-button">Esq</button>
            <button id="touch-right-button" type="button" class="touch-button">Dir</button>
          </div>
          <div class="touch-overlay__right">
            <button id="touch-interact-button" type="button" class="touch-button">Interagir</button>
            <button id="touch-skill-button" type="button" class="touch-button">Habilidade</button>
            <button id="touch-crew-button" type="button" class="touch-button">Comando</button>
          </div>
        </div>
      </div>
    </div>
  `

  return {
    appShell: mountNode.querySelector<HTMLDivElement>('#app-shell')!,
    gameRoot: mountNode.querySelector<HTMLDivElement>('#game-root')!,
    clockChip: mountNode.querySelector<HTMLDivElement>('#clock-chip')!,
    resourceChip: mountNode.querySelector<HTMLDivElement>('#resource-chip')!,
    statusChip: mountNode.querySelector<HTMLDivElement>('#status-chip')!,
    infoPanel: mountNode.querySelector<HTMLDivElement>('#info-panel')!,
    promptPanel: mountNode.querySelector<HTMLDivElement>('#prompt-panel')!,
    promptEyebrow: mountNode.querySelector<HTMLDivElement>('#prompt-eyebrow')!,
    promptTitle: mountNode.querySelector<HTMLDivElement>('#prompt-title')!,
    promptBody: mountNode.querySelector<HTMLDivElement>('#prompt-body')!,
    eventBanner: mountNode.querySelector<HTMLDivElement>('#event-banner')!,
    eventTitle: mountNode.querySelector<HTMLDivElement>('#event-title')!,
    eventBody: mountNode.querySelector<HTMLDivElement>('#event-body')!,
    summaryPanel: mountNode.querySelector<HTMLDivElement>('#summary-panel')!,
    summaryTitle: mountNode.querySelector<HTMLDivElement>('#summary-title')!,
    summaryBody: mountNode.querySelector<HTMLDivElement>('#summary-body')!,
    dismissSummaryButton: mountNode.querySelector<HTMLButtonElement>('#dismiss-summary-button')!,
    settingsPanel: mountNode.querySelector<HTMLDivElement>('#settings-panel')!,
    subtitlesButton: mountNode.querySelector<HTMLButtonElement>('#subtitles-button')!,
    audioButton: mountNode.querySelector<HTMLButtonElement>('#audio-button')!,
    motionButton: mountNode.querySelector<HTMLButtonElement>('#motion-button')!,
    touchButton: mountNode.querySelector<HTMLButtonElement>('#touch-button')!,
    swipeButton: mountNode.querySelector<HTMLButtonElement>('#swipe-button')!,
    closeSettingsButton: mountNode.querySelector<HTMLButtonElement>('#close-settings-button')!,
    previousButton: mountNode.querySelector<HTMLButtonElement>('#previous-button')!,
    nextButton: mountNode.querySelector<HTMLButtonElement>('#next-button')!,
    settingsButton: mountNode.querySelector<HTMLButtonElement>('#settings-button')!,
    modeButton: mountNode.querySelector<HTMLButtonElement>('#mode-button')!,
    routeButton: mountNode.querySelector<HTMLButtonElement>('#route-button')!,
    buildButton: mountNode.querySelector<HTMLButtonElement>('#build-button')!,
    crewButton: mountNode.querySelector<HTMLButtonElement>('#crew-button')!,
    skillButton: mountNode.querySelector<HTMLButtonElement>('#skill-button')!,
    actionButton: mountNode.querySelector<HTMLButtonElement>('#action-button')!,
    touchOverlay: mountNode.querySelector<HTMLDivElement>('#touch-overlay')!,
    touchLeftButton: mountNode.querySelector<HTMLButtonElement>('#touch-left-button')!,
    touchRightButton: mountNode.querySelector<HTMLButtonElement>('#touch-right-button')!,
    touchInteractButton: mountNode.querySelector<HTMLButtonElement>('#touch-interact-button')!,
    touchSkillButton: mountNode.querySelector<HTMLButtonElement>('#touch-skill-button')!,
    touchCrewButton: mountNode.querySelector<HTMLButtonElement>('#touch-crew-button')!,
  }
}
