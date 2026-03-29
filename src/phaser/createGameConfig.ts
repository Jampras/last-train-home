import Phaser from 'phaser'
import type { InputController } from '../game/input/InputController'
import type { GameStore } from '../game/simulation/core/createGameStore'
import { BootScene } from './scenes/BootScene'
import { PrologueScene } from './scenes/PrologueScene'
import { StationRunScene } from './scenes/StationRunScene'
import { TrainHubScene } from './scenes/TrainHubScene'

export function createGameConfig(
  parent: HTMLElement,
  store: GameStore,
  inputController: InputController,
): Phaser.Types.Core.GameConfig {
  const width = Math.max(parent.clientWidth, 960)
  const height = Math.max(parent.clientHeight, 540)

  return {
    type: Phaser.CANVAS,
    parent,
    width,
    height,
    backgroundColor: '#132029',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: '100%',
      height: '100%',
    },
    scene: [
      new BootScene(store.getState().currentScene),
      new PrologueScene(store, inputController),
      new TrainHubScene(store, inputController),
      new StationRunScene(store, inputController),
    ],
    render: {
      antialias: true,
      roundPixels: false,
      pixelArt: false,
    },
  }
}
