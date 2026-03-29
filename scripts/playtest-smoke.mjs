/* eslint-disable no-undef */
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { chromium } from 'playwright'

const args = new Set(process.argv.slice(2))
const baseUrl = [...args].find((arg) => arg.startsWith('--url='))?.slice('--url='.length) ?? 'http://127.0.0.1:4173'
const mobile = args.has('--mobile')
const outputDir = path.join(process.cwd(), 'output', 'playwright')
const prefix = mobile ? 'smoke-mobile' : 'smoke-desktop'

fs.mkdirSync(outputDir, { recursive: true })

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function capture(page, name) {
  await page.screenshot({
    path: path.join(outputDir, `${prefix}-${name}.png`),
    animations: 'disabled',
    timeout: 60000,
  })
}

const browser = await chromium.launch({ headless: true })

try {
  const context = await browser.newContext(
    mobile
      ? {
          viewport: { width: 390, height: 844 },
          isMobile: true,
          hasTouch: true,
        }
      : {
          viewport: { width: 1440, height: 960 },
        },
  )
  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text())
    }
  })
  page.on('pageerror', (error) => {
    pageErrors.push(String(error))
  })

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await capture(page, '01-prologue')

  await page.evaluate(() => {
    window.__LTH_DEBUG?.store.completePrologue()
  })
  await page.waitForTimeout(250)
  await capture(page, '02-hub')

  await page.evaluate(() => {
    document.querySelector('#action-button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await page.waitForTimeout(250)

  await page.evaluate(() => {
    document.querySelector('#settings-button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await page.waitForTimeout(100)

  const overlayBaseline = await page.evaluate(() => ({
    time: window.__LTH_DEBUG?.store.getState().run?.clock.totalMinutes ?? 0,
    x: window.__LTH_DEBUG?.store.getState().run?.playerX ?? 0,
    settingsOpen: window.__LTH_DEBUG?.store.getState().settingsPanelOpen ?? false,
  }))

  await page.keyboard.down('d')
  await page.waitForTimeout(800)
  await page.keyboard.up('d')
  await page.waitForTimeout(100)
  await capture(page, '03-settings-open')

  const blocked = await page.evaluate(() => ({
    time: window.__LTH_DEBUG?.store.getState().run?.clock.totalMinutes ?? 0,
    x: window.__LTH_DEBUG?.store.getState().run?.playerX ?? 0,
    settingsOpen: window.__LTH_DEBUG?.store.getState().settingsPanelOpen ?? false,
  }))

  ensure(blocked.settingsOpen, 'Painel de ajustes nao abriu.')
  ensure(Math.abs(blocked.time - overlayBaseline.time) < 0.01, 'A run continuou avancando com o painel de ajustes aberto.')
  ensure(Math.abs(blocked.x - overlayBaseline.x) < 0.01, 'O jogador moveu com o painel de ajustes aberto.')

  await page.evaluate(() => {
    document.querySelector('#close-settings-button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await page.waitForTimeout(100)

  await page.evaluate(() => {
    const store = window.__LTH_DEBUG?.store

    if (!store) {
      return
    }

    const run = store.getState().run

    if (!run) {
      return
    }

    run.resources.scrap += 20
    run.resources.food += 10
    run.resources.lampOil += 10
    run.metrics.recruitsSaved = 3
    run.metrics.resourceNodesCollected = run.metrics.totalResourceNodes
    run.metrics.mysteryEventsTriggered = 2

    for (const node of run.buildNodes) {
      if (node.tier < node.maxTier) {
        run.metrics.builtTiers += node.maxTier - node.tier
        node.tier = node.maxTier
      }
    }

    for (let index = 0; index < 4200; index += 1) {
      store.advanceRun(0.2)
      if (store.getState().run?.canDepart) {
        break
      }
    }
  })
  await page.waitForTimeout(200)
  await capture(page, '04-run-ready')

  const readyState = await page.evaluate(() => ({
    canDepart: window.__LTH_DEBUG?.store.getState().run?.canDepart ?? false,
  }))
  ensure(readyState.canDepart, 'A run nao chegou ao estado de partida liberada.')

  await page.evaluate(() => {
    document.querySelector('#action-button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await page.waitForTimeout(250)
  await capture(page, '05-summary')

  const summaryBlocked = await page.evaluate(() => ({
    summaryOpen: window.__LTH_DEBUG?.store.getState().lastRunSummary !== null,
    actionDisabled: document.querySelector('#action-button')?.hasAttribute('disabled') ?? false,
  }))
  ensure(summaryBlocked.summaryOpen, 'O resumo da run nao abriu.')
  ensure(summaryBlocked.actionDisabled, 'O botao principal nao foi bloqueado durante o resumo.')

  await page.evaluate(() => {
    document.querySelector('#dismiss-summary-button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await page.waitForTimeout(150)
  await page.evaluate(() => {
    document.querySelector('#dismiss-summary-button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await page.waitForTimeout(150)

  await page.evaluate(() => {
    const store = window.__LTH_DEBUG?.store

    if (!store) {
      return
    }

    const settleHub = () => {
      if (store.getState().currentMemory) {
        store.dismissCurrentMemory()
      }

      if (store.getState().lastRunSummary) {
        store.clearLastRunSummary()
      }
    }

    settleHub()

    for (let route = 0; route < 3; route += 1) {
      store.startRun()
      const run = store.getState().run

      if (!run) {
        continue
      }

      run.resources.scrap += 20
      run.resources.food += 10
      run.resources.lampOil += 10
      run.metrics.recruitsSaved = 3
      run.metrics.resourceNodesCollected = run.metrics.totalResourceNodes
      run.metrics.mysteryEventsTriggered = 2

      for (const node of run.buildNodes) {
        if (node.tier < node.maxTier) {
          run.metrics.builtTiers += node.maxTier - node.tier
          node.tier = node.maxTier
        }
      }

      for (let index = 0; index < 4200; index += 1) {
        store.advanceRun(0.2)
        if (store.getState().run?.canDepart) {
          break
        }
      }

      store.leaveRun()
      settleHub()
    }
  })
  await page.waitForTimeout(250)
  await capture(page, '06-ending-ready')

  const endingReady = await page.evaluate(() => ({
    endingUnlocked: window.__LTH_DEBUG?.store.getState().endingUnlocked ?? false,
    endingCompleted: window.__LTH_DEBUG?.store.getState().endingCompleted ?? false,
    actionLabel: document.querySelector('#action-button')?.textContent ?? '',
  }))

  ensure(endingReady.endingUnlocked, 'O desfecho nao foi desbloqueado no fluxo completo.')
  ensure(!endingReady.endingCompleted, 'O desfecho apareceu concluido antes de ser acionado.')
  ensure(endingReady.actionLabel.includes('desfecho'), 'O botao principal nao refletiu o desfecho pronto.')

  await page.evaluate(() => {
    document.querySelector('#action-button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await page.waitForTimeout(250)
  await capture(page, '07-ending')

  const finalState = await page.evaluate(() => ({
    endingCompleted: window.__LTH_DEBUG?.store.getState().endingCompleted ?? false,
    memoryTitle: window.__LTH_DEBUG?.store.getState().currentMemory?.title ?? '',
  }))

  ensure(finalState.endingCompleted, 'O desfecho nao foi concluido.')
  ensure(finalState.memoryTitle.length > 0, 'A memoria final nao apareceu.')
  ensure(consoleErrors.length === 0, `Console errors encontrados: ${consoleErrors.join(' | ')}`)
  ensure(pageErrors.length === 0, `Page errors encontrados: ${pageErrors.join(' | ')}`)

  const report = {
    mode: mobile ? 'mobile' : 'desktop',
    baseUrl,
    overlayBaseline,
    blocked,
    endingReady,
    finalState,
  }

  fs.writeFileSync(path.join(outputDir, `${prefix}-report.json`), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} finally {
  await browser.close()
}
