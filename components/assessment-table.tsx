'use client'

/**
 * Assessment schedule as a HeroUI Table, using the dynamic-collection API
 * (`columns` on Header, `items` on Body with render functions) per the docs:
 * https://heroui.com/docs/react/components/table. Data comes from
 * `data/assessment.json` so it can be updated each term without touching code.
 * Task ids are the row `id`s, keeping SSR/client hydration in sync. Must be a
 * client component because the render-function children can't cross the RSC
 * boundary.
 *
 * Rows are the tasks in segment order, with a subtotal row closing each
 * segment, a total row for the 1,000 base marks, and any bonus tasks after
 * that. Subtotal and total rows are set in a heavier weight with a rule above
 * them, so the table reads as three blocks that add up rather than one long
 * list.
 */
import type { ReactNode } from 'react'
import { Table } from '@heroui/react'
import assessment from '@/data/assessment.json'

type Task = {
  id: string
  task: string
  marks: number
  /** Text shown beside the mark, e.g. "required" for a 0-mark hurdle. */
  marksNote?: string
  /** ISO `YYYY-MM-DD`, or plain text for a date not yet fixed. */
  start: string
  deadline: string
}

type Segment = {
  id: string
  name: string
  subtotal: number
  weight: string
  tasks: Task[]
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * `2026-09-14` -> `14 Sep`; anything that isn't an ISO date is shown as
 * written. Formatted by hand rather than through `Date`/`toLocaleDateString`,
 * which depend on the runtime's timezone and ICU data and would differ between
 * the SSR build and the browser.
 */
function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12) return value
  return `${day} ${MONTHS[month - 1]}`
}

/**
 * Every fixed deadline falls at the end of the day in Sydney, so the time is
 * appended here rather than stored per task: `2026-09-20` -> `20 Sep, 11:59 pm`.
 * Plain-text deadlines (e.g. a TBC event) are shown as written.
 */
const DEADLINE_TIME = '11:59 pm'

function formatDeadline(value: string): string {
  const date = formatDate(value)
  return date === value ? value : `${date}, ${DEADLINE_TIME}`
}

/** Thousands separator without `toLocaleString`, for the same hydration reason. */
function formatMarks(marks: number): string {
  return marks.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

type ColId = 'segment' | 'task' | 'marks' | 'start' | 'deadline'
type Column = {
  id: ColId
  name: string
  isRowHeader?: boolean
  cellClassName?: string
}

const columns: Column[] = [
  { id: 'segment', name: 'Segment', cellClassName: 'whitespace-nowrap' },
  { id: 'task', name: 'Task', isRowHeader: true },
  { id: 'marks', name: 'Marks', cellClassName: 'text-end whitespace-nowrap' },
  { id: 'start', name: 'Start', cellClassName: 'whitespace-nowrap' },
  { id: 'deadline', name: 'Deadline (Sydney time)', cellClassName: 'whitespace-nowrap' },
]

// The marks header sits over right-aligned numbers, so it aligns the same way.
const HEADER_CLASS: Partial<Record<ColId, string>> = { marks: 'text-end' }

type Row = {
  id: string
  /** Subtotal and total rows: heavier text, rule above. */
  summary?: boolean
} & Record<ColId, ReactNode>

function Marks({ marks, note }: { marks: number; note?: string }) {
  return (
    <>
      {formatMarks(marks)}
      {note ? <span className="text-muted"> ({note})</span> : null}
    </>
  )
}

function taskRow(segment: string, task: Task): Row {
  return {
    id: task.id,
    segment: <span className="text-muted">{segment}</span>,
    task: task.task,
    marks: <Marks marks={task.marks} note={task.marksNote} />,
    start: formatDate(task.start),
    deadline: formatDeadline(task.deadline),
  }
}

function summaryRow(id: string, label: string, marks: number, weight: string): Row {
  return {
    id,
    summary: true,
    segment: label,
    task: null,
    marks: <Marks marks={marks} note={weight} />,
    start: null,
    deadline: null,
  }
}

const segments = assessment.segments as Segment[]
const bonus = assessment.bonus as Task[]

const rows: Row[] = [
  ...segments.flatMap((segment) => [
    ...segment.tasks.map((task) => taskRow(segment.name, task)),
    summaryRow(
      `${segment.id}-subtotal`,
      `${segment.name} subtotal`,
      segment.subtotal,
      segment.weight,
    ),
  ]),
  summaryRow('total', 'Total', assessment.totalMarks, '100%'),
  ...bonus.map((task) => taskRow('Optional bonus', task)),
]

export function AssessmentTable() {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Assessment schedule">
          <Table.Header columns={columns}>
            {(column) => (
              <Table.Column
                isRowHeader={column.isRowHeader}
                className={HEADER_CLASS[column.id]}
              >
                {column.name}
              </Table.Column>
            )}
          </Table.Header>
          <Table.Body items={rows}>
            {(row) => (
              <Table.Row
                className={
                  row.summary
                    ? 'border-t border-subtle font-medium text-ink-strong'
                    : undefined
                }
              >
                <Table.Collection items={columns}>
                  {(column) => (
                    <Table.Cell className={column.cellClassName}>
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
  )
}
