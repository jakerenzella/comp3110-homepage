/**
 * Mentor card: avatar fallback, name, affiliation/role, expertise, bio, and
 * links supplied by the mentor.
 */
import { Avatar, buttonVariants, Chip, Typography } from '@heroui/react'
import { course } from '@/data/course'
import type { Entry, MentorFrontmatter } from '@/lib/content'

function initials(name: string) {
  const parts = name.split(' ').filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase()
}

export function MentorCard({
  entry,
}: {
  entry: Entry<MentorFrontmatter> & { bioHtml?: string }
}) {
  const { frontmatter: fm, body } = entry
  return (
    <div className="flex flex-col gap-3 border border-subtle bg-surface rounded-sm p-5">
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {fm.photo ? <Avatar.Image src={fm.photo} alt="" /> : null}
          <Avatar.Fallback>{initials(fm.name)}</Avatar.Fallback>
        </Avatar>
        <div>
          <Typography type="body" weight="semibold" className="leading-tight">
            {fm.name}
          </Typography>
          <Typography type="body-sm" color="muted">
            {fm.role} · {fm.affiliation}
          </Typography>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {fm.expertise.map((tag) => (
          <Chip key={tag} variant="soft" size="sm">
            {tag}
          </Chip>
        ))}
      </div>
      <Typography type="body-sm" color="muted">
        {body.trim()}
      </Typography>
      <div className="mt-auto flex flex-wrap items-center gap-3">
        {Object.entries(fm.links ?? {}).map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="capitalize font-medium text-ink-strong underline decoration-accent decoration-2 underline-offset-2 hover:decoration-ink-strong"
          >
            {label}
          </a>
        ))}
        <a
          href={course.mentorBookingUrl}
          className={buttonVariants({ size: 'sm' })}
        >
          Book a session
        </a>
      </div>
    </div>
  )
}
