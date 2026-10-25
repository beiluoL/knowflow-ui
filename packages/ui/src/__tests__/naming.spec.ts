/**
 * 命名规范守门测试。
 *
 * 这不是「文案测试」：它直接读磁盘上的 SFC 源码，解析 class 与 CSS 选择器，
 * 用组件文件名推导出的 block 名做 BEM 校验。新增组件若写错类名会立刻失败。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, expectTypeOf, it } from 'vitest'

import * as publicApi from '../index'
import type {
  ButtonSize,
  KfButtonEmits,
  KfButtonProps,
  KfCheckboxEmits,
  KfCheckboxProps,
  KfIconProps,
  KfInputEmits,
  KfInputProps,
} from '../index'

const SRC_ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')
const COMPONENTS_DIR = path.join(SRC_ROOT, 'components')

/* ---------- 文件遍历 ---------- */

function walk(dir: string): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

const componentFiles = walk(COMPONENTS_DIR)
const vueFiles = componentFiles.filter((file) => file.endsWith('.vue'))
const cssFiles = componentFiles.filter((file) => file.endsWith('.css'))

/** 由组件文件名推导 CSS block 名：KfButton.vue → kf-button */
const BLOCKS = vueFiles.map((file) =>
  path
    .basename(file, '.vue')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase(),
)

/* ---------- 类名提取 ---------- */

function styleBlocks(source: string): string {
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
}

function templateBody(source: string): string {
  return [...source.matchAll(/<template>([\s\S]*)<\/template>/g)].map((m) => m[1]).join('\n')
}

/** 从 CSS 选择器中提取 .kf-* 类名 */
function cssClassSelectors(css: string): string[] {
  return [...css.matchAll(/\.(kf-[a-z0-9_-]+)/g)].map((m) => m[1])
}

