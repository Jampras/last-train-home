import Phaser from 'phaser'
import type { SceneId } from '../../game/simulation/core/types'
import { PROLOGUE_SCENE_KEY, TRAIN_HUB_SCENE_KEY } from '../sceneKeys'

export class BootScene extends Phaser.Scene {
  constructor(private readonly initialScene: SceneId) {
    super('BootScene')
  }

  create(): void {
    this.scene.start(this.initialScene === 'prologue' ? PROLOGUE_SCENE_KEY : TRAIN_HUB_SCENE_KEY)
  }
}
