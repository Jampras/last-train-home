import Phaser from 'phaser'

interface CatDrawOptions {
  x: number
  y: number
  color: number
  scale?: number
  facing?: 1 | -1
  glowAlpha?: number
  accentColor?: number
  accentAlpha?: number
  role?: 'leader' | 'father' | 'kitten' | 'crew'
  bob?: number
  stretch?: number
  tailLift?: number
  headLift?: number
  crouch?: number
}

interface HumanDrawOptions {
  x: number
  y: number
  color: number
  scale?: number
  facing?: 1 | -1
  toolColor?: number
  role?: 'captor' | 'lanternist' | 'saboteur' | 'handler'
}

interface DogDrawOptions {
  x: number
  y: number
  color: number
  scale?: number
  facing?: 1 | -1
  role?: 'tracker' | 'rush'
}

export function drawCatSilhouette(graphics: Phaser.GameObjects.Graphics, options: CatDrawOptions): void {
  const { x, y, color, facing = 1, scale = 1, glowAlpha = 0, accentColor = 0xf8f0dd, accentAlpha = 0 } = options
  const bodyWidth = options.role === 'kitten' ? 18 : options.role === 'father' ? 34 : 28
  const bodyHeight = options.role === 'kitten' ? 12 : options.role === 'father' ? 20 : 16
  const headRadius = options.role === 'kitten' ? 6 : options.role === 'father' ? 10 : 8
  const tailLength = options.role === 'kitten' ? 14 : options.role === 'father' ? 22 : 18
  const bob = options.bob ?? 0
  const stretch = options.stretch ?? 1
  const tailLift = options.tailLift ?? 0
  const headLift = options.headLift ?? 0
  const crouch = options.crouch ?? 0
  const dir = facing
  const baseY = y + bob * scale
  const bodyHeightScaled = bodyHeight * scale * stretch * (1 - crouch * 0.18)
  const bodyWidthScaled = bodyWidth * scale * (1 + crouch * 0.06)
  const headRadiusScaled = headRadius * scale * (1 - crouch * 0.08)

  if (glowAlpha > 0) {
    graphics.fillStyle(accentColor, glowAlpha)
    graphics.fillEllipse(x, baseY - 6 * scale, 46 * scale, 24 * scale)
  }

  graphics.fillStyle(0x0b1319, 0.18)
  graphics.fillEllipse(x, baseY + 4 * scale, 28 * scale, 8 * scale)

  graphics.lineStyle(4 * scale, color, 0.94)
  graphics.beginPath()
  graphics.moveTo(x - dir * (bodyWidth * 0.3) * scale, baseY - 2 * scale - crouch * 2 * scale)
  graphics.lineTo(x - dir * (bodyWidth * 0.65) * scale, baseY - (10 + tailLift * 8) * scale)
  graphics.lineTo(x - dir * (bodyWidth * 0.92 + tailLength) * scale, baseY - (14 + tailLift * 14) * scale)
  graphics.strokePath()

  graphics.fillStyle(color, 1)
  graphics.fillEllipse(x, baseY - 6 * scale + crouch * 2 * scale, bodyWidthScaled, bodyHeightScaled)

  const headX = x + dir * (bodyWidth * 0.34) * scale
  const headY = baseY - (12 + headLift * 7) * scale + crouch * 1.5 * scale

  graphics.fillCircle(headX, headY, headRadiusScaled)
  graphics.fillTriangle(
    headX - dir * 1 * scale,
    headY - 4 * scale,
    headX + dir * 4 * scale,
    headY - (headRadius + 8 + tailLift * 2) * scale,
    headX + dir * 9 * scale,
    headY - 2 * scale,
  )
  graphics.fillTriangle(
    headX - dir * 10 * scale,
    headY - 2 * scale,
    headX - dir * 4 * scale,
    headY - (headRadius + 8 + tailLift * 2) * scale,
    headX + dir * 1 * scale,
    headY - 4 * scale,
  )

  graphics.fillRoundedRect(x - 9 * scale, baseY - (2 - crouch * 3) * scale, 4 * scale, (10 - crouch * 2) * scale, 2 * scale)
  graphics.fillRoundedRect(x - 1 * scale, baseY - (1 - crouch * 3) * scale, 4 * scale, (10 - crouch * 2) * scale, 2 * scale)

  if (accentAlpha > 0) {
    graphics.fillStyle(accentColor, accentAlpha)
    if (options.role === 'father') {
      graphics.fillRect(x - 8 * scale, baseY - 18 * scale, 16 * scale, 3 * scale)
    } else if (options.role === 'leader') {
      graphics.fillTriangle(
        x - dir * 8 * scale,
        baseY - 17 * scale,
        x - dir * 3 * scale,
        baseY - 23 * scale,
        x + dir * 5 * scale,
        baseY - 17 * scale,
      )
    } else if (options.role === 'crew') {
      graphics.fillCircle(x - dir * 8 * scale, baseY - 10 * scale, 3 * scale)
    }
  }
}

