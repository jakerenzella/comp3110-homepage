'use client'

/**
 * Projects gallery tabs: "2026" (the first cohort — coming soon) and "Sample"
 * (the sample projects shipped with the site). Uses HeroUI's default Tabs
 * styling (a sliding segmented-pill indicator) with no overrides.
 */
import { useState } from 'react'
import { Tabs } from '@heroui/react'
import { EmptyState } from '@heroui-pro/react'
import { ProjectCard } from './project-card'
import { Icon } from './icon'
import type { Entry, ProjectFrontmatter } from '@/lib/content'

const TABS = [
  { id: '2026', label: '2026' },
  { id: 'sample', label: 'Sample' },
]

export function ProjectTabs({
  projects,
}: {
  projects: Entry<ProjectFrontmatter>[]
}) {
  const [selected, setSelected] = useState<string>('2026')

  return (
    <Tabs
      variant="secondary"
      selectedKey={selected}
      onSelectionChange={(key) => setSelected(String(key))}
    >
      <Tabs.List className="mb-6">
        {TABS.map((t) => (
          <Tabs.Tab key={t.id} id={t.id}>
            {t.label}
            <Tabs.Indicator />
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel id="2026">
        <EmptyState>
          <EmptyState.Media>
            <Icon name="rocket" size={24} />
          </EmptyState.Media>
          <EmptyState.Header>
            <EmptyState.Title>First cohort coming soon</EmptyState.Title>
            <EmptyState.Description>
              COMP3110&rsquo;s first cohort runs in 2026. Team projects will be
              showcased here after Demo Day.
            </EmptyState.Description>
          </EmptyState.Header>
        </EmptyState>
      </Tabs.Panel>

      <Tabs.Panel id="sample">
        <p className="text-muted mb-6 max-w-2xl">
          Sample projects that illustrate the kind of deployed machine learning
          systems teams build across the term.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {projects.map((p) => (
            <ProjectCard key={p.slug} entry={p} />
          ))}
        </div>
      </Tabs.Panel>
    </Tabs>
  )
}
