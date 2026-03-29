import Phaser from 'phaser'
import { getLeaderById } from '../../game/content/leaders'
import type { InputController } from '../../game/input/InputController'
import type { GameStore } from '../../game/simulation/core/createGameStore'
import { drawCatSilhouette } from '../render/drawSilhouettes'
import { TRAIN_HUB_SCENE_KEY } from '../sceneKeys'

export class TrainHubScene extends Phaser.Scene {
  private backdrop!: Phaser.GameObjects.Graphics
  private titleText!: Phaser.GameObjects.Text
  private subtitleText!: Phaser.GameObjects.Text
  private hintText!: Phaser.GameObjects.Text
  private routeLabels: Phaser.GameObjects.Text[] = []

  constructor(
    private readonly store: GameStore,
    private readonly inputController: InputController,
  ) {
    super(TRAIN_HUB_SCENE_KEY)
  }

  create(): void {
    this.backdrop = this.add.graphics()
    this.titleText = this.add.text(0, 0, '', {})
    this.subtitleText = this.add.text(0, 0, '', {})
    this.hintText = this.add.text(0, 0, '', {})

    this.titleText.setFontFamily('"Cormorant Garamond"')
    this.titleText.setFontSize(44)
    this.titleText.setColor('#fff1d9')
    this.titleText.setShadow(0, 4, '#000000', 14, false, true)

    this.subtitleText.setFontFamily('Manrope')
    this.subtitleText.setFontSize(15)
    this.subtitleText.setColor('#d4d9dd')
    this.subtitleText.setLineSpacing(4)

    this.hintText.setFontFamily('Manrope')
    this.hintText.setFontSize(14)
    this.hintText.setColor('#d5d7d7')
    this.hintText.setLineSpacing(6)

    for (let index = 0; index < 4; index += 1) {
      const label = this.add.text(0, 0, '', {})
      label.setFontFamily('Manrope')
      label.setFontSize(11)
      label.setColor('#d5d9dc')
      label.setAlpha(0.88)
      label.setOrigin(0.5, 0)
      this.routeLabels.push(label)
    }

    this.scale.on('resize', this.layout, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)
    this.layout()
  }

  update(): void {
    if (!this.scene.isActive() || !this.titleText?.scene) {
      return
    }

    this.store.tickUi(this.game.loop.delta / 1000)
    const state = this.store.getState()
    const leader = getLeaderById(state.selectedLeaderId)
    const currentRoute = state.routeNodes.find((route) => route.id === state.activeRouteId)
    const mastery = state.leaderMastery[state.selectedLeaderId]

    this.drawBackdrop(leader.accent)
    this.drawTrain(state.builtWagonIds.length, state.upgradedWagonIds.length, leader.accent)
    this.drawRouteMap(state.activeRouteId)
    this.drawLeaderPresence(leader.accent)

    this.titleText.setText('Trem-Santuario')
    this.subtitleText.setText(
      `${leader.name} | ${leader.signature}\n${currentRoute?.name ?? 'Sem rota marcada'} | ${mastery.unlocked ? 'maestria desperta' : `maestria ${mastery.points}/${mastery.requiredPoints}`}`,
    )
    this.hintText.setText(
      state.endingUnlocked && !state.endingCompleted
        ? 'O vagao lacrado ja pode ser encarado. O botao principal abre o desfecho da versao 1.'
        : 'Monte vagoes, troque a rota e parta quando a linha estiver pronta. O HUD agora carrega os detalhes; o trem carrega o clima.',
    )

    state.routeNodes.forEach((route, index) => {
      const label = this.routeLabels[index]

      if (!label?.scene) {
        return
      }

      label.setText(route.name)
      label.setVisible(true)
      label.setColor(
        route.id === state.activeRouteId
          ? '#f4d9a3'
          : route.status === 'cleared'
            ? '#b7d7bc'
            : route.status === 'locked'
              ? '#72818b'
              : '#d4d9dd',
      )
    })

    for (let index = state.routeNodes.length; index < this.routeLabels.length; index += 1) {
      if (this.routeLabels[index]?.scene) {
        this.routeLabels[index].setVisible(false)
      }
    }

    if (this.store.hasBlockingOverlay()) {
      return
    }

    if (this.inputController.consume('confirm') || this.inputController.consume('interact')) {
      this.store.startRun()
    }
  }

  private layout(): void {
    const { width, height } = this.scale
    const routeStartX = width - 362
    const spacing = 92

    this.titleText.setPosition(64, 54)
    this.subtitleText.setPosition(68, 116)
    this.hintText.setPosition(68, height - 146)

    this.routeLabels.forEach((label, index) => {
      label.setPosition(routeStartX + index * spacing, 148)
    })

    if (this.cameras?.main) {
      this.cameras.main.setViewport(0, 0, width, height)
    }
  }

