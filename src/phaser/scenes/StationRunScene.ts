import Phaser from 'phaser'
import type { InputController } from '../../game/input/InputController'
import type { GameStore } from '../../game/simulation/core/createGameStore'
import type {
  BuildNodeState,
  ClockPhase,
  EnemyUnitState,
  RecruitNodeState,
  ResourceNodeState,
  RunState,
} from '../../game/simulation/core/types'
import { drawCatSilhouette, drawDogSilhouette, drawHumanSilhouette } from '../render/drawSilhouettes'
import { STATION_RUN_SCENE_KEY } from '../sceneKeys'

export class StationRunScene extends Phaser.Scene {
  private worldGraphics!: Phaser.GameObjects.Graphics
  private atmosphereGraphics!: Phaser.GameObjects.Graphics
  private fxGraphics!: Phaser.GameObjects.Graphics
  private player!: Phaser.GameObjects.Ellipse
  private dust!: Phaser.GameObjects.Graphics

  constructor(
    private readonly store: GameStore,
    private readonly inputController: InputController,
  ) {
    super(STATION_RUN_SCENE_KEY)
  }

  create(): void {
    this.worldGraphics = this.add.graphics()
    this.atmosphereGraphics = this.add.graphics()
    this.fxGraphics = this.add.graphics()
    this.dust = this.add.graphics()
    this.player = this.add.ellipse(0, 0, 34, 24, 0xf2c078)

    const run = this.store.getState().run

    if (!run) {
      return
    }

    this.cameras.main.setBounds(0, 0, run.worldWidth, this.scale.height)
    this.player.setOrigin(0.5, 0.5)
    this.player.setAlpha(0)
    this.scale.on('resize', this.handleResize, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)
    this.handleResize()
    this.renderRun(run)
  }

  update(_: number, delta: number): void {
    const state = this.store.getState()
    const run = state.run

    if (!run) {
      return
    }

    if (this.store.hasBlockingOverlay()) {
      this.renderRun(run)
      return
    }

    const deltaSeconds = delta / 1000

    if (this.inputController.isActive('move_left')) {
      this.store.moveLeader(-1, deltaSeconds)
    }

    if (this.inputController.isActive('move_right')) {
      this.store.moveLeader(1, deltaSeconds)
    }

    if (this.inputController.consume('interact') || this.inputController.consume('confirm')) {
      this.store.tryInteract()
    }

    if (this.inputController.consume('leader_skill')) {
      this.store.useLeaderSkill()
    }

    if (this.inputController.consume('crew_command')) {
      this.store.cycleCrewRole()
    }

    if (this.inputController.consume('pause')) {
      this.store.returnToHub('A sirene do trem pediu retirada imediata.')
      return
    }

    this.store.advanceRun(deltaSeconds)
    this.renderRun(this.store.getState().run!)
  }

