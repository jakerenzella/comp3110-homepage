'use client'

import { useState } from 'react'
import { Tabs } from '@heroui/react'
import { ProjectCard } from './project-card'
import type { Entry, ProjectFrontmatter } from '@/lib/content'

/**
 * Client-side year filter for the projects gallery. Receives all projects as
 * plain data and renders the matching cards for the selected year tab.
 */
export function YearTabs({
  projects,
  years,
}: {
  projects: Entry<ProjectFrontmatter>[]
  years: number[]
}) {
  const [selected, setSelected] = useState<string>('all')

  const groups: { id: string; label: string; items: Entry<ProjectFrontmatter>[] }[] = [
    { id: 'all', label: 'All', items: projects },
    ...years.map((year) => ({
      id: String(year),
      label: String(year),
      items: projects.filter((p) => p.frontmatter.year === year),
    })),
  ]

  return (
    <Tabs
      selectedKey={selected}
      onSelectionChange={(key) => setSelected(String(key))}
    >
      <Tabs.List className="mb-6 flex gap-6 border-b border-subtle">
        {groups.map((g) => (
          <Tabs.Tab
            key={g.id}
            id={g.id}
            className="cursor-pointer pb-2 -mb-px text-sm font-semibold text-muted border-b-2 border-transparent outline-none data-[selected=true]:text-ink-strong data-[selected=true]:border-accent"
          >
            {g.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {groups.map((g) => (
        <Tabs.Panel key={g.id} id={g.id}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {g.items.map((p) => (
              <ProjectCard key={p.slug} entry={p} />
            ))}
          </div>
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}
