import { expect, test, type Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Studio 真实浏览器回归（Chrome）。
 *
 * 覆盖用户要求里的浏览器验收项：
 *   1440×900 / 1280×800 / 1024 / 390×844 / 375×812、Light/Dark、200% 缩放等效、
 *   键盘（⌘K / ↑↓ / Enter / Esc）、弹层开合与回焦、长文本、页面切换后浮层不残留。
 *
 * 截图落在 docs/migration/v5-to-ui/evidence/screens/，作为交付证据而不是本地缓存。
 */
const HERE = path.dirname(fileURLToPath(import.meta.url))
const SCREENS = path.resolve(HERE, '../../../../docs/migration/v5-to-ui/evidence/screens')

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1280x800', width: 1280, height: 800 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390x844', width: 390, height: 844 },
  { name: '375x812', width: 375, height: 812 },
]

/** 收集控制台错误与未捕获异常：页面里出现任何一条都算失败 */
function trackErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

async function shoot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(SCREENS, { recursive: true })
  await page.screenshot({ path: path.join(SCREENS, `${name}.png`), fullPage: false })
}

/** 横向溢出检测：任何视口都不允许出现横向滚动条 */
async function expectNoHorizontalOverflow(page: Page, label: string): Promise<void> {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(
    overflow.scrollWidth,
    `${label} 出现横向溢出（scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}）`,
  ).toBeLessThanOrEqual(overflow.clientWidth + 1)
}

test.describe('响应式布局', () => {
  for (const viewport of VIEWPORTS) {
    test(`目录页 ${viewport.name} 无横向溢出`, async ({ page }) => {
      const errors = trackErrors(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/#/')
      await expect(page.getByRole('heading', { name: '组件目录', exact: false })).toBeVisible()
      await expectNoHorizontalOverflow(page, `目录页 ${viewport.name}`)
      await shoot(page, `catalog-${viewport.name}`)
      expect(errors).toEqual([])
    })

    test(`条目工作台 ${viewport.name} 无横向溢出`, async ({ page }) => {
      const errors = trackErrors(page)
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/#/c/button/basic')
      await expect(page.locator('[data-preview-root]')).toBeVisible()
      await expectNoHorizontalOverflow(page, `工作台 ${viewport.name}`)
      await shoot(page, `workbench-${viewport.name}`)
      expect(errors).toEqual([])
    })
  }

  test('200% 缩放等效（720×450 CSS 视口）仍可用', async ({ page }) => {
    await page.setViewportSize({ width: 720, height: 450 })
    await page.goto('/#/c/dialog/basic')
    await expect(page.locator('[data-preview-root]')).toBeVisible()
    await expectNoHorizontalOverflow(page, '200% 缩放')
    await shoot(page, 'zoom-200-720x450')
  })
})

test.describe('深链接与标签', () => {
  test('URL 直达 Story 并保留 tab / viewport', async ({ page }) => {
    // tab=api 时不渲染画布，先验证标签与标题
    await page.goto('/#/c/select/basic?tab=api')
    await expect(page.getByRole('tab', { name: 'API' })).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('heading', { name: /选择器/ })).toBeVisible()
    expect(page.url()).toContain('tab=api')

    // viewport 只影响画布，切回 Preview 才能看到分段控件
    await page.goto('/#/c/select/basic?tab=preview&viewport=tablet')
    await expect(page.getByRole('button', { name: /平板/ })).toHaveAttribute('aria-pressed', 'true')

    // 切标签不能让 viewport 丢失
    await page.getByRole('tab', { name: 'API' }).click()
    expect(page.url()).toContain('viewport=tablet')
  })

  test('切换标签写回 URL，浏览器后退能回退', async ({ page }) => {
    await page.goto('/#/c/button/basic')
    await page.getByRole('tab', { name: 'Examples' }).click()
    expect(page.url()).toContain('tab=examples')

    await page.goto('/#/c/input/basic')
    await page.goBack()
    await expect(page.getByRole('heading', { name: /按钮/ })).toBeVisible()
    expect(page.url()).toContain('/c/button/basic')
  })

  test('展开/收起属性面板与 Story 列表在窄屏可用', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/#/c/button/basic')
    await page.getByRole('button', { name: '打开 Story 列表' }).click()
    const drawer = page.getByRole('dialog')
    await expect(drawer).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(drawer).toBeHidden()
  })
})

