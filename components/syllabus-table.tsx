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
 * bullets), with the headings showing and their bullets folded into an
 * accordion; the Accelerator column is topic-plus-sentence. Materials live inside
 * the accelerator cell rather than in a column of their own, since a link
 * belongs to one session and not to the week.
 *
 * Weeks that belong to an accelerator sprint carry a coloured stripe down the
 * left edge, keyed to the legend below the table. The stripe is a left border
 * on the first cell rather than on the row: `<tr>` borders don't render under
 * the table's collapsed borders.
 */
import type { ReactNode } from 'react'
import { Fragment } from 'react'
import { Accordion, Table, Typography } from '@heroui/react'
import Link from 'next/link'
import syllabus from '@/data/syllabus.json'
import { Icon } from './icon'
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

/** One heading of the MLE outline and the bullets under it. `slides` / `notes`
 *  are the topic's lecture materials, null until they are published. */
type OutlineSection = {
  heading: string
  slides?: string | null
  notes?: string | null
  bullets: Bullet[]
}

/** The week's guest lecture. Shaped like an `OutlineSection` where it has to be
 *  (a title and the same two material links) and like a `Session` where the
 *  content is: a sentence and the people giving it. */
type GuestLecture = {
  topic: string
  detail: string
  people: string[]
  slides?: string | null
  notes?: string | null
}

type Outline = {
  sections: OutlineSection[]
  guest?: GuestLecture | null
}

