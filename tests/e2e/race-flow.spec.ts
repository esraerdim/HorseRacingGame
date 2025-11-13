import { test, expect, type Page } from '@playwright/test'

const CONTROLS_SELECTOR = '.controls'
const TOGGLE_SELECTOR = '.game-page__toggle'
const RESULTS_META_SELECTOR = '.results-panel__meta'
const FLOW_TIMEOUT = 20_000
const FINISH_TIMEOUT = 60_000

const setupFastTimers = async (page: Page) => {
  await page.addInitScript(() => {
    const originalSetTimeout = window.setTimeout.bind(window)
    window.setTimeout = ((fn: TimerHandler, timeout?: number, ...args: unknown[]) =>
      originalSetTimeout(fn, Math.min(timeout ?? 0, 50), ...args)) as typeof window.setTimeout

    const originalSetInterval = window.setInterval.bind(window)
    window.setInterval = ((fn: TimerHandler, timeout?: number, ...args: unknown[]) =>
      originalSetInterval(fn, Math.min(timeout ?? 0, 50), ...args)) as typeof window.setInterval
  })
}

const getControls = (page: Page) => {
  const controls = page.locator(CONTROLS_SELECTOR)
  return {
    controls,
    generate: controls.locator('button').first(),
    flow: controls.locator('button').nth(1),
  }
}

const openApp = async (page: Page, options: { fastTimers?: boolean } = {}) => {
  if (options.fastTimers !== false) {
    await setupFastTimers(page)
  }
  await page.goto('/')
}

const prepareRace = async (page: Page) => {
  const { generate, flow } = getControls(page)
  await expect(generate).toBeVisible()
  await generate.click()
  await expect(flow).toBeEnabled({ timeout: 5_000 })
  await expect(flow).toHaveText('Start', { timeout: 5_000 })
  return { generate, flow }
}

const fastForwardRace = async (page: Page) => {
  await page.evaluate(async () => {
    const store = (window as unknown as { __HORSE_RACING_STORE__?: any }).__HORSE_RACING_STORE__
    if (!store) return

    const totalRounds = store.state.race.schedule.length

    if (store.state.race.status === 'ready') {
      await store.dispatch('race/startRace')
    }

    // Ensure first round is actively processing
    if (store.state.race.status === 'running') {
      await store.dispatch('race/processCurrentRound')
    }

    for (let i = 0; i < totalRounds; i += 1) {
      if (store.state.race.status === 'running') {
        await store.dispatch('race/completeCurrentRound')
      }

      if (store.state.race.status === 'awaiting' || store.state.race.status === 'countdown') {
        await store.dispatch('race/startNextRound')
        await store.dispatch('race/processCurrentRound')
      }

      if (store.state.race.status === 'finished') {
        break
      }
    }
  })
}

test.describe('Race flow', () => {
  test('user can generate a program and complete first lap', async ({ page }) => {
    await openApp(page)
    const { flow } = await prepareRace(page)

    await flow.click()
    await expect(flow).toHaveText(/Pause|Next Lap|Skip Countdown/, { timeout: 5_000 })

    const toggle = page.locator(TOGGLE_SELECTOR)
    await expect(toggle).toHaveText('Hide Live Results', { timeout: 5_000 })

    await expect(flow).toHaveText(/Skip Countdown|Pause/, { timeout: FLOW_TIMEOUT })
  })

  test('user can pause/resume and toggle live results', async ({ page }) => {
    await openApp(page, { fastTimers: false })
    const { flow } = await prepareRace(page)
    const toggle = page.locator(TOGGLE_SELECTOR)

    await flow.click()
    await expect(flow).toHaveText('Pause', { timeout: 5_000 })

    await flow.click()
    const flowLabelAfterPause = await flow.textContent({ timeout: 5_000 })
    expect(flowLabelAfterPause).not.toBeNull()
    expect(flowLabelAfterPause).not.toBe('Pause')
    const statusAfterPause = await page.evaluate(() => {
      const store = (window as unknown as { __HORSE_RACING_STORE__?: any }).__HORSE_RACING_STORE__
      return store?.state?.race?.status
    })
    expect(['paused', 'awaiting', 'countdown', 'finished']).toContain(statusAfterPause)

    if (flowLabelAfterPause?.includes('Resume')) {
      await expect(toggle).toHaveText('Hide Live Results', { timeout: 5_000 })
    } else {
      await expect(toggle).toHaveText(/Hide Live Results|Show Live Results/, { timeout: 5_000 })
    }

    await toggle.click()
    await expect(toggle).toHaveText('Show Live Results', { timeout: 5_000 })
    await toggle.click()
    await expect(toggle).toHaveText('Hide Live Results', { timeout: 5_000 })

    await flow.click()
    await expect(flow).toHaveText(/Pause|Skip Countdown|Race Finished/, { timeout: 5_000 })
  })

  test('user can complete the entire race schedule', async ({ page }) => {
    await openApp(page)
    const { flow } = await prepareRace(page)

    await flow.click()

    await fastForwardRace(page)

    await expect(flow).toHaveText('Race Finished', { timeout: FINISH_TIMEOUT })
    const resultsMeta = page.locator(RESULTS_META_SELECTOR)
    await page.getByRole('button', { name: 'Results', exact: true }).first().click()
    const completedLabel = await page.evaluate(() => {
      const store = (window as unknown as { __HORSE_RACING_STORE__?: any }).__HORSE_RACING_STORE__
      const count = store?.state?.race?.results?.length ?? 0
      return `${count} rounds completed`
    })
    await expect(resultsMeta).toHaveText(completedLabel, { timeout: 5_000 })
  })

  test('start control remains disabled until program is generated', async ({ page }) => {
    await openApp(page)
    const { flow } = getControls(page)
    await expect(flow).toBeDisabled()
    await expect(flow).toHaveText('Start')
  })
})

test.describe('Mobile layout', () => {
  test.use({
    viewport: { width: 390, height: 844 },
  })

  test('core controls remain accessible on mobile', async ({ page }) => {
    await openApp(page)
    const { generate, flow } = getControls(page)

    await expect(generate).toBeVisible()
    await expect(flow).toBeVisible()

    await generate.click()
    await expect(flow).toBeEnabled({ timeout: 5_000 })
  })
})

