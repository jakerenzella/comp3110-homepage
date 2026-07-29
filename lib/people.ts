/**
 * The people named in the syllabus (guest lecturers, session leads), read from
 * `data/people.json`.
 *
 * Kept out of `components/person-chip.tsx` so both sides can use it: the chip is
 * a client component, and every export of a "use client" module is a client
 * reference, so the server-rendered /people page could not call `getPerson`
 * from there.
 */
import people from '@/data/people.json'

export type Person = {
  id: string
  name: string
  role: string
  affiliation: string
  bio: string
  achievements: string[]
  photo: string | null
  /** Optional link to the person's own page elsewhere (their site, LinkedIn,
   *  their employer's staff page). Not their profile on this site. */
  href: string | null
}

const PEOPLE = people.people as Person[]

/** Everyone in the file, in the order it lists them. */
export function getPeople(): Person[] {
  return PEOPLE
}

export function getPerson(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id)
}

/** Where a person's name links to: their card on the People page. The id is the
 *  card's anchor, so the syllabus and the page can't disagree about the URL. */
export function personHref(id: string): string {
  return `/people#${id}`
}

/** Initials for the avatar fallback. Honorifics are dropped so "Ms Natasha
 *  Banks" initials as NB, not MB. */
export function initials(name: string): string {
  const parts = name
    .split(' ')
    .filter(Boolean)
    .filter((p) => !/^(mr|ms|mrs|miss|mx|dr|prof|professor|a\/prof)\.?$/i.test(p))
  return ((parts[0]?.[0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase()
}

/** The line under the name: role and affiliation, either of which may be blank. */
export function subtitle(person: Person): string {
  return [person.role, person.affiliation].filter(Boolean).join(' · ')
}
