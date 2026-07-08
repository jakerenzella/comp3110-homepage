import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Chip } from '@heroui/react'
import { getProject, getProjects } from '@/lib/content'
import { Mdx } from '@/components/mdx'
import { Icon } from '@/components/icon'

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: project.frontmatter.title,
    description: `${project.frontmatter.title} — a COMP3110 team project (${project.frontmatter.year}).`,
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()
  const fm = project.frontmatter

  return (
    <div className="doc-column py-10 md:py-14">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink-strong mb-8"
      >
        <Icon name="arrow-right" size={14} className="rotate-180" />
        All projects
      </Link>

      <header className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-3 font-mono text-xs text-muted">
          <span>{fm.year}</span>
          {fm.award ? (
            <Chip color="accent" variant="soft" size="sm">
              {fm.award}
            </Chip>
          ) : null}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-ink-strong">
          {fm.title}
        </h1>
        <p className="text-muted">
          <span className="font-medium text-ink-strong">Team:</span>{' '}
          {fm.team.join(', ')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {fm.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-xs text-muted border border-subtle rounded-sm px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
        {(fm.demo || fm.repo) && (
          <div className="flex flex-wrap gap-4 text-sm">
            {fm.demo ? (
              <a
                href={fm.demo}
                className="inline-flex items-center gap-1.5 font-semibold text-ink-strong underline decoration-accent decoration-2 underline-offset-4"
              >
                Live demo <Icon name="external" size={14} />
              </a>
            ) : null}
            {fm.repo ? (
              <a
                href={fm.repo}
                className="inline-flex items-center gap-1.5 font-semibold text-ink-strong underline decoration-accent decoration-2 underline-offset-4"
              >
                Repository <Icon name="external" size={14} />
              </a>
            ) : null}
          </div>
        )}
      </header>

      {fm.cover ? (
        <div className="relative aspect-video w-full border border-subtle rounded-sm overflow-hidden mb-10 bg-paper">
          <Image
            src={fm.cover}
            alt=""
            width={800}
            height={450}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <Mdx source={project.body} />
    </div>
  )
}
