'use client'

/**
 * Assessment schedule as two HeroUI Pro DataGrids, per the docs:
 * https://heroui.pro/docs/react/components/data-grid. Data comes from
 * `data/assessment.json` so it can be updated each term without touching code.
 * Task ids are the row ids, keeping SSR/client hydration in sync. Must be a
 * client component because the column `cell` render functions can't cross the
 * RSC boundary.
 *
 * The first grid lists every task (segments in outline order, then bonus) and
 * lets students sort by key, marks, start or deadline. DataGrid sorts
 * client-side in uncontrolled mode using each column's `sortFn`; the default
 * sort by key is the outline order, so the grid opens exactly as the course
 * outline reads and one click on Key brings that order back.
 *
 * Subtotals and the 1,000 total live in a second, unsortable grid rather than
 * as rows in the first: summary rows mixed into a sortable list either break
 * the sort or get sorted into nonsense positions.
 */
import { Typography } from '@heroui/react'
import { DataGrid, type DataGridColumn } from '@heroui-pro/react'
import assessment from '@/data/assessment.json'

type Task = {
  id: string
  /** Short code students see and sort by, e.g. `tech-t-1`, `acc-t-2`. */
  key: string
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

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * `2026-09-14` -> `14 Sep`; anything that isn't an ISO date is shown as
 * written. Formatted by hand rather than through `Date`/`toLocaleDateString`,
 * which depend on the runtime's timezone and ICU data and would differ between
 * the SSR build and the browser.
 */
function formatDate(value: string): string {
  const match = ISO_DATE.exec(value)
  if (!match) return value
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12) return value
  return `${day} ${MONTHS[month - 1]}`
}

/** Thousands separator without `toLocaleString`, for the same hydration reason. */
function formatMarks(marks: number): string {
  return marks.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Raw marks scaled to the final grade: 1,000 base marks map to 100, so
 * 300 -> 30. Rounded to one decimal and shown without trailing zeros.
 */
function formatWeighted(marks: number): string {
  return String(Number(((marks / assessment.totalMarks) * 100).toFixed(1)))
}

/**
 * ISO dates compare as strings. Anything else (a TBC event) is treated as far
 * in the future, so it lands after every fixed date when sorting ascending.
 */
function dateKey(value: string): string {
  return ISO_DATE.test(value) ? value : '9999-99-99'
}

function compareDates(a: string, b: string): number {
  const [x, y] = [dateKey(a), dateKey(b)]
  return x < y ? -1 : x > y ? 1 : 0
}

/** A task plus the segment it belongs to and its position in the outline. */
type Entry = Task & {
  segment: string
  order: number
}

const segments = assessment.segments as Segment[]
const bonus = assessment.bonus as Task[]

const entries: Entry[] = [
  ...segments.flatMap((segment) =>
    segment.tasks.map((task) => ({ ...task, segment: segment.name })),
  ),
  ...bonus.map((task) => ({ ...task, segment: 'Optional bonus' })),
].map((entry, order) => ({ ...entry, order }))

/** Ties keep outline order so equal dates and marks stay predictable. */
function byOrder(compare: (a: Entry, b: Entry) => number) {
  return (a: Entry, b: Entry) => compare(a, b) || a.order - b.order
}

function Marks({ marks, note }: { marks: number; note?: string }) {
  return (
    <>
      {formatMarks(marks)}
      {note ? <span className="text-muted"> ({note})</span> : null}
    </>
  )
}

const taskColumns: DataGridColumn<Entry>[] = [
  {
    id: 'key',
    header: 'Key',
    accessorKey: 'key',
    allowsSorting: true,
    sortFn: (a, b) => a.order - b.order,
    cellClassName: 'font-mono text-sm whitespace-nowrap',
  },
  {
    id: 'segment',
    header: 'Segment',
    accessorKey: 'segment',
    cellClassName: 'text-muted',
  },
  {
    id: 'task',
    header: 'Task',
    accessorKey: 'task',
    isRowHeader: true,
  },
  {
    id: 'marks',
    header: 'Marks',
    allowsSorting: true,
    align: 'end',
    sortFn: byOrder((a, b) => a.marks - b.marks),
    cell: (entry) => <Marks marks={entry.marks} note={entry.marksNote} />,
    cellClassName: 'whitespace-nowrap',
  },
  {
    id: 'start',
    header: 'Start',
    allowsSorting: true,
    sortFn: byOrder((a, b) => compareDates(a.start, b.start)),
    cell: (entry) => formatDate(entry.start),
    cellClassName: 'whitespace-nowrap',
  },
  {
    id: 'deadline',
    header: 'Deadline',
    allowsSorting: true,
    sortFn: byOrder((a, b) => compareDates(a.deadline, b.deadline)),
    cell: (entry) => formatDate(entry.deadline),
    cellClassName: 'whitespace-nowrap',
  },
]

type SummaryRow = {
  id: string
  segment: string
  marks: number
  weight: string
}

const summaryRows: SummaryRow[] = [
  ...segments.map((segment) => ({
    id: segment.id,
    segment: segment.name,
    marks: segment.subtotal,
    weight: segment.weight,
  })),
  {
    id: 'total',
    segment: 'Total',
    marks: assessment.totalMarks,
    weight: '100%',
  },
]

const summaryColumns: DataGridColumn<SummaryRow>[] = [
  {
    id: 'segment',
    header: 'Segment',
    accessorKey: 'segment',
    isRowHeader: true,
  },
  {
    id: 'marks',
    header: 'Marks',
    align: 'end',
    cell: (row) => formatMarks(row.marks),
    cellClassName: 'whitespace-nowrap',
  },
  {
    id: 'weighted',
    header: 'After weighting',
    align: 'end',
    cell: (row) => formatWeighted(row.marks),
    cellClassName: 'whitespace-nowrap',
  },
  {
    id: 'weight',
    header: 'Weight',
    accessorKey: 'weight',
    align: 'end',
    cellClassName: 'whitespace-nowrap',
  },
]

export function AssessmentTable() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <DataGrid
          aria-label="Assessment tasks"
          columns={taskColumns}
          data={entries}
          getRowId={(entry) => entry.id}
          defaultSortDescriptor={{ column: 'key', direction: 'ascending' }}
        />
        <Typography type="body-sm" color="muted">
          Deadlines are 11:59 pm
          Sydney time unless the task is a scheduled event.
        </Typography>
      </div>
      <div className="flex flex-col gap-3">
        <Typography type="h2">Marks</Typography>
        <DataGrid
          aria-label="Marks by segment"
          columns={summaryColumns}
          data={summaryRows}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  )
}
