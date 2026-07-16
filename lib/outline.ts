/**
 * The shape of the syllabus outline, and the conversions the builder needs.
 *
 * `data/syllabus.json` stores each week's `mle` outline the way it reads: a
 * list of sections, each a heading plus bullets, where a bullet is either a
 * plain string or an object carrying nested `children`. That nesting is right
 * for the file and for rendering, but it makes editing awkward — moving a
 * bullet up past a parent, or indenting one, means restructuring the tree.
 *
 * So the builder flattens bullets into `Row`s: text plus a `depth` of 0 or 1.
 * Reordering is then a swap in a flat list, and indent/outdent is `depth ± 1`.
 * `toRows` / `fromRows` convert at the edges (load and export), which keeps the
 * stored format untouched and the editing model simple.
 *
 * Nesting is capped at one level deep, because that is all the outline uses and
 * all a syllabus cell can render legibly.
 */

/** A bullet as stored in data/syllabus.json. */
export type Bullet = string | { text: string; children?: string[] }

/** A heading and its bullets, as stored. */
export type OutlineSection = {
  heading: string
  bullets: Bullet[]
}

export type Outline = {
  sections: OutlineSection[]
}

/** A session in the `accelerator` track (and the old `technical` one), as stored. */
export type Session = {
  topic: string
  detail: string
  people: string[]
  materials: { label: string; href: string }[]
}

export type WeekEntry = {
  week: number
  sprint: number | null
  /**
   * The old Engineering track. Present only until it is merged into `mle` and
   * pruned from the data; the builder treats its absence as "nothing left to
   * merge" rather than an error.
   */
  technical?: Session
  accelerator: Session
  mle: Outline
}

/** A bullet while it is being edited: flat, with an id for React keys. */
export type Row = {
  id: string
  text: string
  /** 0 is a top-level bullet, 1 is nested under the nearest preceding 0. */
  depth: 0 | 1
}

/** A section while it is being edited. */
export type DraftSection = {
  id: string
  heading: string
  rows: Row[]
}

export type DraftWeek = {
  week: number
  sprint: number | null
  sections: DraftSection[]
}

/**
 * Ids only have to be unique within a builder session and stable across a
 * render, so a counter is enough. It is seeded deterministically from the file
 * on first load, so the server and client agree; anything created after that is
 * client-only, by which point hydration is done.
 */
let counter = 0
export function nextId(prefix: string): string {
  counter += 1
  return `${prefix}-${counter}`
}

/** Stored bullets -> flat editable rows. */
export function toRows(bullets: Bullet[]): Row[] {
  const rows: Row[] = []
  for (const bullet of bullets) {
    if (typeof bullet === 'string') {
      rows.push({ id: nextId('row'), text: bullet, depth: 0 })
      continue
    }
    rows.push({ id: nextId('row'), text: bullet.text, depth: 0 })
    for (const child of bullet.children ?? []) {
      rows.push({ id: nextId('row'), text: child, depth: 1 })
    }
  }
  return rows
}

/**
 * Flat editable rows -> stored bullets. A depth-1 row attaches to the last
 * depth-0 bullet; one leading the list has nothing to attach to, so it is
 * promoted rather than dropped. Empty text is dropped, since a blank row is a
 * half-finished edit and not content.
 */
export function fromRows(rows: Row[]): Bullet[] {
  const bullets: Bullet[] = []
  for (const row of rows) {
    const text = row.text.trim()
    if (!text) continue

    const last = bullets.at(-1)
    if (row.depth === 0 || last === undefined) {
      bullets.push(text)
      continue
    }

    // Re-open the last bullet as an object so it can hold children.
    const parent = typeof last === 'string' ? { text: last, children: [] } : last
    parent.children = [...(parent.children ?? []), text]
    bullets[bullets.length - 1] = parent
  }
  return bullets
}

export function toDraft(weeks: WeekEntry[]): DraftWeek[] {
  return weeks.map((entry) => ({
    week: entry.week,
    sprint: entry.sprint,
    sections: entry.mle.sections.map((section) => ({
      id: nextId('section'),
      heading: section.heading,
      rows: toRows(section.bullets),
    })),
  }))
}

/** A draft week back to the `mle` value that belongs in data/syllabus.json. */
export function fromDraft(week: DraftWeek): Outline {
  return {
    sections: week.sections
      .filter((section) => section.heading.trim() || section.rows.length)
      .map((section) => ({
        heading: section.heading.trim(),
        bullets: fromRows(section.rows),
      })),
  }
}

/**
 * The whole `weeks` array with each week's `mle` replaced by the draft, ready
 * to paste over data/syllabus.json. The other tracks pass through untouched:
 * the builder edits the outline, not the source material beside it.
 */
export function toSyllabusWeeks(
  weeks: WeekEntry[],
  draft: DraftWeek[],
): WeekEntry[] {
  return weeks.map((entry) => {
    const week = draft.find((d) => d.week === entry.week)
    return week ? { ...entry, mle: fromDraft(week) } : entry
  })
}

/**
 * A session's detail split into one candidate bullet per sentence, so prose
 * written for the old column can be pulled across a clause at a time rather
 * than as one long bullet. Splits on sentence ends only where a capital or a
 * digit follows, which keeps "i.e." and "e.g." intact.
 */
export function toCandidateBullets(detail: string): string[] {
  return detail
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
    .map((part) => part.trim().replace(/\.$/, ''))
    .filter(Boolean)
}