  private handleShutdown(): void {
    this.scale.off('resize', this.layout, this)
    this.routeLabels = []
  }

  private drawBackdrop(accent: number): void {
    const { width, height } = this.scale
    const drift = Math.sin(this.time.now * 0.0012) * 18
    const shimmer = 0.08 + Math.sin(this.time.now * 0.0023) * 0.02

    this.backdrop.clear()
    this.backdrop.fillGradientStyle(0x20384a, 0x20384a, 0x0d1922, 0x0d1922, 1)
    this.backdrop.fillRect(0, 0, width, height)

    this.backdrop.fillStyle(0xe6ba78, 0.14)
    this.backdrop.fillEllipse(width * 0.76, 118, 360, 160)
    this.backdrop.fillStyle(accent, 0.1 + shimmer)
    this.backdrop.fillEllipse(width * 0.76, 118, 460, 220)

    this.backdrop.fillStyle(0x324754, 0.28)
    this.backdrop.fillEllipse(220 + drift, 174, 360, 104)
    this.backdrop.fillEllipse(620 - drift * 0.7, 202, 520, 124)
    this.backdrop.fillEllipse(1120 + drift * 0.5, 182, 420, 108)
    this.backdrop.fillEllipse(width - 220, 210, 420, 116)

    this.backdrop.fillStyle(0x22313a, 0.74)
    this.backdrop.fillRect(0, height - 278, width, 116)
    this.backdrop.fillStyle(0x0c151b, 1)
    this.backdrop.fillRect(0, height - 176, width, 176)
    this.backdrop.fillStyle(0x142129, 0.82)
    this.backdrop.fillRect(0, height - 188, width, 30)

    this.drawTrackBed(height)
    this.drawStationDetails(width, height)
  }

  private drawTrackBed(height: number): void {
    this.backdrop.fillStyle(0x755b45, 0.95)

    for (let x = 0; x <= this.scale.width; x += 40) {
      this.backdrop.fillRect(x + 4, height - 118, 22, 6)
    }

    this.backdrop.lineStyle(4, 0xd4c1a1, 0.58)
    this.backdrop.strokeLineShape(new Phaser.Geom.Line(0, height - 116, this.scale.width, height - 116))
    this.backdrop.strokeLineShape(new Phaser.Geom.Line(0, height - 102, this.scale.width, height - 102))
  }

  private drawStationDetails(width: number, height: number): void {
    const lanternAlpha = 0.12 + Math.sin(this.time.now * 0.004) * 0.03

    this.backdrop.fillStyle(0x27353d, 0.94)
    this.backdrop.fillRect(86, height - 248, 240, 70)
    this.backdrop.fillTriangle(62, height - 248, 206, height - 298, 348, height - 248)
    this.backdrop.fillStyle(0xd9a35f, lanternAlpha)
    this.backdrop.fillRect(126, height - 226, 22, 28)
    this.backdrop.fillRect(196, height - 226, 22, 28)
    this.backdrop.fillRect(266, height - 226, 22, 28)

    this.backdrop.fillStyle(0x33454f, 0.88)
    this.backdrop.fillRect(width - 226, height - 260, 18, 92)
    this.backdrop.fillRect(width - 178, height - 260, 18, 92)
    this.backdrop.fillRect(width - 130, height - 260, 18, 92)
    this.backdrop.lineStyle(2, 0x73828a, 0.3)
    this.backdrop.strokeLineShape(new Phaser.Geom.Line(width - 250, height - 224, width - 96, height - 224))

    this.backdrop.fillStyle(0x637983, 0.24)
    this.backdrop.fillEllipse(width - 356, height - 136, 320, 42)
  }