  private handleResize(): void {
    if (this.cameras?.main) {
      this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height)
    }
  }

  private handleShutdown(): void {
    this.scale.off('resize', this.handleResize, this)
  }

  private renderRun(run: RunState): void {
    const horizonY = this.scale.height - 170
    const groundY = this.scale.height - 114
    const reducedMotion = this.store.getState().userSettings.reducedMotion
    const phaseColor = this.resolvePhaseColor(run.clock.phase, run.routeId)
    const pulse = reducedMotion ? 0 : Math.sin(this.time.now * 0.0036) * 0.04

    this.cameras.main.setBackgroundColor(phaseColor)
    this.cameras.main.centerOn(run.playerX, this.scale.height * 0.5)

    this.worldGraphics.clear()
    this.atmosphereGraphics.clear()
    this.fxGraphics.clear()
    this.drawSkyLayers(run, horizonY)
    this.drawGround(run, horizonY, groundY)
    this.drawTrain(run, groundY, reducedMotion)
    this.drawBiomeBackdrop(run, horizonY, groundY)

    for (const resourceNode of run.resourceNodes) {
      this.drawResourceNode(resourceNode, groundY)
    }

    for (const recruitNode of run.recruitNodes) {
      this.drawRecruitNode(recruitNode, groundY)
    }

    for (const node of run.buildNodes) {
      this.drawNode(node, groundY, reducedMotion)
    }

    this.drawMerchant(run, groundY, pulse)
    this.drawCrew(run, groundY)

    for (const enemy of run.enemies) {
      this.drawEnemy(enemy, groundY)
    }

    this.drawTrainIntegrity(run, groundY)
    this.drawAtmosphere(run, groundY, reducedMotion)
    this.drawSceneLighting(run, groundY, reducedMotion)

    this.player.setPosition(run.playerX, groundY - 18)
    drawCatSilhouette(this.worldGraphics, {
      x: run.playerX,
      y: groundY - 8,
      color: 0xf1d9b6,
      scale: 1.02,
      facing: this.inputController.isActive('move_left') ? -1 : 1,
      accentColor: 0xf8f0dd,
      accentAlpha: 0.66,
      bob: reducedMotion ? 0 : Math.sin(this.time.now * 0.005) * 1.2,
      stretch: reducedMotion ? 1 : 1 + Math.sin(this.time.now * 0.004) * 0.02,
      tailLift: 0.34,
      headLift: 0.16,
      role: 'leader',
    })

    this.dust.clear()
    if (!reducedMotion) {
      this.dust.fillStyle(0xffffff, 0.12)
      this.dust.fillCircle(run.playerX - 18, groundY - 2, 4)
      this.dust.fillCircle(run.playerX + 14, groundY + 3, 3)
    }
  }

  private drawSkyLayers(run: RunState, horizonY: number): void {
    const g = this.worldGraphics
    const width = run.worldWidth
    const glowColor =
      run.routeId === 'quiet-platform'
        ? 0xe0b776
        : run.routeId === 'flooded-crossing'
          ? 0xd1e6ef
          : run.routeId === 'kennel-edge'
            ? 0xc88772
            : 0xd49a73
    const cloudColor =
      run.routeId === 'freight-yard'
        ? 0x7f736c
        : run.routeId === 'flooded-crossing'
          ? 0x8bb0bc
          : run.routeId === 'kennel-edge'
            ? 0x6c5a58
            : 0x6c8b99
    const midBandColor =
      run.routeId === 'freight-yard'
        ? 0x433f40
        : run.routeId === 'flooded-crossing'
          ? 0x355f6f
          : run.routeId === 'kennel-edge'
            ? 0x3c2d32
            : 0x2e434f

    g.fillGradientStyle(this.resolvePhaseColor('day', run.routeId), this.resolvePhaseColor('day', run.routeId), this.resolvePhaseColor(run.clock.phase, run.routeId), this.resolvePhaseColor(run.clock.phase, run.routeId), 1)
    g.fillRect(0, 0, width, this.scale.height)

    g.fillStyle(glowColor, run.clock.phase === 'night' ? 0.06 : 0.14)
    g.fillEllipse(width * 0.62, 118, 480, 180)
    g.fillStyle(cloudColor, 0.16)
    g.fillEllipse(320, 186, 360, 94)
    g.fillEllipse(920, 214, 540, 114)
    g.fillEllipse(1640, 178, 420, 100)
    g.fillEllipse(2280, 198, 380, 92)

    g.fillStyle(midBandColor, 0.28)
    g.fillRect(0, horizonY - 144, width, 84)
    g.fillStyle(0x1c2c35, 0.44)
    g.fillRect(0, horizonY - 80, width, 62)

    if (run.routeId === 'quiet-platform') {
      this.drawQuietPlatformSkyline(horizonY)
    }
  }

  private drawQuietPlatformSkyline(horizonY: number): void {
    const g = this.worldGraphics
    const sheds = [160, 450, 760, 1040, 1480, 1880, 2240]

    g.fillStyle(0x23343d, 0.78)
    for (const x of sheds) {
      g.fillRect(x, horizonY - 74, 128, 74)
      g.fillTriangle(x - 14, horizonY - 74, x + 64, horizonY - 112, x + 142, horizonY - 74)
      g.fillStyle(0xd9a35f, 0.06)
      g.fillRect(x + 26, horizonY - 50, 18, 24)
      g.fillRect(x + 80, horizonY - 50, 18, 24)
      g.fillStyle(0x23343d, 0.78)
    }

    g.lineStyle(2, 0x72828a, 0.18)
    for (let x = 120; x <= 2460; x += 210) {
      g.strokeLineShape(new Phaser.Geom.Line(x, horizonY - 152, x, horizonY - 42))
      g.strokeLineShape(new Phaser.Geom.Line(x, horizonY - 132, x + 90, horizonY - 114))
    }
  }

  private drawGround(run: RunState, horizonY: number, groundY: number): void {
    const g = this.worldGraphics
    const width = run.worldWidth
    const platformColor =
      run.routeId === 'freight-yard'
        ? 0x5e5954
        : run.routeId === 'flooded-crossing'
          ? 0x4a6973
          : run.routeId === 'kennel-edge'
            ? 0x5d4d4c
            : 0x435b63
    const ballastColor =
      run.routeId === 'freight-yard'
        ? 0x2a2828
        : run.routeId === 'flooded-crossing'
          ? 0x17303b
          : run.routeId === 'kennel-edge'
            ? 0x231a1c
            : 0x1a2b34
    const bedColor =
      run.routeId === 'freight-yard'
        ? 0x3a3634
        : run.routeId === 'flooded-crossing'
          ? 0x234552
          : run.routeId === 'kennel-edge'
            ? 0x372a2c
            : 0x243640
    const sleeperColor =
      run.routeId === 'freight-yard'
        ? 0x7d644a
        : run.routeId === 'flooded-crossing'
          ? 0x6d6558
          : run.routeId === 'kennel-edge'
            ? 0x735447
            : 0x705a44
    const railColor =
      run.routeId === 'freight-yard'
        ? 0xc6b39c
        : run.routeId === 'flooded-crossing'
          ? 0xb8cad0
          : run.routeId === 'kennel-edge'
            ? 0xc7a98e
            : 0xd1b188

    g.fillStyle(platformColor, 1)
    g.fillRect(0, horizonY - 42, width, 42)
    g.fillStyle(ballastColor, 1)
    g.fillRect(0, groundY, width, 180)
    g.fillStyle(bedColor, 0.72)
    g.fillRect(0, groundY - 24, width, 34)

    g.fillStyle(sleeperColor, 0.95)
    for (let x = 0; x < width; x += 44) {
      g.fillRect(x + 6, groundY + 18, 24, 6)
    }

    g.lineStyle(4, railColor, 0.6)
    g.strokeLineShape(new Phaser.Geom.Line(0, groundY + 20, width, groundY + 20))
    g.strokeLineShape(new Phaser.Geom.Line(0, groundY + 34, width, groundY + 34))

    if (run.routeId === 'flooded-crossing') {
      g.fillStyle(0x9bc2cf, 0.12)
      g.fillRect(0, groundY - 8, width, 10)
      g.fillRect(0, groundY + 10, width, 4)
    }
  }

  private drawTrain(run: RunState, groundY: number, reducedMotion: boolean): void {
    const g = this.worldGraphics
    const bodyX = run.trainX - 232
    const bodyY = groundY - 110
    const bodyWidth = 464
    const bodyHeight = 90
    const flicker = reducedMotion ? 0.94 : 0.86 + Math.sin(this.time.now * 0.0048) * 0.08

    g.fillStyle(0x52382d, 1)
    g.fillRoundedRect(bodyX, bodyY, bodyWidth, bodyHeight, 18)
    g.fillStyle(0x32272a, 1)
    g.fillRoundedRect(bodyX + 12, bodyY + 12, bodyWidth - 24, bodyHeight - 22, 14)
    g.fillStyle(0x8f6843, 1)
    g.fillTriangle(bodyX + 16, bodyY + 4, bodyX + 92, bodyY - 26, bodyX + 168, bodyY + 4)
    g.fillRect(bodyX + 160, bodyY - 16, 138, 20)
    g.fillTriangle(bodyX + 292, bodyY + 4, bodyX + 356, bodyY - 22, bodyX + 424, bodyY + 4)

    const windowXs = [bodyX + 60, bodyX + 166, bodyX + 318]
    for (const x of windowXs) {
      g.fillStyle(0x10181d, 1)
      g.fillRoundedRect(x, bodyY + 20, 46, 30, 8)
      g.fillStyle(0xd9a35f, 0.16 + flicker * 0.14)
      g.fillRoundedRect(x + 4, bodyY + 24, 38, 22, 6)
    }

    g.fillStyle(0x25333b, 1)
    g.fillRoundedRect(bodyX + 222, bodyY + 10, 76, 66, 12)

    const wheelXs = [bodyX + 56, bodyX + 170, bodyX + 298, bodyX + 410]
    for (const x of wheelXs) {
      g.fillStyle(0x182229, 1)
      g.fillCircle(x, groundY + 8, 20)
      g.fillStyle(0x44525a, 0.72)
      g.fillCircle(x, groundY + 8, 8)
    }

    g.fillStyle(0x223038, 1)
    g.fillRect(bodyX + 22, groundY - 12, bodyWidth - 44, 14)
    g.fillStyle(0x6c8b99, 0.32)
    g.fillRect(bodyX + 42, groundY - 12, bodyWidth - 84, 3)

    g.fillStyle(0x28353d, 1)
    g.fillRect(bodyX + 18, bodyY - 54, 16, 38)
    g.fillStyle(0xc8d0d4, 0.14)
    g.fillEllipse(bodyX + 30, bodyY - 66 - (reducedMotion ? 0 : Math.sin(this.time.now * 0.0016) * 5), 36, 18)
  }

  private drawNode(node: BuildNodeState, groundY: number, reducedMotion: boolean): void {
    const g = this.worldGraphics
    const pulse = reducedMotion ? 0 : Math.sin(this.time.now * 0.004 + node.x * 0.002) * 0.03

    if (node.kind === 'light') {
      const postHeight = 44 + node.tier * 20
      g.fillStyle(0x2d363b, 1)
      g.fillRect(node.x - 5, groundY - postHeight, 10, postHeight)
      g.fillStyle(0x394650, 1)
      g.fillRect(node.x - 12, groundY - postHeight - 12, 24, 8)
      g.fillStyle(0x10181d, 1)
      g.fillRoundedRect(node.x - 14, groundY - postHeight - 24, 28, 16, 6)
      if (node.tier > 0) {
        g.fillStyle(0xf2c078, 0.18 + node.tier * 0.08 + pulse)
        g.fillCircle(node.x, groundY - postHeight - 16, 28 + node.tier * 8)
        g.fillStyle(0xf8ddb0, 0.1 + node.tier * 0.06)
        g.fillEllipse(node.x, groundY - 2, 90 + node.tier * 16, 18 + node.tier * 5)
      }
      return
    }

    if (node.kind === 'defense') {
      const height = 26 + node.tier * 12
      g.fillStyle(0x6f5440, 1)
      g.fillRoundedRect(node.x - 28, groundY - height, 56, height, 8)
      g.fillStyle(0x3d464c, 1)
      g.fillRect(node.x - 32, groundY - height - 8, 64, 8)
      if (node.tier > 0) {
        g.fillStyle(0xc8d4c6, 0.46)
        g.fillRect(node.x - 18, groundY - height + 8, 36, 4)
      }
      return
    }

    if (node.kind === 'support') {
      const width = 52 + node.tier * 8
      g.fillStyle(0x4a5e65, 1)
      g.fillRect(node.x - width / 2, groundY - 44, width, 10)
      g.fillStyle(0x6d8c7d, 1)
      g.fillTriangle(node.x - width / 2, groundY - 44, node.x, groundY - 72 - node.tier * 6, node.x + width / 2, groundY - 44)
      g.fillStyle(0x1d262b, 0.9)
      g.fillRect(node.x - 16, groundY - 34, 32, 24)
      return
    }

    const width = 50 + node.tier * 6
    g.fillStyle(0x6a4f38, 1)
    g.fillRoundedRect(node.x - width / 2, groundY - 36, width, 28, 8)
    g.fillStyle(0x8d6d56, 1)
    g.fillRect(node.x - width / 2 + 8, groundY - 28, width - 16, 4)
    if (node.tier > 0) {
      g.fillStyle(0x95c4a5, 0.22)
      g.fillEllipse(node.x, groundY - 24, width + 26, 30)
    }
  }

  private drawResourceNode(node: ResourceNodeState, groundY: number): void {
    if (node.collected) {
      return
    }

    const g = this.worldGraphics

    if (node.kind === 'scrap') {
      g.fillStyle(0x6a7880, 1)
      g.fillRect(node.x - 20, groundY - 24, 14, 10)
      g.fillRect(node.x - 6, groundY - 28, 12, 14)
      g.fillRect(node.x + 6, groundY - 22, 16, 8)
      g.fillStyle(0xc2a88a, 0.2)
      g.fillEllipse(node.x, groundY - 16, 58, 18)
      return
    }

    if (node.kind === 'cloth') {
      g.fillStyle(0xc89fae, 1)
      g.fillRoundedRect(node.x - 20, groundY - 24, 40, 16, 8)
      g.fillStyle(0xf8f0dd, 0.26)
      g.fillRect(node.x - 2, groundY - 24, 4, 16)
      return
    }

    if (node.kind === 'food') {
      g.fillStyle(0x7d5d3f, 1)
      g.fillRoundedRect(node.x - 22, groundY - 24, 44, 18, 8)
      g.fillStyle(0x99c57d, 1)
      g.fillCircle(node.x - 10, groundY - 18, 4)
      g.fillCircle(node.x, groundY - 20, 5)
      g.fillCircle(node.x + 10, groundY - 18, 4)
      return
    }

    g.fillStyle(0x3e5965, 1)
    g.fillRoundedRect(node.x - 16, groundY - 30, 32, 24, 6)
    g.fillStyle(0xe5c77f, 0.2)
    g.fillEllipse(node.x, groundY - 16, 42, 20)
  }

  private drawRecruitNode(node: RecruitNodeState, groundY: number): void {
    if (node.recruited) {
      return
    }

    this.worldGraphics.fillStyle(0x0f171d, 0.72)
    this.worldGraphics.fillRoundedRect(node.x - 20, groundY - 26, 40, 18, 6)
    drawCatSilhouette(this.worldGraphics, {
      x: node.x,
      y: groundY - 2,
      color: 0xd8c5ae,
      scale: 0.76,
      facing: -1,
      glowAlpha: 0.08,
      accentColor: 0xf8f0dd,
      accentAlpha: 0.22,
      bob: Math.sin(this.time.now * 0.006 + node.x * 0.001) * 0.8,
      stretch: 1.02,
      tailLift: 0.18,
      headLift: 0.1,
      role: 'kitten',
    })
  }

  private drawEnemy(enemy: EnemyUnitState, groundY: number): void {
    const facing = enemy.lane === 'west' ? 1 : -1
    this.worldGraphics.fillStyle(0xd9745a, enemy.kind === 'lanternist' ? 0.06 : 0.03)
    this.worldGraphics.fillEllipse(enemy.x, groundY - 10, 44, 24)

    if (enemy.kind === 'tracker_dog' || enemy.kind === 'rush_dog') {
      drawDogSilhouette(this.worldGraphics, {
        x: enemy.x,
        y: groundY - 2,
        color: enemy.kind === 'tracker_dog' ? 0x8c939d : 0x9ba4aa,
        scale: enemy.kind === 'tracker_dog' ? 0.94 : 1.08,
        facing,
        role: enemy.kind === 'tracker_dog' ? 'tracker' : 'rush',
      })
      return
    }

    drawHumanSilhouette(this.worldGraphics, {
      x: enemy.x,
      y: groundY - 2,
      color:
        enemy.kind === 'captor'
          ? 0xc77b67
          : enemy.kind === 'lanternist'
            ? 0x8e785e
            : enemy.kind === 'saboteur'
              ? 0xb97777
              : 0xa88563,
      scale: enemy.kind === 'handler' ? 1.08 : 1,
      facing,
      toolColor: enemy.kind === 'lanternist' ? 0xf2c078 : 0xd8d2c8,
      role:
        enemy.kind === 'captor'
          ? 'captor'
          : enemy.kind === 'lanternist'
            ? 'lanternist'
            : enemy.kind === 'saboteur'
              ? 'saboteur'
              : 'handler',
    })
  }

  private drawMerchant(run: RunState, groundY: number, pulse: number): void {
    if (!run.merchant?.active) {
      return
    }

    const { x } = run.merchant
    const g = this.worldGraphics

    g.fillStyle(0x6a4f38, 1)
    g.fillRoundedRect(x - 34, groundY - 44, 68, 44, 10)
    g.fillStyle(0xc98b4d, 1)
    g.fillTriangle(x - 42, groundY - 44, x, groundY - 76, x + 42, groundY - 44)
    g.fillStyle(0xf2c078, 0.16 + pulse)
    g.fillCircle(x, groundY - 62, 42)
    g.fillStyle(0x8d6d56, 1)
    g.fillRect(x - 24, groundY - 22, 48, 4)
    drawCatSilhouette(this.worldGraphics, {
      x,
      y: groundY - 8,
      color: 0xf1d9b6,
      scale: 0.9,
      facing: 1,
      accentColor: 0xd9a35f,
      accentAlpha: 0.8,
      bob: Math.sin(this.time.now * 0.005) * 1.1,
      stretch: 1.02,
      tailLift: 0.3,
      headLift: 0.12,
      role: 'crew',
    })
  }

  private drawCrew(run: RunState, groundY: number): void {
    run.recruitedCats.forEach((cat, index) => {
      const x = run.trainX - 92 + index * 34
      const y = groundY - 86 - (index % 2) * 10
      const selected = run.selectedRecruitIndex % Math.max(run.recruitedCats.length, 1) === index

      drawCatSilhouette(this.worldGraphics, {
        x,
        y: y + 6,
        color: cat.color,
        scale: selected ? 0.82 : 0.74,
        facing: index % 2 === 0 ? -1 : 1,
        glowAlpha: selected ? 0.1 : 0.04,
        accentColor: 0xf8f0dd,
        accentAlpha: selected ? 0.32 : 0.18,
        bob: Math.sin(this.time.now * 0.005 + index) * 0.9,
        stretch: 1.01,
        tailLift: 0.2,
        headLift: 0.1,
        role: 'crew',
      })
    })
  }

  private drawTrainIntegrity(run: RunState, groundY: number): void {
    const g = this.worldGraphics
    const width = 196
    const x = run.trainX - width / 2
    const y = groundY - 132
    const ratio = Math.max(0, run.trainIntegrity / run.maxTrainIntegrity)
    const barColor = ratio > 0.5 ? 0x95c4a5 : ratio > 0.25 ? 0xf2c078 : 0xdd7b6a

    g.fillStyle(0x0b1319, 0.78)
    g.fillRoundedRect(x, y, width, 28, 10)
    g.fillStyle(0xd4c1a1, 0.16)
    g.fillRoundedRect(x + 2, y + 2, width - 4, 10, 8)
    g.fillStyle(barColor, 0.94)
    g.fillRoundedRect(x + 6, y + 5, (width - 12) * ratio, 8, 6)
    g.fillStyle(0xf3e6ce, 0.8)
    g.fillRect(x + width / 2 - 30, y + 16, 60, 3)
  }

  private drawBiomeBackdrop(run: RunState, horizonY: number, groundY: number): void {
    if (run.routeId === 'freight-yard') {
      this.drawFreightYardBackdrop(horizonY)
    } else if (run.routeId === 'flooded-crossing') {
      this.drawFloodedCrossingBackdrop(horizonY, groundY, run.worldWidth)
    } else if (run.routeId === 'kennel-edge') {
      this.drawKennelEdgeBackdrop(horizonY)
    }
  }

  private drawAtmosphere(run: RunState, groundY: number, reducedMotion: boolean): void {
    const drift = reducedMotion ? 0 : Math.sin(this.time.now * 0.0018) * 16
    const mistColor =
      run.routeId === 'freight-yard'
        ? 0xd1b6a0
        : run.routeId === 'flooded-crossing'
          ? 0xc3ecf0
          : run.routeId === 'kennel-edge'
            ? 0xd89d84
            : 0xc3ccd1

    this.atmosphereGraphics.fillStyle(mistColor, run.routeId === 'kennel-edge' ? 0.06 : 0.08)
    this.atmosphereGraphics.fillEllipse(320 + drift, groundY - 24, 360, 40)
    this.atmosphereGraphics.fillEllipse(run.trainX + 120 - drift * 0.4, groundY - 18, 440, 48)
    this.atmosphereGraphics.fillEllipse(2240 + drift * 0.3, groundY - 20, 380, 42)
  }

  private drawSceneLighting(run: RunState, groundY: number, reducedMotion: boolean): void {
    const g = this.fxGraphics
    const width = run.worldWidth
    const phase = run.clock.phase
    const isNight = phase === 'night'
    const isDusk = phase === 'dusk'
    const pulse = reducedMotion ? 0 : Math.sin(this.time.now * 0.0048) * 0.03
    const lightAlpha = isNight ? 0.18 + pulse : isDusk ? 0.1 + pulse * 0.6 : 0.04
    const edgeAlpha = isNight ? 0.2 : isDusk ? 0.12 : 0.04

    g.fillStyle(0x081015, edgeAlpha)
    g.fillRect(0, 0, width, 28)
    g.fillRect(0, this.scale.height - 28, width, 28)
    g.fillRect(0, 0, 30, this.scale.height)
    g.fillRect(width - 30, 0, 30, this.scale.height)

    g.fillStyle(0xf2c078, lightAlpha)
    g.fillEllipse(run.trainX, groundY - 28, 360, 110)
    g.fillStyle(0xf8ddb0, lightAlpha * 0.55)
    g.fillEllipse(run.trainX, groundY + 4, 280, 34)

    for (const node of run.buildNodes) {
      if (node.kind === 'light' && node.tier > 0) {
        g.fillStyle(0xf2c078, 0.1 + node.tier * 0.05 + pulse)
        g.fillEllipse(node.x, groundY - 12, 140 + node.tier * 28, 28 + node.tier * 6)
      }
    }

    if (run.merchant?.active) {
      g.fillStyle(0xf2c078, 0.12 + pulse)
      g.fillEllipse(run.merchant.x, groundY - 18, 130, 42)
    }

    for (const enemy of run.enemies) {
      if (enemy.kind === 'lanternist') {
        g.fillStyle(0xe8b46c, isNight ? 0.12 : 0.06)
        g.fillEllipse(enemy.x + (enemy.lane === 'west' ? 14 : -14), groundY - 14, 74, 28)
      }
    }

    if (isNight) {
      g.fillStyle(0x0a1218, 0.14)
      g.fillRect(0, groundY - 150, width, 150)
    }
  }

  private drawFreightYardBackdrop(horizonY: number): void {
    const g = this.worldGraphics

    g.fillStyle(0x373332, 0.96)
    g.fillRect(360, horizonY - 84, 144, 84)
    g.fillRect(1780, horizonY - 112, 168, 112)
    g.fillStyle(0x4b413d, 1)
    g.fillRect(570, horizonY - 92, 110, 92)
    g.fillRect(706, horizonY - 66, 92, 66)
    g.fillRect(1936, horizonY - 76, 110, 76)
    g.fillStyle(0x9d5a41, 0.22)
    g.fillRect(360, horizonY - 18, 520, 14)
    g.fillRect(1780, horizonY - 18, 300, 14)
    g.lineStyle(4, 0x65727a, 0.45)
    g.strokeLineShape(new Phaser.Geom.Line(492, horizonY - 112, 634, horizonY - 184))
    g.strokeLineShape(new Phaser.Geom.Line(1860, horizonY - 132, 1998, horizonY - 190))
    g.lineStyle(2, 0xc98b4d, 0.28)
    g.strokeLineShape(new Phaser.Geom.Line(570, horizonY - 54, 798, horizonY - 54))
  }

  private drawFloodedCrossingBackdrop(horizonY: number, groundY: number, width: number): void {
    const g = this.worldGraphics

    g.fillStyle(0x426b75, 0.42)
    g.fillRect(0, horizonY - 26, width, 26)
    g.fillStyle(0x2f4f5c, 0.95)
    g.fillRect(240, horizonY - 62, 140, 62)
    g.fillRect(920, horizonY - 54, 120, 54)
    g.fillRect(1820, horizonY - 72, 160, 72)
    g.fillStyle(0x715f4b, 1)
    for (let x = 80; x < width; x += 240) {
      g.fillRect(x, groundY - 16, 74, 8)
      g.fillRect(x + 98, groundY - 12, 54, 8)
    }
    g.fillStyle(0xc8e7f0, 0.12)
    g.fillRect(0, groundY - 10, width, 6)
    g.fillRect(0, groundY + 2, width, 4)
  }

  private drawKennelEdgeBackdrop(horizonY: number): void {
    const g = this.worldGraphics

    g.fillStyle(0x4a3f3c, 1)
    for (let x = 180; x <= 2280; x += 42) {
      g.fillRect(x, horizonY - 94, 14, 94)
    }
    g.lineStyle(2, 0xa26c5e, 0.5)
    g.strokeLineShape(new Phaser.Geom.Line(140, horizonY - 62, 2360, horizonY - 62))
    g.strokeLineShape(new Phaser.Geom.Line(140, horizonY - 26, 2360, horizonY - 26))
    g.fillStyle(0xd9745a, 0.18)
    g.fillCircle(420, horizonY - 118, 26)
    g.fillCircle(1200, horizonY - 118, 26)
    g.fillCircle(1990, horizonY - 118, 26)
    g.fillStyle(0x2f2729, 0.95)
    g.fillRect(620, horizonY - 86, 120, 86)
    g.fillRect(1460, horizonY - 86, 120, 86)
  }

  private resolvePhaseColor(phase: ClockPhase, routeId: RunState['routeId']): number {
    const palettes = {
      'quiet-platform': { dawn: 0x4e6776, day: 0x7a98a8, dusk: 0x5a5166, night: 0x18222b },
      'freight-yard': { dawn: 0x525b65, day: 0x747d84, dusk: 0x5a4d50, night: 0x1d2329 },
      'flooded-crossing': { dawn: 0x416977, day: 0x5d95a4, dusk: 0x49607b, night: 0x152734 },
      'kennel-edge': { dawn: 0x5f5350, day: 0x7a6b65, dusk: 0x5d4340, night: 0x211717 },
    } as const
    const palette = palettes[routeId]

    if (phase === 'dawn') {
      return palette.dawn
    }

    if (phase === 'day') {
      return palette.day
    }

    if (phase === 'dusk') {
      return palette.dusk
    }

    return palette.night
  }
}