type WeekEntry = {
  week: number
  /** Monday of the week, ISO `YYYY-MM-DD`. Optional so a term without dates
   *  filled in still renders. */
  starts?: string
  sprint: number | null
  /** Null for a week with no accelerator session. */
  accelerator: Session | null
  mle: Outline
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * `2026-09-14` -> `14 Sep`. Parsed and formatted by hand rather than through
 * `Date`/`toLocaleDateString`: those depend on the runtime's timezone and ICU
 * data, which differ between the SSR build and the browser and would show up as
 * a hydration mismatch.
 */
function formatWeekStart(iso: string | undefined): string | null {
  if (!iso) return null
  const [, month, day] = iso.split('-').map(Number)
  if (!month || !day || month < 1 || month > 12) return null
  return `${day} ${MONTHS[month - 1]}`
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
  { id: 'mle', name: 'Lecture Content', cellClassName: 'align-top' },
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

/**
 * Width of the icon gutter: two 16px icons with a 8px gap, then 14px of air
 * before the heading text. Written out as Tailwind classes rather than measured
 * at runtime, and kept next to each other so the gutter and the indent that
 * clears it can't drift apart.
 */
const GUTTER = 'gap-2' // between the two icons
const GUTTER_GAP = 'gap-3.5' // between the icons and the heading text
const GUTTER_INDENT = 'pl-13.5' // 16 + 8 + 16 + 14 = 54px

/**
 * The slides / notes pair that sits to the left of an outline heading. Both
 * icons always show, so a reader learns where the materials for a topic will
 * appear: an unpublished one is greyed out and inert rather than missing, and
 * carries a `title` for the hover explanation. It's hidden from screen readers,
 * since "slides, not published" is noise on every heading in the table.
 *
 * Aligned to the first line of the heading (`mt-1.5` = the trigger's 4px of
 * padding plus half a 20px line, less half the icon) rather than centred on the
 * whole heading, so the icons stay level with the text when a long heading
 * wraps to two lines.
 *
 * A published link opens in a new tab: these are PDFs and slide decks, and the
 * table is a thing you read down while opening several of them, so navigating
 * away from it is the wrong default. The label says so, since a link that
 * behaves unexpectedly should announce it.
 */
function SectionMaterials({
  title,
  slides,
  notes,
}: {
  /** What the links are for, used in their labels: a heading or a guest topic. */
  title: string
  slides?: string | null
  notes?: string | null
}) {
  const links = [
    { glyph: 'slides', label: 'Slides', href: slides },
    { glyph: 'notes', label: 'Notes', href: notes },
  ] as const
  return (
    <span className={`mt-1.5 flex shrink-0 items-center ${GUTTER}`}>
      {links.map(({ glyph, label, href }) =>
        href ? (
          <Link
            key={glyph}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label}: ${title} (opens in a new tab)`}
            title={`${label}: ${title}`}
            className="text-muted hover:text-ink-strong"
          >
            <Icon name={glyph} size={16} />
          </Link>
        ) : (
          <span
            key={glyph}
            aria-hidden="true"
            title={`${label} not published yet`}
            className="text-muted opacity-35"
          >
            <Icon name={glyph} size={16} />
          </span>
        ),
      )}
    </span>
  )
}

/** The bullets under one outline heading, kept as the outline writes them
 *  rather than flattened into a sentence. Bullets may carry one level of
 *  nesting. */
function BulletList({ bullets }: { bullets: Bullet[] }) {
  return (
    <ul className="flex list-disc flex-col gap-0.5 pl-4">
      {bullets.map((bullet) => {
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
  )
}

/**
 * The week's guest lecture, under a rule that separates it from the course's
 * own outline above: same icon gutter and same fold-away detail, but the
 * visible line names who is giving it.
 *
 * The name is a `PersonChip`, so it keeps its dotted underline and hover
 * profile. That makes it a link, which is why the topic line sits beside the
 * trigger rather than inside it: a link nested in a button is neither valid
 * HTML nor reachable. The trigger shrinks to the chevron at the right, and the
 * topic line takes the space, so the chevron still lines up with the ones above.
 */
function GuestLectureRow({ guest }: { guest: GuestLecture }) {
  return (
    <div className="mt-2 border-t border-subtle pt-2">
      <Accordion hideSeparator>
        <Accordion.Item id={guest.topic}>
          <Accordion.Heading className={`items-start ${GUTTER_GAP}`}>
            <SectionMaterials
              title={guest.topic}
              slides={guest.slides}
              notes={guest.notes}
            />
            <span className="flex-1 py-1 text-sm font-medium">
              {guest.topic}
              {guest.people.length ? (
                <>
                  {' by '}
                  {guest.people.map((id, i) => (
                    <Fragment key={id}>
                      {i === 0
                        ? null
                        : i === guest.people.length - 1
                          ? ' and '
                          : ', '}
                      <PersonChip id={id} />
                    </Fragment>
                  ))}
                </>
              ) : null}
            </span>
            <Accordion.Trigger
              className="flex-none px-0 py-1"
              aria-label={`What ${guest.topic} covers`}
            >
              <Accordion.Indicator />
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className={`pr-0 pb-2 ${GUTTER_INDENT}`}>
              <Typography type="body-sm" color="muted">
                {guest.detail}
              </Typography>
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

/**
 * Sections split into consecutive runs of "has bullets" / "doesn't", so a
 * heading with nothing under it (a break week) stays plain text instead of
 * becoming a trigger that opens onto nothing, without the outline's order
 * changing. Runs rather than a filter because an Accordion's items have to be
 * its direct children: a bulletless section can't sit inside one.
 */
function groupSections(sections: OutlineSection[]) {
  const groups: { collapsible: boolean; sections: OutlineSection[] }[] = []
  for (const section of sections) {
    const collapsible = section.bullets.length > 0
    const last = groups.at(-1)
    if (last?.collapsible === collapsible) last.sections.push(section)
    else groups.push({ collapsible, sections: [section] })
  }
  return groups
}

/**
 * The MLE outline for a week. The headings stay on the page as the week's
 * summary; their bullets fold away behind them, so the table reads as a
 * schedule first and detail on request. `allowsMultipleExpanded` so opening one
 * heading doesn't shut another: the headings within a week are read together,
 * not chosen between.
 *
 * Padding is trimmed off the trigger and body (the defaults are sized for a
 * standalone accordion, not a table cell) and separators are hidden, since the
 * row borders already divide the content.
 */
function OutlineCell({ outline }: { outline: Outline }) {
  if (!outline.sections.length && !outline.guest) return null
  return (
    <div className="flex flex-col gap-1.5">
      {groupSections(outline.sections).map((group) =>
        group.collapsible ? (
          <Accordion
            key={group.sections[0].heading}
            allowsMultipleExpanded
            hideSeparator
          >
            {group.sections.map((section) => (
              <Accordion.Item key={section.heading} id={section.heading}>
                {/* The material links sit in the heading beside the trigger,
                    not inside it: a link nested in a button is neither valid
                    HTML nor reachable. */}
                <Accordion.Heading className={`items-start ${GUTTER_GAP}`}>
                  <SectionMaterials
                    title={section.heading}
                    slides={section.slides}
                    notes={section.notes}
                  />
                  <Accordion.Trigger className="gap-3 px-0 py-1">
                    {section.heading}
                    <Accordion.Indicator />
                  </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                  {/* Indented past the icon gutter, so the bullets keep the
                      same offset from their heading as they had before. */}
                  <Accordion.Body className={`pr-0 pb-2 ${GUTTER_INDENT}`}>
                    <BulletList bullets={section.bullets} />
                  </Accordion.Body>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <Fragment key={group.sections[0].heading}>
            {group.sections.map((section) => (
              // Indented like the headings that do have icons, so every
              // heading in the column starts at the same edge.
              <Typography
                key={section.heading}
                type="body-sm"
                weight="medium"
                className={`py-1 ${GUTTER_INDENT}`}
              >
                {section.heading}
              </Typography>
            ))}
          </Fragment>
        ),
      )}
      {outline.guest ? <GuestLectureRow guest={outline.guest} /> : null}
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
    const starts = formatWeekStart(entry.starts)
    return {
      id: entry.week,
      stripeClassName:
        entry.sprint === null ? '' : (SPRINT_STRIPE[entry.sprint] ?? ''),
      week: (
        // Week number over its start date, so the column reads as one label.
        <div className="flex flex-col gap-0.5">
          <span>{entry.week}</span>
          {starts ? <span className="text-xs text-muted">{starts}</span> : null}
          {sprint ? <span className="sr-only">({sprint.name})</span> : null}
        </div>
      ),
      accelerator: entry.accelerator ? (
        <SessionCell session={entry.accelerator} />
      ) : null,
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
