/**
 * Mentor card: avatar, name, affiliation/role, expertise chips, and short bio.
 * Presentational (rendered from the server /mentors page).
 */
import { Avatar, Chip, Typography } from '@heroui/react'
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
      {fm.links ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {Object.entries(fm.links).map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="capitalize font-medium text-ink-strong underline decoration-accent decoration-2 underline-offset-2 hover:decoration-ink-strong"
            >
              {label}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
