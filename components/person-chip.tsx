'use client'

/**
 * A person named in the syllabus, rendered inline as part of the sentence that
 * names them, and revealing a profile on hover or keyboard focus: avatar, role
 * and affiliation, bio, achievements, and a link to their page. People come
 * from `data/people.json`, keyed by the ids the syllabus references, so a name
 * only needs writing once.
 *
 * The name reads as running text rather than a Chip, so a sentence like "Topic
 * by <name>" stays a sentence. A dotted accent underline is the only mark that
 * it is interactive, and it goes solid on hover.
 *
 * The trigger is a real <button> (or a link, when the person has an `href`) so
 * the card is reachable by keyboard, not just by pointer: HoverCard opens on
 * focus, and a focusable child is what makes that fire.
 */
import { useRef, useState } from 'react'
import { Avatar, Typography } from '@heroui/react'
import { HoverCard } from '@heroui-pro/react'
import Link from 'next/link'
import people from '@/data/people.json'

export type Person = {
  id: string
  name: string
  role: string
  affiliation: string
  bio: string
  achievements: string[]
  photo: string | null
  href: string | null
}

const PEOPLE = people.people as Person[]

export function getPerson(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id)
}

function initials(name: string) {
  // Drop honorifics so "Ms Natasha Banks" initials as NB, not MB.
  const parts = name
    .split(' ')
    .filter(Boolean)
    .filter((p) => !/^(mr|ms|mrs|miss|mx|dr|prof|professor|a\/prof)\.?$/i.test(p))
  return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase()
}

function subtitle(person: Person) {
  return [person.role, person.affiliation].filter(Boolean).join(' · ')
}

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
      {person.href ? (
        <Link
          href={person.href}
          className="text-xs font-medium text-ink-strong underline decoration-accent decoration-2 underline-offset-2 hover:decoration-ink-strong"
        >
          View profile
        </Link>
      ) : null}
    </div>
  )
}

export function PersonChip({ id }: { id: string }) {
  const triggerRef = useRef<HTMLElement>(null)
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

  // Inherits the surrounding type, so the name sits in the sentence rather than
  // on top of it.
  const triggerClassName =
    'font-medium text-ink-strong underline decoration-accent decoration-dotted decoration-2 underline-offset-2 hover:decoration-solid'

  return (
    <HoverCard
      open={open}
      onOpenChange={handleOpenChange}
      openDelay={200}
      closeDelay={150}
    >
      <HoverCard.Trigger>
        {person.href ? (
          <Link
            ref={triggerRef as React.Ref<HTMLAnchorElement>}
            href={person.href}
            aria-label={`${person.name}, ${subtitle(person)}`}
            className={triggerClassName}
          >
            {person.name}
          </Link>
        ) : (
          <button
            ref={triggerRef as React.Ref<HTMLButtonElement>}
            type="button"
            className={`cursor-help text-left ${triggerClassName}`}
          >
            {person.name}
          </button>
        )}
      </HoverCard.Trigger>
      <HoverCard.Content placement="top">
        <PersonProfile person={person} />
        <HoverCard.Arrow />
      </HoverCard.Content>
    </HoverCard>
  )
}
