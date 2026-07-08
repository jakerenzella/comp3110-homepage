'use client'

/**
 * Weekly class timetable, rendered from `data/timetable.json` so it can be
 * updated each term without touching code. Rows are sorted by weekday then
 * start time. Uses the HeroUI `Table` component (like all other tables on the
 * site) — see components/mdx-table.tsx for the MDX equivalent.
 */
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

export function Timetable() {
  const classes = [...(timetable.classes as ClassEntry[])].sort(
    (a, b) =>
      DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day) ||
      toMinutes(a.time) - toMinutes(b.time),
  )

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Weekly class timetable">
          <Table.Header>
            <Table.Column isRowHeader>Day</Table.Column>
            <Table.Column>Time</Table.Column>
            <Table.Column>Class</Table.Column>
            <Table.Column>Type</Table.Column>
          </Table.Header>
          <Table.Body>
            {classes.map((cls) => (
              <Table.Row key={cls.code}>
                <Table.Cell className="font-medium text-ink-strong whitespace-nowrap">
                  {cls.day}
                </Table.Cell>
                <Table.Cell className="text-muted whitespace-nowrap font-mono text-sm">
                  {cls.time}
                </Table.Cell>
                <Table.Cell>
                  <span className="font-mono text-sm text-ink-strong">
                    {cls.code}
                  </span>
                  {cls.location ? (
                    <span className="block text-xs text-muted mt-0.5">
                      {cls.location}
                    </span>
                  ) : null}
                </Table.Cell>
                <Table.Cell>
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
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  )
}
