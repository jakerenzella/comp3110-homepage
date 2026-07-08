/**
 * Project gallery card. Presentational — safe to render from both server pages
 * and the client-side year-filter tabs. Links to the project detail page.
 */
import Link from 'next/link'
import Image from 'next/image'
import { Chip } from '@heroui/react'
import type { Entry, ProjectFrontmatter } from '@/lib/content'

export function ProjectCard({ entry }: { entry: Entry<ProjectFrontmatter> }) {
  const { slug, frontmatter: fm } = entry
  return (
    <Link
      href={`/projects/${slug}`}
      className="group flex flex-col border border-subtle bg-surface rounded-sm overflow-hidden hover:border-ink-strong transition-colors"
    >
      {fm.cover ? (
        <div className="relative aspect-video w-full border-b border-subtle bg-paper">
          <Image
            src={fm.cover}
            alt=""
            width={800}
            height={450}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink-strong leading-snug">
            {fm.title}
          </h3>
          <span className="font-mono text-xs text-muted shrink-0 pt-1">
            {fm.year}
          </span>
        </div>
        {fm.award ? (
          <Chip color="accent" variant="soft" size="sm">
            {fm.award}
          </Chip>
        ) : null}
        <p className="text-sm text-muted">{fm.team.join(', ')}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {fm.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-xs text-muted border border-subtle rounded-sm px-1.5 py-0.5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
