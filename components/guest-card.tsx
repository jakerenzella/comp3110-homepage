'use client'

/**
 * Guest lecturer card for the People page, from `data/people.json`. Shares the
 * shell of `mentor-card.tsx` so the two sections of the page read as one set,
 * with achievements where a mentor has expertise chips.
 *
 * The card carries the person's id as its DOM id: the syllabus links names to
 * `/people#<id>` (see `lib/people.ts`), so this is the thing that gets scrolled
 * to. `scroll-mt-24` keeps it clear of the sticky navbar.
 *
 * Bios arrive at whatever length the person sent, and a card that runs to a
 * paragraph makes the section hard to scan, so the bio is clamped to four lines
 * with a chevron beside the "More about" link to open it and shut it again.
 * Client-side because the toggle holds state and because whether a bio is
 * actually cut off can only be measured once it has been laid out.
 */
import { useEffect, useRef, useState } from 'react'
import { Avatar, Typography } from '@heroui/react'
import Link from 'next/link'
import { type Person, initials, subtitle } from '@/lib/people'
import { Icon } from './icon'

export function GuestCard({ person }: { person: Person }) {
  const bioRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [isClamped, setIsClamped] = useState(false)

  /**
   * Show the toggle only when the clamp is actually hiding something. A short
   * bio needs no control, and how many lines a bio takes depends on the card's
   * width, so this is measured rather than guessed from the character count:
   * the same bio wraps past four lines in one column and not in two.
   *
   * Nothing to measure while expanded, and the answer is already known then, so
   * the effect leaves `isClamped` alone and the toggle stays put.
   */
  useEffect(() => {
    const el = bioRef.current
    if (!el || expanded) return
    const measure = () => setIsClamped(el.scrollHeight > el.clientHeight + 1)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [expanded])

  const bioId = `${person.id}-bio`

  return (
    <div
      id={person.id}
      className="flex scroll-mt-24 flex-col gap-3 rounded-sm border border-subtle bg-surface p-5"
    >
      <div className="flex items-center gap-3">
        <Avatar size="lg">
          {person.photo ? <Avatar.Image src={person.photo} alt="" /> : null}
          <Avatar.Fallback>{initials(person.name)}</Avatar.Fallback>
        </Avatar>
        <div>
          <Typography type="body" weight="semibold" className="leading-tight">
            {person.name}
          </Typography>
          {subtitle(person) ? (
            <Typography type="body-sm" color="muted">
              {subtitle(person)}
            </Typography>
          ) : null}
        </div>
      </div>
      {person.bio ? (
        <Typography
          ref={bioRef}
          id={bioId}
          type="body-sm"
          color="muted"
          className={expanded ? undefined : 'line-clamp-4'}
        >
          {person.bio}
        </Typography>
      ) : null}
      {person.achievements.length ? (
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {person.achievements.map((item) => (
            <li key={item}>
              <Typography type="body-sm" color="muted">
                {item}
              </Typography>
            </li>
          ))}
        </ul>
      ) : null}
      {person.href || isClamped ? (
        <div className="flex items-center gap-3">
          {person.href ? (
            <Link
              href={person.href}
              className="text-sm font-medium text-ink-strong underline decoration-accent decoration-2 underline-offset-2 hover:decoration-ink-strong"
            >
              More about {person.name}
            </Link>
          ) : null}
          {isClamped ? (
            <button
              type="button"
              onClick={() => setExpanded((open) => !open)}
              aria-expanded={expanded}
              aria-controls={bioId}
              aria-label={
                expanded
                  ? `Hide the rest of ${person.name}'s bio`
                  : `Read all of ${person.name}'s bio`
              }
              title={expanded ? 'Show less' : 'Read full bio'}
              // `ml-auto` rather than `justify-between` on the row, so the
              // chevron sits at the card's right edge whether or not the "More
              // about" link is there to sit opposite.
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
      ) : null}
    </div>
  )
}
