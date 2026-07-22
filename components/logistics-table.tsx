'use client'

/**
 * Course logistics as a HeroUI Table, using the dynamic-collection API
 * (`columns` on Header, `items` on Body with render functions) as documented:
 * https://heroui.com/docs/react/components/table. Stable `id`s on columns and
 * rows give react-aria deterministic keys, so SSR and client hydration match.
 * Must be a client component because the render-function children can't cross
 * the RSC boundary.
 */
import type { ReactNode } from 'react'
import { Link, Table } from '@heroui/react'
import type { LogisticsLine } from '@/data/course'
import { course } from '@/data/course'
import timetable from '@/data/timetable.json'
import { Icon } from './icon'

/** A logistics line renders as text, or as a link when the data gives an href. */
function Line({ line }: { line: LogisticsLine }) {
  if (typeof line === 'string') return <>{line}</>
  return <Link href={line.href}>{line.text}</Link>
}

// Live lecture time(s) from the timetable drive the "Lectures" row.
const lectureLine = timetable.classes
  .filter((c) => c.type === 'Lecture')
  .map((c) => `${c.day} ${c.time}`)
  .join(', ')

type Column = {
  id: 'item' | 'details'
  name: string
  isRowHeader?: boolean
  cellClassName?: string
}

const columns: Column[] = [
  {
    id: 'item',
    name: 'Item',
    isRowHeader: true,
    cellClassName: 'whitespace-nowrap align-top',
  },
  { id: 'details', name: 'Details', cellClassName: 'text-muted align-top' },
]

type Row = { id: string; item: ReactNode; details: ReactNode }

const rows: Row[] = course.logistics.map((entry) => {
  const value =
    entry.label === 'Lectures' && lectureLine ? lectureLine : entry.value
  return {
    id: entry.label,
    item: (
      <span className="flex items-center gap-2 font-semibold text-ink-strong">
        <Icon name={entry.icon} size={18} className="text-muted" />
        {entry.label}
      </span>
    ),
    details: Array.isArray(value) ? (
      <ul className="list-disc pl-5 space-y-1">
        {value.map((v) => (
          <li key={typeof v === 'string' ? v : v.href}>
            <Line line={v} />
          </li>
        ))}
      </ul>
    ) : (
      <Line line={value} />
    ),
  }
})

export function LogisticsTable() {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Course logistics">
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
