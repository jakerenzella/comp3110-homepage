/**
 * Weekly class timetable, rendered from `data/timetable.json` so it can be
 * updated each term without touching code. Rows are sorted by weekday then
 * start time. Server-rendered (no client JS).
 */
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
    <div className="border border-subtle rounded-sm bg-surface overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-subtle text-xs uppercase tracking-wider text-muted">
            <th className="font-semibold p-4">Day</th>
            <th className="font-semibold p-4">Time</th>
            <th className="font-semibold p-4">Class</th>
            <th className="font-semibold p-4">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle">
          {classes.map((cls) => (
            <tr key={cls.code} className="align-top">
              <td className="p-4 font-medium text-ink-strong whitespace-nowrap">
                {cls.day}
              </td>
              <td className="p-4 text-muted whitespace-nowrap font-mono text-sm">
                {cls.time}
              </td>
              <td className="p-4">
                <span className="font-mono text-sm text-ink-strong">
                  {cls.code}
                </span>
                {cls.location ? (
                  <span className="block text-xs text-muted mt-0.5">
                    {cls.location}
                  </span>
                ) : null}
              </td>
              <td className="p-4">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
