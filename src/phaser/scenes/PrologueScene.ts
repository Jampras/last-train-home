import Phaser from 'phaser'
import type { InputController } from '../../game/input/InputController'
import type { GameStore } from '../../game/simulation/core/createGameStore'
import { drawCatSilhouette } from '../render/drawSilhouettes'
import { PROLOGUE_SCENE_KEY } from '../sceneKeys'

type PrologueStepId =
  | 'move'
  | 'light'
  | 'feed'
  | 'barricade'
  | 'return'
  | 'hide'
  | 'timeskip'
  | 'complete'

interface PrologueTask {
  id: PrologueStepId
  title: string
  prompt: string
}

const TASKS: PrologueTask[] = [
  {
    id: 'move',
    title: 'Siga Seu Pai',
    prompt: 'Ande para a esquerda e para a direita. Seu pai quer ver se voce ja sente o peso dos trilhos.',
  },
  {
    id: 'light',
    title: 'Acenda o Lampiao',
    prompt: 'Aproxime-se do lampiao da esquerda e interaja para deixa-lo pronto antes da noite.',
  },
  {
    id: 'feed',
    title: 'Alimente a Pequena',
    prompt: 'Uma gatinha assustada espera perto das caixas. Interaja com ela e entregue um pouco de comida.',
  },
  {
    id: 'barricade',
    title: 'Reforce a Barricada',
    prompt: 'Use a sucata separada pelo seu pai para firmar a entrada leste.',
  },
  {
    id: 'return',
    title: 'Volte Para o Trem',
    prompt: 'O sol esta caindo. Volte para o vagao central e espere novas instrucoes.',
  },
  {
    id: 'hide',
    title: 'Entre no Compartimento Seguro',
    prompt: 'A linha foi rompida. Corra para o compartimento do trem e esconda-se agora.',
  },
  {
    id: 'timeskip',
    title: '3 Anos Depois',
    prompt: 'A ultima estacao segura ficou para tras. Agora o trem depende de voce.',
  },
]

export class PrologueScene extends Phaser.Scene {
  private worldGraphics!: Phaser.GameObjects.Graphics
  private atmosphereGraphics!: Phaser.GameObjects.Graphics
  private overlayGraphics!: Phaser.GameObjects.Graphics
  private player!: Phaser.GameObjects.Ellipse
  private father!: Phaser.GameObjects.Ellipse
  private stray!: Phaser.GameObjects.Ellipse
  private caption!: Phaser.GameObjects.Text
  private objectiveText!: Phaser.GameObjects.Text
  private timeskipText!: Phaser.GameObjects.Text
  private stepIndex = 0
  private playerX = 1100
  private disasterStage = 0
  private movedLeft = false
  private movedRight = false
  private lampLit = false
  private strayFed = false
  private barricadeBuilt = false
  private disasterTimer = 0
  private disasterActive = false
  private timeskipTimer = 0
  private hideTriggered = false

  constructor(
    private readonly store: GameStore,
    private readonly inputController: InputController,
  ) {
    super(PROLOGUE_SCENE_KEY)
  }

