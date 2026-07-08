'use client'

/**
 * Weekly class timetable as a HeroUI Table, using the dynamic-collection API
 * (`columns` / `items` + render functions) per the docs:
 * https://heroui.com/docs/react/components/table. Data comes from
 * `data/timetable.json` so it can be updated each term without touching code.
 * Rows are sorted by weekday then start time; stable `id`s keep SSR/client
 * hydration in sync.
 */
import type { ReactNode } from 'react'
import { Table } from '@heroui/react'
import timetable from '@/data/timetable.json'

type ClassEntry = {
  code: string
  type: string
  stream: string
  day: string
  time: string
  location?: string
}

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

/** Turn "2:00 PM" into minutes since midnight for sorting. */
function toMinutes(time: string): number {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) return 0
  let hour = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') hour += 12
  return hour * 60 + Number(m[2])
}

type ColId = 'day' | 'time' | 'class' | 'type'
type Column = {
  id: ColId
  name: string
  isRowHeader?: boolean
  cellClassName?: string
}

const columns: Column[] = [
  {
    id: 'day',
    name: 'Day',
    isRowHeader: true,
    cellClassName: 'font-medium text-ink-strong whitespace-nowrap',
  },
  {
    id: 'time',
    name: 'Time',
    cellClassName: 'text-muted whitespace-nowrap font-mono text-sm',
  },
  { id: 'class', name: 'Class' },
  { id: 'type', name: 'Type' },
]

type Row = { id: string } & Record<ColId, ReactNode>

export function Timetable() {
  const rows: Row[] = [...(timetable.classes as ClassEntry[])]
    .sort(
      (a, b) =>
        DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) ||
        toMinutes(a.time) - toMinutes(b.time),
    )
    .map((cls) => ({
      id: cls.code,
      day: cls.day,
      time: cls.time,
      class: (
        <>
          <span className="font-mono text-sm text-ink-strong">{cls.code}</span>
          {cls.location ? (
            <span className="block text-xs text-muted mt-0.5">
              {cls.location}
            </span>
          ) : null}
        </>
      ),
      type: (
        <span
          className={
            'inline-block rounded-sm border px-2 py-0.5 text-xs font-medium ' +
            (cls.type === 'Lecture'
              ? 'border-accent bg-banner text-ink-strong'
              : 'border-subtle text-muted')
          }
        >
          {cls.type}
        </span>
      ),
    }))

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Weekly class timetable">
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
