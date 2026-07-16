'use client'

/**
 * Weekly syllabus as a HeroUI Table, using the dynamic-collection API
 * (`columns` / `items` + render functions) per the docs:
 * https://heroui.com/docs/react/components/table. Data comes from
 * `data/syllabus.json` so it can be updated each term without touching code.
 * The week number is the row `id`, keeping SSR/client hydration in sync.
 *
 * Two tracks, side by side: the Technical column (the `mle` field in the data)
 * and the Accelerator strand, so a week reads across as the pair of sessions it
 * is. The Technical column keeps the course outline's shape (headings with
 * bullets); the Accelerator column is topic-plus-sentence. Materials live inside
 * the accelerator cell rather than in a column of their own, since a link
 * belongs to one session and not to the week.
 *
 * The old "Engineering" column (`technical`) was merged into `mle` via the
 * syllabus builder and has been pruned from the data.
 *
 * Weeks that belong to an accelerator sprint carry a coloured stripe down the
 * left edge, keyed to the legend below the table. The stripe is a left border
 * on the first cell rather than on the row: `<tr>` borders don't render under
 * the table's collapsed borders.
 */
import type { ReactNode } from 'react'
import { Fragment } from 'react'
import { Table, Typography } from '@heroui/react'
import Link from 'next/link'
import syllabus from '@/data/syllabus.json'
import { PersonChip } from './person-chip'

type Material = {
  label: string
  href: string
}

type Sprint = {
  id: number
  name: string
  when: string
}

/** One track's session in a given week. */
type Session = {
  topic: string
  detail: string
  people: string[]
  materials: Material[]
}

/** A bullet in the MLE outline: plain text, or text with a nested list. */
type Bullet = string | { text: string; children?: string[] }

/** One heading of the MLE outline and the bullets under it. */
type OutlineSection = {
  heading: string
  bullets: Bullet[]
}

type Outline = {
  sections: OutlineSection[]
}

type WeekEntry = {
  week: number
  sprint: number | null
  accelerator: Session
  mle: Outline
}

/**
 * Sprint id -> stripe / swatch classes. Written out in full because Tailwind
 * only compiles class names it can see as complete strings.
 */
const SPRINT_STRIPE: Record<number, string> = {
  1: 'border-l-4 border-l-sprint-1',
  2: 'border-l-4 border-l-sprint-2',
  3: 'border-l-4 border-l-sprint-3',
}

const SPRINT_SWATCH: Record<number, string> = {
  1: 'bg-sprint-1',
  2: 'bg-sprint-2',
  3: 'bg-sprint-3',
}

type ColId = 'week' | 'accelerator' | 'mle'
type Column = {
  id: ColId
  name: string
  isRowHeader?: boolean
  cellClassName?: string
}

const columns: Column[] = [
  {
    id: 'week',
    name: 'Week',
    isRowHeader: true,
    cellClassName: 'font-mono text-sm text-ink-strong whitespace-nowrap align-top',
  },
  { id: 'mle', name: 'Technical', cellClassName: 'align-top' },
  { id: 'accelerator', name: 'Accelerator', cellClassName: 'align-top' },
]

type Row = { id: number; stripeClassName: string } & Record<ColId, ReactNode>

/** Topic, reading "Topic by <person>" when someone leads the session, then the
 *  detail sentence and any materials. */
function SessionCell({ session }: { session: Session }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Typography type="body-sm" weight="medium">
        {session.topic}
        {session.people.length ? (
          <>
            {' by '}
            {session.people.map((id, i) => (
              <Fragment key={id}>
                {i === 0
                  ? null
                  : i === session.people.length - 1
                    ? ' and '
                    : ', '}
                <PersonChip id={id} />
              </Fragment>
            ))}
          </>
        ) : null}
      </Typography>
      <Typography type="body-sm" color="muted">
        {session.detail}
      </Typography>
      {session.materials.length ? (
        <ul className="flex flex-col gap-1">
          {session.materials.map((m) => (
            <li key={m.href}>
              <Link
                href={m.href}
                className="text-sm text-ink-strong underline underline-offset-2 hover:no-underline"
              >
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

/** The MLE outline for a week: each heading followed by its bullets, kept as
 *  the outline writes them rather than flattened into a sentence. Bullets may
 *  carry one level of nesting. */
function OutlineCell({ outline }: { outline: Outline }) {
  if (!outline.sections.length) return null
  return (
    <div className="flex flex-col gap-3">
      {outline.sections.map((section) => (
        <div key={section.heading} className="flex flex-col gap-1.5">
          <Typography type="body-sm" weight="medium">
            {section.heading}
          </Typography>
          {section.bullets.length ? (
            <ul className="flex list-disc flex-col gap-0.5 pl-4">
              {section.bullets.map((bullet) => {
                const { text, children } =
                  typeof bullet === 'string' ? { text: bullet, children: undefined } : bullet
                return (
                  <li key={text}>
                    <Typography type="body-sm" color="muted">
                      {text}
                    </Typography>
                    {children?.length ? (
                      <ul className="mt-0.5 flex list-[circle] flex-col gap-0.5 pl-4">
                        {children.map((child) => (
                          <li key={child}>
                            <Typography type="body-sm" color="muted">
                              {child}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/** Key for the row stripes: a swatch in each sprint's colour, its name, and its
 *  week range. */
function SprintLegend({ sprints }: { sprints: Sprint[] }) {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2">
      {sprints.map((sprint) => (
        <li key={sprint.id} className="flex items-center gap-2">
          {/* Matches the row stripe: same 4px width, so the key reads as the
              same mark it explains. */}
          <span
            aria-hidden="true"
            className={`h-3.5 w-1 ${SPRINT_SWATCH[sprint.id] ?? ''}`}
          />
          <Typography type="body-sm">
            {sprint.name}
            <span className="text-muted"> · {sprint.when}</span>
          </Typography>
        </li>
      ))}
    </ul>
  )
}

export function SyllabusTable() {
  const sprints = syllabus.sprints as Sprint[]

  const rows: Row[] = (syllabus.weeks as WeekEntry[]).map((entry) => {
    const sprint = sprints.find((s) => s.id === entry.sprint)
    return {
      id: entry.week,
      stripeClassName:
        entry.sprint === null ? '' : (SPRINT_STRIPE[entry.sprint] ?? ''),
      week: (
        <>
          {entry.week}
          {sprint ? <span className="sr-only"> ({sprint.name})</span> : null}
        </>
      ),
      accelerator: <SessionCell session={entry.accelerator} />,
      mle: <OutlineCell outline={entry.mle} />,
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <Table>
        <Table.ScrollContainer>
          <Table.Content aria-label="Weekly syllabus">
            <Table.Header columns={columns}>
              {(column) => (
                <Table.Column isRowHeader={column.isRowHeader}>
                  {column.name}
                </Table.Column>
              )}
            </Table.Header>
            <Table.Body items={rows}>
              {(row) => (
                <Table.Row>
                  <Table.Collection items={columns}>
                    {(column) => (
                      <Table.Cell
                        className={[
                          column.cellClassName,
                          column.id === 'week' ? row.stripeClassName : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {row[column.id]}
                      </Table.Cell>
                    )}
                  </Table.Collection>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <SprintLegend sprints={sprints} />
    </div>
  )
}
