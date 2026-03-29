import Phaser from 'phaser'
import { EventAudioController } from '../../audio/EventAudioController'
import { createShell } from '../shell/createShell'
import { InputController } from '../../game/input/InputController'
import { GameStore } from '../../game/simulation/core/createGameStore'
import { createGameConfig } from '../../phaser/createGameConfig'
import { PROLOGUE_SCENE_KEY, STATION_RUN_SCENE_KEY, TRAIN_HUB_SCENE_KEY } from '../../phaser/sceneKeys'
import { HudController } from '../../ui/hud/HudController'

export function startApp(mountNode: HTMLDivElement | null): void {
  if (!mountNode) {
    throw new Error('Application mount node not found.')
  }

  const shell = createShell(mountNode)
  const store = new GameStore()
  const inputController = new InputController()
  const hud = new HudController(shell, store, inputController)
  const eventAudio = new EventAudioController(store)
  inputController.bindKeyboard()
  inputController.bindTouch(shell.gameRoot)
  inputController.updateTouchPreset(store.getState().userSettings.swipePreset)
  let overlayBlocked = store.hasBlockingOverlay()

  const game = new Phaser.Game(createGameConfig(shell.gameRoot, store, inputController))
  const syncGameFrame = () => {
    const width = shell.gameRoot.clientWidth
    const height = shell.gameRoot.clientHeight

    if (width > 0 && height > 0) {
      game.scale.resize(width, height)
    }
  }
  const resizeObserver = new ResizeObserver(() => {
    syncGameFrame()
  })

  resizeObserver.observe(shell.gameRoot)
  window.addEventListener('resize', syncGameFrame)
  requestAnimationFrame(() => {
    syncGameFrame()
  })
  let activeScene =
    store.getState().currentScene === 'prologue'
      ? PROLOGUE_SCENE_KEY
      : store.getState().currentScene === 'run'
        ? STATION_RUN_SCENE_KEY
        : TRAIN_HUB_SCENE_KEY

  store.subscribe((state) => {
    inputController.updateTouchPreset(state.userSettings.swipePreset)
    document.body.classList.toggle('reduced-motion', state.userSettings.reducedMotion)
    hud.render(state)

     const nextOverlayBlocked = store.hasBlockingOverlay()

    if (nextOverlayBlocked && !overlayBlocked) {
      inputController.reset()
    }

    overlayBlocked = nextOverlayBlocked

    const targetScene =
      state.currentScene === 'prologue'
        ? PROLOGUE_SCENE_KEY
        : state.currentScene === 'run'
          ? STATION_RUN_SCENE_KEY
          : TRAIN_HUB_SCENE_KEY

    if (targetScene === activeScene) {
      return
    }

    activeScene = targetScene
    for (const sceneKey of [PROLOGUE_SCENE_KEY, TRAIN_HUB_SCENE_KEY, STATION_RUN_SCENE_KEY]) {
      if (sceneKey !== targetScene) {
        game.scene.stop(sceneKey)
      }
    }
    game.scene.start(targetScene)
  })

  if (import.meta.env.DEV) {
    ;(
      window as Window & {
        __LTH_DEBUG?: {
          store: GameStore
          game: Phaser.Game
          inputController: InputController
          eventAudio: EventAudioController
        }
      }
    ).__LTH_DEBUG = {
      store,
      game,
      inputController,
      eventAudio,
    }
  }

  window.addEventListener(
    'beforeunload',
    () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', syncGameFrame)
    },
    { once: true },
  )
}
