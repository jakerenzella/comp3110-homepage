'use client'

/**
 * Mentor card for the People page, from `content/mentors/*.mdx`: name,
 * role and affiliation, expertise chips, a bio, and a row of the mentor's own
 * links beside the shared "Book a session" button. No photo: mentors send a
 * bio and links, not a headshot, so a column of initials would only add noise.
 *
 * Bios arrive at whatever length the mentor wrote, and a grid of cards only
 * reads as a set when the bios stop at the same line, so the bio is clamped to
 * three lines with a chevron to open it and shut it again. The toggle is only
 * shown when the clamp is actually hiding text, which has to be measured after
 * layout: the same bio wraps past three lines in one column and not in two.
 * Client-side for that state and that measurement.
 *
 * The action row leads with the shared "Book a session" button (the thing a
 * student is here to do), then the mentor's own links as icons: the two
 * mentors send are LinkedIn and a personal site, which the icons name on their
 * own, so a labelled row would be no clearer and much wider.
 */
import { useEffect, useRef, useState } from 'react'
import { buttonVariants, Chip, Link, Typography } from '@heroui/react'
import { course } from '@/data/course'
import type { Entry, MentorFrontmatter } from '@/lib/content'
import { Icon, type IconGlyph } from './icon'

/** Icon and spoken label for each kind of link a mentor's frontmatter carries. */
const LINK_KINDS: Record<string, { icon: IconGlyph; label: string }> = {
  linkedin: { icon: 'linkedin', label: 'LinkedIn' },
  website: { icon: 'globe', label: 'website' },
}

export function MentorCard({ entry }: { entry: Entry<MentorFrontmatter> }) {
  const { frontmatter: fm, body, slug } = entry
  const bioRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)

  useEffect(() => {
    const el = bioRef.current
    if (!el || expanded) return
    const measure = () => setIsClamped(el.scrollHeight > el.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded])

  const bioId = `${slug}-bio`
  const links = Object.entries(fm.links ?? {})

  return (
    <div className="flex flex-col gap-3 rounded-sm border border-subtle bg-surface p-5">
      <div>
        <Typography type="body" weight="semibold" className="leading-tight">
          {fm.name}
        </Typography>
        <Typography type="body-sm" color="muted" className="leading-snug">
          {fm.role}
        </Typography>
        <Typography type="body-sm" color="muted" className="leading-snug">
          {fm.affiliation}
        </Typography>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {fm.expertise.map((tag) => (
          <Chip key={tag} variant="soft" size="sm">
            {tag}
          </Chip>
        ))}
      </div>
      <Typography
        ref={bioRef}
        id={bioId}
        type="body-sm"
        color="muted"
        className={`leading-snug ${expanded ? '' : 'line-clamp-3'}`}
      >
        {body.trim()}
      </Typography>
      <div className="mt-auto flex items-center gap-1">
        <a
          href={course.mentorBookingUrl}
          target="_blank"
          rel="noreferrer"
          className={`${buttonVariants({ size: 'sm' })} ${links.length ? 'mr-1' : ''}`}
        >
          Book a session
        </a>
        {links.map(([kind, href]) => {
          const { icon, label } = LINK_KINDS[kind] ?? { icon: 'link', label: kind }
          return (
            <Link
              key={kind}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${fm.name}'s ${label}`}
              className="p-1.5 text-muted hover:text-ink-strong"
            >
              <Icon name={icon} size={18} />
            </Link>
          )
        })}
        {isClamped ? (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            aria-controls={bioId}
            aria-label={
              expanded
                ? `Hide the rest of ${fm.name}'s bio`
                : `Read all of ${fm.name}'s bio`
            }
            title={expanded ? 'Show less' : 'Read full bio'}
            className="ml-auto text-muted hover:text-ink-strong"
          >
            <Icon
              name="chevron-down"
              size={16}
              className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        ) : null}
      </div>
    </div>
  )
}