  create(): void {
    this.worldGraphics = this.add.graphics()
    this.atmosphereGraphics = this.add.graphics()
    this.overlayGraphics = this.add.graphics()
    this.player = this.add.ellipse(0, 0, 30, 22, 0xf2d9b5)
    this.father = this.add.ellipse(0, 0, 36, 24, 0xf2c078)
    this.stray = this.add.ellipse(0, 0, 18, 14, 0xd8c5ae)
    this.caption = this.add.text(0, 0, '', {})
    this.objectiveText = this.add.text(0, 0, '', {})
    this.timeskipText = this.add.text(0, 0, '', {})

    this.player.setOrigin(0.5, 0.5)
    this.father.setOrigin(0.5, 0.5)
    this.stray.setOrigin(0.5, 0.5)
    this.player.setDepth(12)
    this.father.setDepth(12)
    this.stray.setDepth(12)
    this.player.setAlpha(0)
    this.father.setAlpha(0)
    this.stray.setAlpha(0)

    this.caption.setFontFamily('"Cormorant Garamond"')
    this.caption.setFontSize(24)
    this.caption.setColor('#fff2dc')
    this.caption.setDepth(20)
    this.caption.setOrigin(0.5, 0.5)
    this.caption.setStroke('#0d1922', 6)
    this.caption.setShadow(0, 4, '#000000', 12, false, true)

    this.objectiveText.setFontFamily('Manrope')
    this.objectiveText.setFontSize(12)
    this.objectiveText.setColor('#d1d9df')
    this.objectiveText.setDepth(20)
    this.objectiveText.setAlpha(0)
    this.objectiveText.setOrigin(0.5, 0.5)

    this.timeskipText.setFontFamily('"Cormorant Garamond"')
    this.timeskipText.setFontSize(56)
    this.timeskipText.setColor('#fff5e1')
    this.timeskipText.setAlpha(0)
    this.timeskipText.setDepth(24)
    this.timeskipText.setText('3 anos depois')
    this.timeskipText.setOrigin(0.5, 0.5)
    this.timeskipText.setStroke('#0d1922', 8)
    this.timeskipText.setShadow(0, 6, '#000000', 18, false, true)

    this.cameras.main.setBounds(0, 0, 2200, this.scale.height)
    this.scale.on('resize', this.layout, this)
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)
    this.layout()
    this.publishTask()
  }

  update(_: number, delta: number): void {
    const deltaSeconds = delta / 1000
    this.store.tickUi(deltaSeconds)

    if (this.store.hasBlockingOverlay()) {
      this.renderScene()
      return
    }

    this.handleMovement(deltaSeconds)
    this.handleConfirm()
    this.updateLogic(deltaSeconds)
    this.renderScene()
  }

  private handleMovement(deltaSeconds: number): void {
    const moveSpeed = this.disasterActive ? 310 : 260
    let moved = false

    if (this.inputController.isActive('move_left')) {
      this.playerX = Math.max(160, this.playerX - moveSpeed * deltaSeconds)
      this.movedLeft = true
      moved = true
    }

    if (this.inputController.isActive('move_right')) {
      this.playerX = Math.min(2040, this.playerX + moveSpeed * deltaSeconds)
      this.movedRight = true
      moved = true
    }

    if (moved) {
      this.cameras.main.centerOn(this.playerX, this.scale.height * 0.55)
    }
  }

  private handleConfirm(): void {
    if (!(this.inputController.consume('confirm') || this.inputController.consume('interact'))) {
      return
    }

    const step = TASKS[this.stepIndex]

    if (step.id === 'light' && Math.abs(this.playerX - 720) <= 140) {
      this.lampLit = true
      this.advanceTask()
      return
    }

    if (step.id === 'feed' && Math.abs(this.playerX - 1420) <= 140) {
      this.strayFed = true
      this.advanceTask()
      return
    }

    if (step.id === 'barricade' && Math.abs(this.playerX - 1740) <= 140) {
      this.barricadeBuilt = true
      this.advanceTask()
      return
    }

    if (step.id === 'return' && Math.abs(this.playerX - 1100) <= 170) {
      this.advanceTask()
      this.disasterActive = true
      this.disasterTimer = 0
      this.store.setCurrentEvent(
        {
          tone: 'hostile',
          title: 'Sirene Rachada',
          body: 'As luzes falharam. Seu pai grita para voce entrar no trem.',
          at: 'Noite',
          ttlSeconds: 999,
        },
        false,
      )
      this.store.setContextPrompt('Corra para o compartimento seguro do trem.', false)
      return
    }

    if (step.id === 'hide' && Math.abs(this.playerX - 1040) <= 110) {
      this.advanceTask()
      this.timeskipTimer = 0
      this.hideTriggered = true
      return
    }
  }

  private updateLogic(deltaSeconds: number): void {
    const step = TASKS[this.stepIndex]
    const reducedMotion = this.store.getState().userSettings.reducedMotion

    if (step.id === 'move' && this.movedLeft && this.movedRight) {
      this.advanceTask()
    }

    if (step.id === 'return' && !this.disasterActive) {
      if (this.store.getState().currentEvent?.title !== 'Anoitecer Calmo') {
        this.store.setCurrentEvent(
          {
            tone: 'mixed',
            title: 'Anoitecer Calmo',
            body: 'Seu pai sorri, mas quer todos perto do vagao antes que a luz caia.',
            at: 'Crepusculo',
            ttlSeconds: 999,
          },
          false,
        )
      }
    }

    if (this.disasterActive) {
      this.disasterTimer += deltaSeconds

      if (this.disasterStage === 0 && this.disasterTimer > 0.75) {
        this.disasterStage = 1
        this.store.setLastOutcome('Latidos irrompem perto demais da cerca. Algo quebrou a regra da safezone.', false)
      } else if (this.disasterStage === 1 && this.disasterTimer >= 1.6) {
        this.disasterStage = 2
        this.store.setCurrentEvent(
          {
            tone: 'hostile',
            title: 'Rompimento na Linha',
            body: 'Humanos cruzaram a cerca com lanternas e redes. Seu pai segura a passagem.',
            at: 'Noite',
            ttlSeconds: 999,
          },
          false,
        )
        if (!reducedMotion) {
          this.cameras.main.flash(220, 250, 205, 160, false)
        }
      } else if (this.disasterTimer >= 3.2 && !reducedMotion) {
        this.cameras.main.shake(120, 0.003)
      }
    }

    if (step.id === 'timeskip') {
      this.timeskipTimer += deltaSeconds
      this.timeskipText.setAlpha(Math.min(1, this.timeskipTimer / 1.5))
      this.timeskipText.setY(this.scale.height * 0.46 - Math.min(18, this.timeskipTimer * 8))

      if (this.timeskipTimer >= 3.8) {
        this.stepIndex = TASKS.length
        this.store.completePrologue()
      }
    }
  }

  private advanceTask(): void {
    this.stepIndex += 1

    if (this.stepIndex < TASKS.length) {
      this.publishTask()
    }
  }

  private publishTask(): void {
    const task = TASKS[this.stepIndex]

    this.store.setCurrentEvent(
      {
        tone: task.id === 'hide' ? 'hostile' : task.id === 'timeskip' ? 'mystery' : 'mixed',
        title: task.title,
        body: task.prompt,
        at: task.id === 'timeskip' ? 'Memoria' : 'Prologo',
        ttlSeconds: 999,
      },
      false,
    )
    this.store.setContextPrompt(task.prompt, false)
    this.store.setLastOutcome(this.resolveFatherLine(task.id), false)
  }

  private resolveFatherLine(step: PrologueStepId): string {
    switch (step) {
      case 'move':
        return 'Pai: Antes de liderar, voce precisa sentir o trem com as patas.'
      case 'light':
        return 'Pai: Nenhuma noite comeca bem se a primeira luz falha.'
      case 'feed':
        return 'Pai: Lider nao corre sozinho. Sempre olhe quem ficou para tras.'
      case 'barricade':
        return 'Pai: Sucata, corda e calma. E assim que sobrevivemos.'
      case 'return':
        return 'Pai: Volte para perto do vagao. Hoje o ar esta estranho.'
      case 'hide':
        return 'Pai: Entre agora. Nao olhe para tras. Leve todos que puder.'
      case 'timeskip':
        return 'A ultima imagem do seu pai fica presa entre o apito quebrado e o breu.'
      default:
        return ''
    }
  }

  private layout(): void {
    this.caption.setPosition(this.scale.width * 0.5, this.scale.height - 76)
    this.objectiveText.setPosition(this.scale.width * 0.5, this.scale.height - 48)
    this.timeskipText.setPosition(this.scale.width * 0.5, this.scale.height * 0.46)
  }

  private handleShutdown(): void {
    this.scale.off('resize', this.layout, this)
  }

  private renderScene(): void {
    const height = this.scale.height
    const groundY = height - 126
    const danger = this.disasterActive ? Math.min(0.88, this.disasterTimer / 4.5) : 0
    const settings = this.store.getState().userSettings
    const sky = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x7a9caf),
      Phaser.Display.Color.ValueToColor(0x161d24),
      100,
      Math.floor(danger * 100),
    )
    const skyColor = Phaser.Display.Color.GetColor(sky.r, sky.g, sky.b)

    this.cameras.main.setBackgroundColor(skyColor)
    this.worldGraphics.clear()
    this.atmosphereGraphics.clear()
    this.overlayGraphics.clear()

    this.drawSkyLayers(height, groundY, danger)
    this.drawDistantStation(groundY, danger)
    this.drawGroundBands(groundY, danger)
    this.drawTrain(groundY, danger, settings.reducedMotion)
    this.drawForegroundProps(groundY, danger, settings.reducedMotion)

    if (this.disasterActive) {
      this.drawThreatPass(groundY, danger)
    }

    this.drawAtmosphere(groundY, danger, settings.reducedMotion)
    this.drawSceneLighting(groundY, danger, settings.reducedMotion)
    this.drawActors(groundY, danger)
    this.updateCaption()

    const timeskipFade = this.stepIndex === 6 ? Math.min(0.7, this.timeskipTimer * 0.3) : 0

    this.overlayGraphics.fillStyle(0x050708, 0.08 + danger * 0.46 + timeskipFade)
    this.overlayGraphics.fillRect(this.cameras.main.worldView.x, 0, this.scale.width, this.scale.height)
    this.drawLetterbox(0.12 + danger * 0.06 + timeskipFade * 0.08)
  }

  private drawSkyLayers(height: number, groundY: number, danger: number): void {
    const g = this.worldGraphics

    g.fillGradientStyle(0x86a6b7, 0x86a6b7, 0x2d4655, 0x2d4655, 1)
    g.fillRect(0, 0, 2200, height)

    g.fillStyle(0xdab27a, 0.14 - danger * 0.05)
    g.fillEllipse(980, 124, 880, 240)
    g.fillStyle(0xf0cf97, 0.08)
    g.fillEllipse(1060, 150, 560, 140)

    g.fillStyle(0x6d8893, 0.22)
    g.fillEllipse(330, 170, 420, 110)
    g.fillEllipse(840, 204, 520, 128)
    g.fillEllipse(1540, 182, 460, 116)
    g.fillEllipse(1900, 150, 360, 94)

    g.fillStyle(0x4a6370, 0.28)
    g.fillRect(0, groundY - 250, 2200, 130)
    g.fillStyle(0x2e434f, 0.34)
    g.fillRect(0, groundY - 180, 2200, 96)
  }

  private drawDistantStation(groundY: number, danger: number): void {
    const g = this.worldGraphics
    const shedPositions = [110, 340, 590, 850, 1290, 1620, 1910]

    g.fillStyle(0x314651, 0.58)
    g.fillRect(0, groundY - 194, 2200, 18)

    for (const x of shedPositions) {
      g.fillStyle(0x20313a, 0.75)
      g.fillRect(x, groundY - 190, 112, 74)
      g.fillTriangle(x - 18, groundY - 190, x + 56, groundY - 232, x + 130, groundY - 190)
      g.fillStyle(0xd9a35f, 0.08 - danger * 0.02)
      g.fillRect(x + 24, groundY - 164, 18, 26)
      g.fillRect(x + 68, groundY - 164, 18, 26)
    }

    g.lineStyle(2, 0x72828a, 0.18)

    for (let x = 120; x <= 2060; x += 240) {
      g.strokeLineShape(new Phaser.Geom.Line(x, groundY - 268, x, groundY - 152))
      g.strokeLineShape(new Phaser.Geom.Line(x, groundY - 242, x + 104, groundY - 220))
    }
  }

  private drawGroundBands(groundY: number, danger: number): void {
    const g = this.worldGraphics

    g.fillStyle(0x435b63, 1)
    g.fillRect(0, groundY - 132, 2200, 132)
    g.fillStyle(0x1a2b34, 1)
    g.fillRect(0, groundY, 2200, 180)
    g.fillStyle(0x243640, 0.72)
    g.fillRect(0, groundY - 24, 2200, 34)

    g.fillStyle(0x705a44, 0.95)

    for (let x = 0; x < 2200; x += 44) {
      g.fillRect(x + 6, groundY + 18, 24, 6)
    }

    g.lineStyle(4, 0xd1b188, 0.6)
    g.strokeLineShape(new Phaser.Geom.Line(0, groundY + 20, 2200, groundY + 20))
    g.strokeLineShape(new Phaser.Geom.Line(0, groundY + 34, 2200, groundY + 34))

    g.fillStyle(0x0f161b, 0.22 + danger * 0.1)
    g.fillRect(0, groundY - 2, 2200, 12)
  }

  private drawTrain(groundY: number, danger: number, reducedMotion: boolean): void {
    const g = this.worldGraphics
    const bodyX = 822
    const bodyY = groundY - 110
    const bodyWidth = 640
    const bodyHeight = 102
    const flicker = reducedMotion ? 0.96 : 0.88 + Math.sin(this.time.now * 0.005) * 0.06
    const windowGlow = Math.max(0.12, 0.28 - danger * 0.08) * flicker
    const windowXs = [bodyX + 78, bodyX + 196, bodyX + 392, bodyX + 510]
    const wheelXs = [bodyX + 94, bodyX + 236, bodyX + 404, bodyX + 546]

    g.fillStyle(0x52382d, 1)
    g.fillRoundedRect(bodyX, bodyY, bodyWidth, bodyHeight, 20)
    g.fillStyle(0x34292c, 1)
    g.fillRoundedRect(bodyX + 18, bodyY + 16, bodyWidth - 36, bodyHeight - 28, 16)
    g.fillStyle(0x6e4b39, 1)
    g.fillTriangle(bodyX + 26, bodyY + 4, bodyX + 112, bodyY - 34, bodyX + 198, bodyY + 4)
    g.fillRect(bodyX + 192, bodyY - 20, 244, 24)
    g.fillTriangle(bodyX + 434, bodyY + 4, bodyX + 520, bodyY - 30, bodyX + 604, bodyY + 4)
    g.fillStyle(0x8f6843, 1)
    g.fillRect(bodyX + 84, bodyY - 32, 114, 22)
    g.fillRect(bodyX + 254, bodyY - 32, 116, 22)
    g.fillRect(bodyX + 426, bodyY - 32, 92, 22)
    g.fillStyle(0x25333b, 1)
    g.fillRoundedRect(bodyX + 266, bodyY + 10, 94, 74, 12)

    for (const x of windowXs) {
      g.fillStyle(0x10181d, 1)
      g.fillRoundedRect(x, bodyY + 22, 54, 34, 8)
      g.fillStyle(0xd9a35f, windowGlow)
      g.fillRoundedRect(x + 4, bodyY + 26, 46, 26, 7)
    }

    for (const x of wheelXs) {
      g.fillStyle(0x182229, 1)
      g.fillCircle(x, groundY + 6, 24)
      g.fillStyle(0x44525a, 0.75)
      g.fillCircle(x, groundY + 6, 11)
    }

    g.fillStyle(0x223038, 1)
    g.fillRect(bodyX + 40, groundY - 12, bodyWidth - 80, 14)
    g.fillStyle(0x6c8b99, 0.4)
    g.fillRect(bodyX + 52, groundY - 12, bodyWidth - 104, 3)

    g.fillStyle(0x26323a, 1)
    g.fillRect(bodyX + 34, bodyY - 66, 18, 44)
    g.fillStyle(0x88959b, 0.7)
    g.fillRect(bodyX + 40, bodyY - 82, 6, 18)

    const smokeLift = reducedMotion ? 0 : Math.sin(this.time.now * 0.0018) * 4

    for (let i = 0; i < 3; i += 1) {
      const smokeAlpha = Math.max(0.06, 0.14 - danger * 0.03) * (1 - i * 0.18)
      g.fillStyle(0xc8d0d4, smokeAlpha)
      g.fillEllipse(bodyX + 42 + i * 18, bodyY - 96 - i * 16 - smokeLift * (1 + i * 0.2), 34 - i * 4, 18 - i * 2)
    }

    if (this.stepIndex >= 5) {
      g.lineStyle(2, 0xd9a35f, 0.38)
      g.strokeRoundedRect(bodyX + 266, bodyY + 10, 94, 74, 12)
    }
  }

  private drawForegroundProps(groundY: number, danger: number, reducedMotion: boolean): void {
    const g = this.worldGraphics
    const lampGlow = this.lampLit || this.disasterActive
    const flicker = reducedMotion ? 0.94 : 0.82 + Math.sin(this.time.now * 0.012) * 0.12 + Math.sin(this.time.now * 0.021) * 0.04

    g.fillStyle(0x2b363d, 1)
    g.fillRect(708, groundY - 122, 14, 122)
    g.fillStyle(0x394650, 1)
    g.fillRect(700, groundY - 130, 30, 12)
    g.fillStyle(0x1a242b, 1)
    g.fillRoundedRect(696, groundY - 144, 40, 22, 8)

    if (lampGlow) {
      g.fillStyle(0xf2c078, Math.max(0.12, 0.28 - danger * 0.08) * flicker)
      g.fillCircle(716, groundY - 132, 66)
      g.fillStyle(0xf8ddb0, Math.max(0.08, 0.18 - danger * 0.06) * flicker)
      g.fillEllipse(716, groundY - 6, 178, 42)
      g.fillStyle(0xf8ddb0, Math.max(0.04, 0.11 - danger * 0.03) * flicker)
      g.fillEllipse(748, groundY - 56, 90, 24)
    }

    this.drawCrateStack(1378, groundY - 52, 3)
    this.drawCrateStack(1472, groundY - 38, 2)

    g.fillStyle(0x35444d, 1)
    g.fillRect(1660, groundY - 84, 190, 10)
    g.fillStyle(0x4e6470, 1)
    g.fillRect(1672, groundY - 100, 22, 26)
    g.fillRect(1756, groundY - 100, 22, 26)
    g.fillRect(1838, groundY - 100, 22, 26)

    g.fillStyle(0x6a5442, 1)
    g.fillRect(1684, groundY - 76, 16, 50)
    g.fillRect(1740, groundY - 68, 18, 42)
    g.fillRect(1796, groundY - 74, 16, 48)

    if (this.barricadeBuilt) {
      g.fillStyle(0x89a77f, 0.94)
      g.fillRect(1676, groundY - 98, 180, 8)
      g.fillStyle(0xc8d4c6, 0.5)
      g.fillRect(1700, groundY - 92, 126, 4)
    }

    g.fillStyle(0x243139, 0.88)
    g.fillRect(1020, groundY - 124, 118, 112)
    g.fillStyle(0x10181d, 1)
    g.fillRoundedRect(1038, groundY - 92, 80, 72, 12)
    g.fillStyle(0xd9a35f, this.disasterActive ? 0.16 : 0.08)
    g.fillRoundedRect(1044, groundY - 86, 68, 60, 10)
  }

  private drawCrateStack(x: number, y: number, rows: number): void {
    const g = this.worldGraphics

    for (let row = 0; row < rows; row += 1) {
      const offsetY = row * 28
      const count = row === rows - 1 ? 1 : 2
      const startX = x + row * 12

      for (let i = 0; i < count; i += 1) {
        const crateX = startX + i * 46
        g.fillStyle(0x6b4a38, 1)
        g.fillRoundedRect(crateX, y - offsetY, 40, 26, 6)
        g.fillStyle(0x8b674b, 0.9)
        g.fillRect(crateX + 6, y - offsetY + 6, 28, 3)
        g.fillRect(crateX + 6, y - offsetY + 17, 28, 3)
      }
    }
  }

  private drawThreatPass(groundY: number, danger: number): void {
    const g = this.worldGraphics

    g.fillStyle(0x8f3e36, 0.16 + danger * 0.08)
    g.fillTriangle(1600, groundY - 162, 2200, groundY - 242, 2200, groundY + 10)
    g.fillStyle(0xd9745a, 0.1 + danger * 0.08)
    g.fillRect(1622, groundY - 154, 430, 146)
    g.fillStyle(0x0a0f12, 0.9)
    g.fillEllipse(1868, groundY - 18, 46, 24)
    g.fillEllipse(1924, groundY - 14, 54, 28)
    g.fillRect(1974, groundY - 68, 24, 68)
    g.fillRect(2008, groundY - 76, 20, 76)
    g.fillRect(2042, groundY - 54, 22, 54)
    g.fillEllipse(2056, groundY - 12, 34, 20)

    g.fillStyle(0xf0bf7b, 0.18)
    g.fillCircle(1990, groundY - 118, 46)
    g.fillStyle(0xf0bf7b, 0.24)
    g.fillEllipse(1990, groundY - 118, 14, 14)

    g.lineStyle(3, 0x4c5b64, 0.46)

    for (let x = 1620; x <= 2140; x += 58) {
      g.strokeLineShape(new Phaser.Geom.Line(x, groundY - 124, x, groundY - 8))
    }
  }

  private drawAtmosphere(groundY: number, danger: number, reducedMotion: boolean): void {
    const g = this.atmosphereGraphics
    const drift = reducedMotion ? 0 : Math.sin(this.time.now * 0.0018) * 18

    g.fillStyle(0xc3ccd1, 0.08)
    g.fillEllipse(412 + drift, groundY - 28, 360, 42)
    g.fillEllipse(1128 - drift * 0.7, groundY - 18, 460, 52)
    g.fillEllipse(1788 + drift * 0.5, groundY - 22, 400, 48)

    if (danger > 0) {
      g.fillStyle(0xa95a47, 0.08 + danger * 0.05)
      g.fillEllipse(1830, groundY - 78, 520, 120)
    }
  }

  private drawSceneLighting(groundY: number, danger: number, reducedMotion: boolean): void {
    const g = this.overlayGraphics
    const viewX = this.cameras.main.worldView.x
    const width = this.scale.width
    const flicker = reducedMotion ? 0 : Math.sin(this.time.now * 0.0052) * 0.03
    const lampAlpha = (this.lampLit || this.disasterActive ? 0.14 : 0.06) + flicker
    const trainAlpha = Math.max(0.06, 0.16 - danger * 0.03) + flicker * 0.4

    g.fillStyle(0x05080b, 0.08 + danger * 0.12)
    g.fillRect(viewX, 0, width, 24)
    g.fillRect(viewX, this.scale.height - 24, width, 24)

    g.fillStyle(0xf2c078, lampAlpha)
    g.fillEllipse(716, groundY - 12, 220, 56)

    g.fillStyle(0xf4c88a, trainAlpha)
    g.fillEllipse(1140, groundY - 18, 420, 96)

    if (danger > 0) {
      g.fillStyle(0xd56f5a, 0.06 + danger * 0.08)
      g.fillEllipse(1880, groundY - 74, 560, 160)
    }
  }

  private drawActors(groundY: number, danger: number): void {
    this.player.setPosition(this.playerX, groundY - 18)
    this.father.setPosition(this.disasterActive ? 1172 : 1188, groundY - 20)
    this.stray.setPosition(1442, groundY - 10)
    this.stray.setVisible(!this.strayFed)
    const reducedMotion = this.store.getState().userSettings.reducedMotion
    const walkPulse = reducedMotion ? 0 : Math.sin(this.time.now * 0.008)
    const fatherPulse = reducedMotion ? 0 : Math.sin(this.time.now * 0.004 + 0.8)
    const kittenPulse = reducedMotion ? 0 : Math.sin(this.time.now * 0.01 + 1.4)
    const crouch = this.hideTriggered || this.stepIndex >= 6 ? 0.5 : 0
    const playerFacing = this.disasterActive ? -1 : 1
    const fatherX = this.disasterActive
      ? 1172 + (this.disasterStage >= 2 ? 10 : 0)
      : 1188 + fatherPulse * 3
    const fatherBob = this.disasterActive ? -Math.min(3, this.disasterTimer * 3) : fatherPulse * 1.2
    const fatherTail = this.disasterActive ? 0.9 : 0.35 + Math.max(0, fatherPulse) * 0.15
    const playerBob = this.inputController.isActive('move_left') || this.inputController.isActive('move_right') ? walkPulse * 2.6 : Math.sin(this.time.now * 0.0045) * 1.2
    const playerStretch = this.inputController.isActive('move_left') || this.inputController.isActive('move_right') ? 0.92 : 1 + Math.sin(this.time.now * 0.0038) * 0.03
    const kittenBob = this.strayFed ? 0 : (danger > 0.4 ? Math.abs(kittenPulse) * 2.2 : kittenPulse * 0.8)

    drawCatSilhouette(this.worldGraphics, {
      x: this.playerX,
      y: groundY - 8,
      color: 0xf1dac0,
      scale: 1,
      facing: playerFacing,
      accentColor: 0xf8f0dd,
      accentAlpha: 0.7,
      bob: playerBob,
      stretch: playerStretch,
      tailLift: this.disasterActive ? 0.85 : 0.42,
      headLift: this.disasterActive ? 0.5 : 0.12,
      crouch,
      role: 'leader',
    })

    drawCatSilhouette(this.worldGraphics, {
      x: fatherX,
      y: groundY - 10,
      color: this.disasterActive ? 0xe0a576 : 0xf2c078,
      scale: this.disasterActive ? 1.18 : 1.1,
      facing: -1,
      glowAlpha: this.disasterActive ? 0.04 : 0,
      accentColor: 0xd9a35f,
      accentAlpha: 0.76,
      bob: fatherBob,
      stretch: this.disasterActive ? 0.94 : 1 + fatherPulse * 0.02,
      tailLift: fatherTail,
      headLift: this.disasterActive ? 0.72 : 0.24,
      crouch: this.disasterActive ? 0.12 : 0,
      role: 'father',
    })

    if (!this.strayFed) {
      drawCatSilhouette(this.worldGraphics, {
        x: 1442,
        y: groundY - 2,
        color: danger > 0.4 ? 0xbfae96 : 0xd8c5ae,
        scale: 0.74,
        facing: -1,
        glowAlpha: 0.08,
        accentColor: 0xf8f0dd,
        accentAlpha: 0.22,
        bob: kittenBob,
        stretch: 1 + kittenPulse * 0.02,
        tailLift: danger > 0.4 ? 0.6 : 0.22,
        headLift: danger > 0.4 ? 0.4 : 0.1,
        crouch: danger > 0.4 ? 0.18 : 0,
        role: 'kitten',
      })
    }
  }

  private updateCaption(): void {
    const currentTask = TASKS[Math.min(this.stepIndex, TASKS.length - 1)]
    const settings = this.store.getState().userSettings

    this.caption.setText(settings.subtitlesEnabled ? this.resolveFatherLine(currentTask.id) : '')
    this.objectiveText.setText('')

    if (currentTask.id === 'timeskip') {
      this.caption.setAlpha(0)
      return
    }

    const reducedMotion = this.store.getState().userSettings.reducedMotion
    const pulse = reducedMotion ? 0 : Math.sin(this.time.now * 0.0028) * 0.04
    this.caption.setAlpha(0.92 + pulse)
  }

  private drawLetterbox(alpha: number): void {
    const viewX = this.cameras.main.worldView.x
    const width = this.scale.width

    this.overlayGraphics.fillStyle(0x081015, Math.max(0, alpha))
    this.overlayGraphics.fillRect(viewX, 0, width, 24)
    this.overlayGraphics.fillRect(viewX, this.scale.height - 24, width, 24)
  }
}