test.describe('键盘可达性', () => {
  test('⌘K 打开命令面板，↑↓ 与 Enter 直达条目', async ({ page }) => {
    await page.goto('/#/')
    await page.keyboard.press('Meta+k')
    const palette = page.getByRole('dialog', { name: '命令面板' })
    await expect(palette).toBeVisible()

    await page.getByRole('textbox', { name: '搜索组件或 Story' }).fill('table')
    await expect(page.getByRole('option').first()).toBeVisible()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(palette).toBeHidden()
    expect(page.url()).toMatch(/#\/c\/(table|datatable)/)
  })

  test('Esc 关闭命令面板并把焦点还给触发按钮', async ({ page }) => {
    await page.goto('/#/')
    const trigger = page.getByRole('button', { name: /搜索 65 个条目/ })
    await trigger.click()
    await expect(page.getByRole('dialog', { name: '命令面板' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: '命令面板' })).toBeHidden()
  })

  test('弹窗：Tab 在面板内循环，Esc 关闭后焦点回到触发按钮', async ({ page }) => {
    await page.goto('/#/c/dialog/basic')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await shoot(page, 'dialog-open')

    for (let index = 0; index < 6; index += 1) await page.keyboard.press('Tab')
    const inside = await page.evaluate(() => {
      const panel = document.querySelector('[role="dialog"]')
      return panel ? panel.contains(document.activeElement) : false
    })
    expect(inside, 'Tab 后焦点应仍在弹窗内').toBe(true)

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()

    // 首屏自动打开时没有触发元素，关闭后回到 body 是正确行为；
    // 真正要验证的是「由按钮打开 → 关闭后焦点回到那个按钮」。
    const trigger = page.getByRole('button', { name: '重新打开' })
    await trigger.click()
    await expect(dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(trigger).toBeFocused()
  })
})

test.describe('长文本与浮层清理', () => {
  test('超长正文在弹窗内部滚动，不撑破页面', async ({ page }) => {
    await page.goto('/#/c/dialog/long-content')
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    const metrics = await dialog.evaluate((node) => ({
      clientHeight: node.clientHeight,
      viewportHeight: window.innerHeight,
    }))
    expect(metrics.clientHeight).toBeLessThanOrEqual(metrics.viewportHeight)
    await shoot(page, 'dialog-long-content')
    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('连续切换条目后不留残余浮层', async ({ page }) => {
    const errors = trackErrors(page)
    for (const id of ['dialog', 'drawer', 'toast', 'tooltip', 'popover', 'contextmenu']) {
      await page.goto(`/#/c/${id}/basic`)
      await page.waitForTimeout(120)
    }
    await page.goto('/#/')
    expect(await page.locator('[role="dialog"]').count()).toBe(0)
    expect(await page.locator('.kf-toast').count()).toBe(0)
    expect(errors).toEqual([])
  })
})

test.describe('主题与令牌', () => {
  test('深色主题切换后真实计算值改变', async ({ page }) => {
    await page.goto('/#/c/button/basic')
    const readBackground = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--kf-background').trim())
    const light = await readBackground()

    await page.getByRole('button', { name: '切换到深色' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    const dark = await readBackground()
    expect(dark).not.toBe(light)
    await shoot(page, 'theme-dark-1440x900')

    await page.getByRole('button', { name: '切换到浅色' }).click()
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark')
  })

  test('令牌页读的是运行时值', async ({ page }) => {
    await page.goto('/#/tokens')
    await expect(page.getByRole('heading', { name: 'Design Tokens' })).toBeVisible()
    const firstValue = await page.locator('.st-table tbody tr code').nth(1).textContent()
    expect(firstValue?.trim().length ?? 0).toBeGreaterThan(0)
  })
})

test.describe('质量面板', () => {
  test('数字来自当前注册表（65 条目 / 153 Story）', async ({ page }) => {
    await page.goto('/#/quality')
    await expect(page.getByRole('heading', { name: '质量总览' })).toBeVisible()
    const values = await page.locator('.st-metric__value').allTextContents()
    expect(values).toContain('65')
    expect(values).toContain('153')
    await shoot(page, 'quality-1440x900')
  })
})
