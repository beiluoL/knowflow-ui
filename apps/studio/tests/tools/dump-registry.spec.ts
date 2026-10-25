import { it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { ENTRIES, CATEGORIES, entryStats } from '../../src/registry/entries'
import { STORIES, storyStats, storyCountByComponent } from '../../src/registry/stories'
import { buildQualityReport } from '../../src/registry/quality'

/** 一次性工具：把注册表导出成 JSON，供 docs 生成脚本使用。不参与日常测试。 */
it('dump registry', () => {
  const out = path.resolve(__dirname, '../../../../artifacts/registry-dump.json')
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(
    out,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        categories: CATEGORIES,
        entryStats: entryStats(),
        storyStats: storyStats(),
        storyCountByComponent,
        quality: buildQualityReport(),
        entries: ENTRIES.map((entry) => ({
          id: entry.id,
          name: entry.name,
          title: entry.title,
          category: entry.category,
          status: entry.status,
          components: entry.components,
          packageName: entry.packageName,
          source: entry.source,
          description: entry.description,
          props: entry.props.map((spec) => ({
            name: spec.name,
            type: spec.type,
            default: spec.default,
            editable: spec.editable,
            options: spec.options,
            sourceDefault: spec.sourceDefault,
          })),
          events: entry.events,
          slots: entry.slots,
          variants: entry.variants,
          a11y: entry.a11y,
          designSpecs: entry.designSpecs,
          interactiveStory: entry.interactiveStory,
        })),
        stories: STORIES.map((story) => ({
          storyId: story.storyId,
          componentId: story.componentId,
          title: story.title,
          category: story.category,
          props: Object.keys(story.initialProps),
          slots: Object.keys(story.slots),
          interaction: story.interaction,
        })),
      },
      null,
      2,
    )}\n`,
  )
  console.log(`dumped ${ENTRIES.length} entries / ${STORIES.length} stories → ${out}`)
})