/** 从模板中提取 kf-* 类名（静态 class + :class 对象/数组字面量） */
function templateClassNames(template: string): string[] {
  const names = new Set<string>()
  for (const match of template.matchAll(/class="([^"]*)"/g)) {
    for (const token of match[1].split(/\s+/)) {
      if (token.startsWith('kf-')) names.add(token)
    }
  }
  for (const match of template.matchAll(/['"](kf-[a-z0-9_-]+)['"]/g)) {
    names.add(match[1])
  }
  return [...names]
}

/** BEM 校验：block / block__element / block--modifier / block__element--modifier */
function isBemCompliant(token: string): boolean {
  // Vue <Transition> 按 name 生成 `.kf-x-enter-active`，无法写成 BEM；
  // 这是框架契约而不是我们自定义的类名，因此单独放行这一种后缀模式。
  const isTransitionSuffix = (rest: string): boolean => /^-(enter|leave)(-(active|from|to))?$/.test(rest)
  const isBemSuffix = (rest: string): boolean =>
    /^(__[a-z0-9]+(?:-[a-z0-9]+)*)?(--[a-z0-9]+(?:-[a-z0-9]+)*)?$/.test(rest)

  const candidates = BLOCKS.filter(
    (candidate) => token === candidate || token.startsWith(`${candidate}-`) || token.startsWith(`${candidate}__`),
  ).sort((a, b) => b.length - a.length)

  // 逐个尝试最长前缀：`kf-input-group__addon` 会先命中 kf-input-group 而不是 kf-input
  for (const block of candidates) {
    const rest = token.slice(block.length)
    if (!rest || isTransitionSuffix(rest) || isBemSuffix(rest)) return true
  }
  return false
}

/* ---------- 用例 ---------- */

describe('命名规范 · 文件与目录', () => {
  it('所有组件文件名为 Kf + PascalCase', () => {
    const bad = vueFiles.filter((file) => !/^Kf[A-Z][A-Za-z0-9]*\.vue$/.test(path.basename(file)))
    expect(bad.map((file) => path.relative(SRC_ROOT, file))).toEqual([])
  })

  it('每个组件目录都有 index.ts，且从自己的 SFC 导出', () => {
    const dirs = [...new Set(vueFiles.map((file) => path.dirname(file)))]
    const missing: string[] = []
    for (const dir of dirs) {
      const indexPath = path.join(dir, 'index.ts')
      if (!fs.existsSync(indexPath)) {
        missing.push(`${path.relative(SRC_ROOT, dir)}/index.ts`)
        continue
      }
      const content = fs.readFileSync(indexPath, 'utf8')
      const vue = path.basename(vueFiles.find((file) => path.dirname(file) === dir) ?? '')
      if (!content.includes(vue)) missing.push(`${path.relative(SRC_ROOT, indexPath)} 未导出 ${vue}`)
    }
    expect(missing).toEqual([])
  })

  it('block 名与组件文件一一对应，且不存在重复 block', () => {
    // 不再硬编码组件数量：新增组件时这条仍然有效，但 block 撞名（例如 KfTab 与 KfTabs
    // 同时存在导致 .kf-tabs__x 归错 block）会立刻暴露。
    expect(new Set(BLOCKS).size).toBe(BLOCKS.length)
    expect(BLOCKS).toEqual(
      expect.arrayContaining([
        'kf-button',
        'kf-icon',
        'kf-input',
        'kf-checkbox',
        'kf-form-field',
        'kf-select',
        'kf-dialog',
        'kf-toast',
      ]),
    )
  })
})

describe('命名规范 · CSS 命名空间与 BEM', () => {
  it('样式与模板中的类名全部符合 kf- 命名空间 + BEM', () => {
    const violations: string[] = []
    for (const file of vueFiles) {
      const source = fs.readFileSync(file, 'utf8')
      const rel = path.relative(SRC_ROOT, file)
      const tokens = [...cssClassSelectors(styleBlocks(source)), ...templateClassNames(templateBody(source))]
      for (const token of new Set(tokens)) {
        if (!isBemCompliant(token)) violations.push(`${rel}: ${token}`)
      }
    }
    for (const file of cssFiles) {
      const rel = path.relative(SRC_ROOT, file)
      for (const token of new Set(cssClassSelectors(fs.readFileSync(file, 'utf8')))) {
        if (!isBemCompliant(token)) violations.push(`${rel}: ${token}`)
      }
    }
    expect(violations).toEqual([])
  })

  it('组件包内不出现 kb- 类名（旧命名空间已彻底下线）', () => {
    const leftovers: string[] = []
    for (const file of [...vueFiles, ...cssFiles]) {
      const source = fs.readFileSync(file, 'utf8')
      const css = `${styleBlocks(source)}\n${file.endsWith('.css') ? source : ''}`
      for (const match of css.matchAll(/\.(kb-[a-z0-9_-]+)/g)) {
        leftovers.push(`${path.relative(SRC_ROOT, file)}: ${match[1]}`)
      }
    }
    expect(leftovers).toEqual([])
  })

  it('组件内 CSS 变量统一 --kf- 命名空间（允许 --kf-field-* 令牌组）', () => {
    const bad: string[] = []
    for (const file of vueFiles) {
      const css = styleBlocks(fs.readFileSync(file, 'utf8'))
      for (const match of css.matchAll(/(?<![\w-])(--[a-z][a-z0-9-]*)\s*:/g)) {
        if (!match[1].startsWith('--kf-')) bad.push(`${path.relative(SRC_ROOT, file)}: ${match[1]}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('不出现全局 outline: none（只在具体元素上归零）', () => {
    const bad: string[] = []
    for (const file of vueFiles) {
      const css = styleBlocks(fs.readFileSync(file, 'utf8'))
      if (/(^|\})\s*\*\s*\{[^}]*outline\s*:\s*(none|0)/.test(css)) {
        bad.push(`${path.relative(SRC_ROOT, file)}: 通配选择器上出现 outline: none`)
      }
    }
    expect(bad).toEqual([])
  })
})

describe('命名规范 · TypeScript 导出', () => {
  it('公共组件以 Kf + PascalCase 导出，且与全局注册表完全一致', () => {
    const isComponent = (value: unknown): boolean =>
      typeof value === 'object' && value !== null && ('render' in value || 'setup' in value || '__name' in value)

    const componentExports = Object.entries(publicApi)
      .filter(([key, value]) => /^Kf[A-Z]/.test(key) && isComponent(value))
      .map(([key]) => key)
      .sort()

    // 单一事实来源：根入口导出的组件 == KF_COMPONENTS 里注册的组件。
    // 少导一个（宿主 import 不到）或多导一个（未注册、文档对不上）都会失败。
    expect(componentExports).toEqual(Object.keys(publicApi.KF_COMPONENTS).sort())
  })

  it('不以 K / Know / Flow 或无前缀导出组件', () => {
    const suspicious = Object.keys(publicApi).filter(
      (key) => /^(Button|Input|Checkbox|Icon|Dialog)$/.test(key) || /^Know[A-Z]/.test(key),
    )
    expect(suspicious).toEqual([])
  })

  it('Props / Emits 类型按 Kf + PascalCase + Props / Emits 导出并可被引用', () => {
    expectTypeOf<KfButtonProps['size']>().toEqualTypeOf<ButtonSize | undefined>()
    expectTypeOf<KfButtonEmits['click']>().toEqualTypeOf<[event: MouseEvent]>()
    expectTypeOf<KfIconProps['name']>().toMatchTypeOf<string>()
    expectTypeOf<KfInputProps['modelValue']>().toEqualTypeOf<string | number | undefined>()
    expectTypeOf<KfInputEmits['update:modelValue']>().toEqualTypeOf<[value: string]>()
    expectTypeOf<KfCheckboxProps['as']>().toEqualTypeOf<'label' | 'span' | undefined>()
    expectTypeOf<KfCheckboxEmits<boolean>['update:modelValue']>().toEqualTypeOf<[value: boolean]>()
  })

  it('插件与版本号同样从根入口导出，标签名由注册表推导', () => {
    expect(typeof publicApi.KfPlugin.install).toBe('function')
    expect(publicApi.version).toBe('0.2.0')
    const kebab = Object.keys(publicApi.KF_COMPONENTS).map((name) =>
      name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase(),
    )
    expect([...publicApi.KF_TAGS].sort()).toEqual(kebab.sort())
  })
})