export function drawHumanSilhouette(graphics: Phaser.GameObjects.Graphics, options: HumanDrawOptions): void {
  const { x, y, color, scale = 1, facing = -1, toolColor = 0xf0bf7b } = options
  const dir = facing

  graphics.fillStyle(0x0b1319, 0.18)
  graphics.fillEllipse(x, y + 4 * scale, 20 * scale, 8 * scale)
  graphics.fillStyle(color, 1)
  graphics.fillRoundedRect(x - 7 * scale, y - 26 * scale, 14 * scale, 30 * scale, 4 * scale)
  graphics.fillCircle(x, y - 34 * scale, 6 * scale)
  graphics.fillRect(x - 7 * scale, y + 2 * scale, 4 * scale, 12 * scale)
  graphics.fillRect(x + 3 * scale, y + 2 * scale, 4 * scale, 12 * scale)

  if (options.role === 'captor') {
    graphics.lineStyle(2 * scale, toolColor, 0.82)
    graphics.strokeLineShape(new Phaser.Geom.Line(x + dir * 3 * scale, y - 10 * scale, x + dir * 18 * scale, y - 28 * scale))
    graphics.strokeCircle(x + dir * 24 * scale, y - 32 * scale, 8 * scale)
  } else if (options.role === 'lanternist') {
    graphics.lineStyle(2 * scale, 0x54656f, 0.8)
    graphics.strokeLineShape(new Phaser.Geom.Line(x + dir * 2 * scale, y - 10 * scale, x + dir * 14 * scale, y + 4 * scale))
    graphics.fillStyle(toolColor, 0.85)
    graphics.fillCircle(x + dir * 15 * scale, y + 8 * scale, 4 * scale)
  } else if (options.role === 'saboteur') {
    graphics.fillStyle(0x3b454c, 1)
    graphics.fillRect(x + dir * 6 * scale, y - 18 * scale, 12 * scale, 4 * scale)
  } else {
    graphics.lineStyle(2 * scale, 0x4c5b64, 0.85)
    graphics.strokeLineShape(new Phaser.Geom.Line(x + dir * 5 * scale, y - 12 * scale, x + dir * 20 * scale, y - 26 * scale))
  }
}

export function drawDogSilhouette(graphics: Phaser.GameObjects.Graphics, options: DogDrawOptions): void {
  const { x, y, color, scale = 1, facing = -1 } = options
  const dir = facing
  const bodyLength = options.role === 'rush' ? 28 : 22
  const bodyHeight = options.role === 'rush' ? 11 : 9

  graphics.fillStyle(0x0b1319, 0.18)
  graphics.fillEllipse(x, y + 4 * scale, 24 * scale, 8 * scale)
  graphics.fillStyle(color, 1)
  graphics.fillEllipse(x, y - 4 * scale, bodyLength * scale, bodyHeight * scale)
  graphics.fillCircle(x + dir * 12 * scale, y - 7 * scale, 6 * scale)
  graphics.fillTriangle(
    x + dir * 12 * scale,
    y - 11 * scale,
    x + dir * 17 * scale,
    y - 18 * scale,
    x + dir * 18 * scale,
    y - 8 * scale,
  )
  graphics.fillTriangle(
    x + dir * 8 * scale,
    y - 10 * scale,
    x + dir * 11 * scale,
    y - 17 * scale,
    x + dir * 13 * scale,
    y - 9 * scale,
  )
  graphics.fillRect(x - 7 * scale, y - 1 * scale, 3 * scale, 10 * scale)
  graphics.fillRect(x + 1 * scale, y - 1 * scale, 3 * scale, 10 * scale)

  graphics.lineStyle(3 * scale, color, 0.92)
  graphics.beginPath()
  graphics.moveTo(x - dir * 8 * scale, y - 6 * scale)
  graphics.lineTo(x - dir * 16 * scale, y - 10 * scale)
  graphics.lineTo(x - dir * 22 * scale, y - 4 * scale)
  graphics.strokePath()
}
