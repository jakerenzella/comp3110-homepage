'use client'

/**
 * A person named in the syllabus, rendered inline as part of the sentence that
 * names them, and revealing a profile on hover or keyboard focus: avatar, role
 * and affiliation, bio, achievements, and a link to their own page. People come
 * from `data/people.json`, keyed by the ids the syllabus references, so a name
 * only needs writing once.
 *
 * The name reads as running text rather than a Chip, so a sentence like "Topic
 * by <name>" stays a sentence. A dotted accent underline is the only mark that
 * it is interactive, and it goes solid on hover.
 *
 * The trigger is a link to the person's card on /people, so the card is
 * reachable by keyboard, not just by pointer: HoverCard opens on focus, and a
 * focusable child is what makes that fire. The hover card is the summary; the
 * page is where the full profile and everyone else lives.
 */
import { useRef, useState } from 'react'
import { Avatar, Typography } from '@heroui/react'
import { HoverCard } from '@heroui-pro/react'
import Link from 'next/link'
import {
  type Person,
  getPerson,
  initials,
  personHref,
  subtitle,
} from '@/lib/people'

function PersonProfile({ person }: { person: Person }) {
  return (
    <div className="flex w-72 flex-col gap-3 p-4">
      <div className="flex items-center gap-3">
        <Avatar size="md">
          {person.photo ? <Avatar.Image src={person.photo} alt="" /> : null}
          <Avatar.Fallback>{initials(person.name)}</Avatar.Fallback>
        </Avatar>
        <div>
          <Typography type="body-sm" weight="semibold" className="leading-tight">
            {person.name}
          </Typography>
          {subtitle(person) ? (
            <Typography type="body-xs" color="muted">
              {subtitle(person)}
            </Typography>
          ) : null}
        </div>
      </div>
      {person.bio ? (
        <Typography type="body-xs" color="muted">
          {person.bio}
        </Typography>
      ) : null}
      {person.achievements.length ? (
        <ul className="flex list-disc flex-col gap-1 pl-4">
          {person.achievements.map((item) => (
            <li key={item}>
              <Typography type="body-xs" color="muted">
                {item}
              </Typography>
            </li>
          ))}
        </ul>
      ) : null}
      <Link
        href={personHref(person.id)}
        className="text-xs font-medium text-ink-strong underline decoration-accent decoration-2 underline-offset-2 hover:decoration-ink-strong"
      >
        View profile
      </Link>
    </div>
  )
}

export function PersonChip({ id }: { id: string }) {
  const triggerRef = useRef<HTMLAnchorElement>(null)
  const [open, setOpen] = useState(false)
  const person = getPerson(id)

  // An id with no entry in people.json still has to render something readable,
  // so fall back to the raw id rather than dropping the person from the week.
  if (!person) {
    return <span className="font-medium">{id}</span>
  }

  /**
   * Only open for a pointer actually over the chip, or a keyboard focus on it.
   *
   * The card is inside a react-aria Table cell, and clicking a cell moves focus
   * to that cell's only focusable child — this trigger. That focus would
   * otherwise open the card from a click anywhere in the cell, well away from
   * the name. A click-driven focus is not `:focus-visible`, and the pointer is
   * not over the chip, so both checks fail and the card stays shut.
   */
  const handleOpenChange = (next: boolean) => {
    const el = triggerRef.current
    if (next && el && !el.matches(':hover') && !el.matches(':focus-visible')) {
      return
    }
    setOpen(next)
  }

  return (
    <HoverCard
      open={open}
      onOpenChange={handleOpenChange}
      openDelay={200}
      closeDelay={150}
    >
      <HoverCard.Trigger>
        <Link
          ref={triggerRef}
          href={personHref(person.id)}
          aria-label={`${person.name}, ${subtitle(person)}`}
          // Inherits the surrounding type, so the name sits in the sentence
          // rather than on top of it.
          className="font-medium text-ink-strong underline decoration-accent decoration-dotted decoration-2 underline-offset-2 hover:decoration-solid"
        >
          {person.name}
        </Link>
      </HoverCard.Trigger>
      <HoverCard.Content placement="top">
        <PersonProfile person={person} />
        <HoverCard.Arrow />
      </HoverCard.Content>
    </HoverCard>
  )
}