  private drawTrain(extraWagons: number, upgradedWagons: number, accent: number): void {
    const { width, height } = this.scale
    const baseX = width * 0.16
    const y = height - 210
    const wagons = 3 + extraWagons
    const smokePulse = Math.sin(this.time.now * 0.0018) * 6

    for (let index = 0; index < wagons; index += 1) {
      const x = baseX + index * 126
      const builtExtra = index >= 3
      const upgraded = builtExtra && index - 3 < upgradedWagons
      const bodyColor = builtExtra ? (upgraded ? 0x8f6a4b : 0x7a5840) : 0x684733
      const windowGlow = upgraded ? 0.28 : builtExtra ? 0.18 : 0.12

      this.backdrop.fillStyle(bodyColor, 1)
      this.backdrop.fillRoundedRect(x, y, 112, 74, 18)
      this.backdrop.fillStyle(0x34292c, 1)
      this.backdrop.fillRoundedRect(x + 10, y + 12, 92, 50, 14)
      this.backdrop.fillStyle(0x936c4c, 1)
      this.backdrop.fillTriangle(x + 8, y + 2, x + 34, y - 18, x + 62, y + 2)
      this.backdrop.fillRect(x + 36, y - 14, 36, 16)
      this.backdrop.fillTriangle(x + 66, y + 2, x + 88, y - 16, x + 106, y + 2)

      this.backdrop.fillStyle(0x10181d, 1)
      this.backdrop.fillRoundedRect(x + 18, y + 18, 26, 24, 6)
      this.backdrop.fillRoundedRect(x + 66, y + 18, 26, 24, 6)
      this.backdrop.fillStyle(0xd9a35f, windowGlow + Math.sin(this.time.now * 0.005 + index * 0.8) * 0.02)
      this.backdrop.fillRoundedRect(x + 20, y + 20, 22, 20, 5)
      this.backdrop.fillRoundedRect(x + 68, y + 20, 22, 20, 5)

      this.backdrop.fillStyle(0x1a2329, 1)
      this.backdrop.fillCircle(x + 20, y + 80, 12)
      this.backdrop.fillCircle(x + 92, y + 80, 12)
      this.backdrop.fillStyle(0x49565d, 0.74)
      this.backdrop.fillCircle(x + 20, y + 80, 5)
      this.backdrop.fillCircle(x + 92, y + 80, 5)

      if (upgraded) {
        this.backdrop.fillStyle(accent, 0.22)
        this.backdrop.fillEllipse(x + 56, y + 24, 72, 34)
        this.backdrop.lineStyle(2, accent, 0.45)
        this.backdrop.strokeRoundedRect(x + 12, y + 10, 88, 54, 16)
      }
    }

    this.backdrop.fillStyle(0x24323a, 1)
    this.backdrop.fillRect(baseX - 28, y + 54, wagons * 126 - 12, 14)

    this.backdrop.fillStyle(0x2a3942, 1)
    this.backdrop.fillRect(baseX + 18, y - 46, 18, 34)
    this.backdrop.fillStyle(0xd0d5d8, 0.12)
    this.backdrop.fillEllipse(baseX + 26, y - 54 - smokePulse, 40, 18)
    this.backdrop.fillEllipse(baseX + 42, y - 74 - smokePulse * 1.2, 28, 14)
    this.backdrop.fillEllipse(baseX + 58, y - 90 - smokePulse * 1.3, 22, 10)
  }

  private drawLeaderPresence(accent: number): void {
    const { width, height } = this.scale
    const stanceX = width * 0.58
    const stanceY = height - 186
    const pulse = Math.sin(this.time.now * 0.0038) * 0.04

    this.backdrop.fillStyle(0x0b1319, 0.22)
    this.backdrop.fillEllipse(stanceX, stanceY + 58, 184, 26)
    this.backdrop.fillStyle(accent, 0.06 + pulse)
    this.backdrop.fillEllipse(stanceX, stanceY + 16, 164, 92)
    drawCatSilhouette(this.backdrop, {
      x: stanceX,
      y: stanceY + 18,
      color: 0xf1dac0,
      scale: 1.36,
      facing: 1,
      glowAlpha: 0.08,
      accentColor: accent,
      accentAlpha: 0.78,
      bob: Math.sin(this.time.now * 0.0045) * 1.8,
      stretch: 1 + pulse,
      tailLift: 0.36,
      headLift: 0.18,
      role: 'leader',
    })
  }

  private drawRouteMap(activeRouteId: string): void {
    const { width } = this.scale
    const startX = width - 362
    const startY = 124
    const spacing = 92
    const routes = this.store.getState().routeNodes

    this.backdrop.fillStyle(0x10202b, 0.56)
    this.backdrop.fillRoundedRect(startX - 44, startY - 40, spacing * (routes.length - 1) + 94, 108, 22)
    this.backdrop.lineStyle(2, 0x95a6af, 0.24)

    for (let index = 0; index < routes.length - 1; index += 1) {
      this.backdrop.strokeLineShape(
        new Phaser.Geom.Line(startX + index * spacing, startY, startX + (index + 1) * spacing, startY),
      )
    }

    routes.forEach((route, index) => {
      const x = startX + index * spacing
      const fill =
        route.id === activeRouteId
          ? 0xf2c078
          : route.status === 'cleared'
            ? 0x95c4a5
            : route.status === 'locked'
              ? 0x4d5960
              : 0x94b3d1
      const radius = route.id === activeRouteId ? 12 : 9

      this.backdrop.fillStyle(fill, 1)
      this.backdrop.fillCircle(x, startY, radius)
      this.backdrop.fillStyle(0xf8f0dd, route.id === activeRouteId ? 0.24 : 0.12)
      this.backdrop.fillCircle(x, startY, radius + 7)

      if (route.status === 'cleared') {
        this.backdrop.fillStyle(0xf8f0dd, 0.85)
        this.backdrop.fillRect(x - 1, startY - 18, 3, 10)
      } else {
        this.backdrop.fillStyle(0xf8f0dd, 0.88)
        this.backdrop.fillRect(x - 2, startY + 16, 4, 18)
      }
    })
  }
}
