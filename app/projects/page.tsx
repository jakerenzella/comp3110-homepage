import type { Metadata } from 'next'
import { getProjects } from '@/lib/content'
import { ProjectTabs } from '@/components/project-tabs'

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Deployed machine learning systems built by COMP3110 teams and showcased at Demo Day.',
}

export default function ProjectsPage() {
  const projects = getProjects()

  return (
    <div className="doc-column py-10 md:py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight text-ink-strong">
          Projects
        </h1>
        <p className="text-xl text-muted leading-relaxed max-w-2xl">
          Every team ships a deployed machine learning system and presents it at
          Demo Day. Here is a selection of past work.
        </p>
      </header>
      <ProjectTabs projects={projects} />
    </div>
  )
}
