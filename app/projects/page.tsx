import type { Metadata } from 'next'
import { Typography } from '@heroui/react'
import {
  DemoDayProjects,
  type DemoDayProject,
} from '@/components/demo-day-projects'
import projects2026t3Data from '@/data/projects-2026t3.json'

const projects2026t3: DemoDayProject[] = projects2026t3Data

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Deployed machine learning systems built by COMP3110 teams and showcased at Demo Day.',
}

export default function ProjectsPage() {
  return (
    <div className="doc-column py-10 md:py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Typography type="h1">Projects</Typography>
        <Typography type="body" color="muted" className="max-w-2xl">
          Congratulations to our first COMP3110 cohort who presented their
          projects at the UNSW CSE COMP3110 Demo Day on Monday November 23.
        </Typography>
      </header>
      <section className="flex flex-col gap-5">
        <Typography type="h2">2026 Term 3</Typography>
        <DemoDayProjects projects={projects2026t3} />
      </section>
    </div>
  )
}
