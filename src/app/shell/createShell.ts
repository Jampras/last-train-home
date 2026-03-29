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
  promptTags: HTMLDivElement
  eventBanner: HTMLDivElement
  eventTitle: HTMLDivElement
  eventBody: HTMLDivElement
  summaryPanel: HTMLDivElement
  summaryEyebrow: HTMLDivElement
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
  helpPanel: HTMLDivElement
  helpTitle: HTMLDivElement
  helpBody: HTMLDivElement
  closeHelpButton: HTMLButtonElement
  previousButton: HTMLButtonElement
  nextButton: HTMLButtonElement
  settingsButton: HTMLButtonElement
  helpButton: HTMLButtonElement
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
      <div class="orientation-shell">
        <div class="landscape-frame">
          <div class="hud-topbar">
            <div class="hud-top">
              <div id="clock-chip" class="hud-chip hud-chip--clock"></div>
              <div id="resource-chip" class="hud-chip hud-chip--resource"></div>
              <div id="status-chip" class="hud-chip hud-chip--status"></div>
            </div>

            <div id="event-banner" class="hud-event" hidden>
              <div id="event-title" class="hud-event__title"></div>
              <div id="event-body" class="hud-event__body"></div>
            </div>
          </div>

          <div class="playfield-shell">
            <div id="game-root" class="game-stage"></div>
          </div>

          <div class="hud-bottom">
            <div class="hud-bottom__content">
              <div id="info-panel" class="hud-panel"></div>

              <div id="prompt-panel" class="hud-prompt-panel" hidden>
                <div id="prompt-eyebrow" class="hud-prompt-panel__eyebrow"></div>
                <div id="prompt-title" class="hud-prompt-panel__title"></div>
                <div id="prompt-body" class="hud-prompt-panel__body"></div>
                <div id="prompt-tags" class="hud-prompt-tags"></div>
              </div>
            </div>

            <div class="hud-controls">
              <div class="hud-footer">
                <div class="hud-actions">
                  <button id="previous-button" type="button" class="hud-button hud-button--secondary">Lider -</button>
                  <button id="next-button" type="button" class="hud-button hud-button--secondary">Lider +</button>
                  <button id="settings-button" type="button" class="hud-button hud-button--secondary">Ajustes</button>
                  <button id="help-button" type="button" class="hud-button hud-button--secondary">Ajuda</button>
                  <button id="mode-button" type="button" class="hud-button hud-button--secondary">Modo</button>
                  <button id="route-button" type="button" class="hud-button hud-button--secondary">Rota</button>
                  <button id="build-button" type="button" class="hud-button hud-button--secondary">Projeto</button>
                  <button id="crew-button" type="button" class="hud-button hud-button--secondary">Equipe</button>
                  <button id="skill-button" type="button" class="hud-button hud-button--focus">Poder</button>
                  <button id="action-button" type="button" class="hud-button hud-button--primary">Partir</button>
                </div>
              </div>

              <div id="touch-overlay" class="touch-overlay" hidden>
                <div class="touch-overlay__left">
                  <button id="touch-left-button" type="button" class="touch-button touch-button--move">Esq</button>
                  <button id="touch-right-button" type="button" class="touch-button touch-button--move">Dir</button>
                </div>
                <div class="touch-overlay__right">
                  <button id="touch-interact-button" type="button" class="touch-button touch-button--act">Agir</button>
                  <button id="touch-skill-button" type="button" class="touch-button touch-button--skill">Poder</button>
                  <button id="touch-crew-button" type="button" class="touch-button touch-button--crew">Equipe</button>
                </div>
              </div>
            </div>
          </div>

          <div id="summary-panel" class="summary-panel" hidden>
            <div class="summary-panel__frame">
              <div id="summary-eyebrow" class="summary-panel__eyebrow"></div>
              <div id="summary-title" class="summary-panel__title"></div>
              <div id="summary-body" class="summary-panel__body"></div>
              <button id="dismiss-summary-button" type="button" class="hud-button">Fechar resumo</button>
            </div>
          </div>

          <div id="settings-panel" class="summary-panel" hidden>
            <div class="summary-panel__frame">
              <div class="summary-panel__eyebrow">Painel do trem</div>
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

          <div id="help-panel" class="summary-panel" hidden>
            <div class="summary-panel__frame">
              <div class="summary-panel__eyebrow">Ajuda de bordo</div>
              <div id="help-title" class="summary-panel__title">Como jogar</div>
              <div id="help-body" class="summary-panel__body"></div>
              <button id="close-help-button" type="button" class="hud-button">Fechar ajuda</button>
            </div>
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
    promptTags: mountNode.querySelector<HTMLDivElement>('#prompt-tags')!,
    eventBanner: mountNode.querySelector<HTMLDivElement>('#event-banner')!,
    eventTitle: mountNode.querySelector<HTMLDivElement>('#event-title')!,
    eventBody: mountNode.querySelector<HTMLDivElement>('#event-body')!,
    summaryPanel: mountNode.querySelector<HTMLDivElement>('#summary-panel')!,
    summaryEyebrow: mountNode.querySelector<HTMLDivElement>('#summary-eyebrow')!,
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
    helpPanel: mountNode.querySelector<HTMLDivElement>('#help-panel')!,
    helpTitle: mountNode.querySelector<HTMLDivElement>('#help-title')!,
    helpBody: mountNode.querySelector<HTMLDivElement>('#help-body')!,
    closeHelpButton: mountNode.querySelector<HTMLButtonElement>('#close-help-button')!,
    previousButton: mountNode.querySelector<HTMLButtonElement>('#previous-button')!,
    nextButton: mountNode.querySelector<HTMLButtonElement>('#next-button')!,
    settingsButton: mountNode.querySelector<HTMLButtonElement>('#settings-button')!,
    helpButton: mountNode.querySelector<HTMLButtonElement>('#help-button')!,
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
