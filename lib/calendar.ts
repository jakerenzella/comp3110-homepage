/**
 * iCalendar (RFC 5545) feeds for the course, generated at build time from the
 * same JSON that drives the site, so the calendar can never disagree with the
 * assessment and syllabus pages:
 *
 * - data/timetable.json: weekly lecture and lab times, class length, and any
 *   cancelled dates (public holidays).
 * - data/syllabus.json: which Mondays are teaching weeks, and each week's
 *   topics (used as the lecture title and description).
 * - data/assessment.json: task deadlines, emitted as all-day events.
 *
 * One feed per Lab stream (lecture + deadlines + that lab) plus a lecture-only
 * feed. Students subscribe to the URL; their calendar app re-fetches it on its
 * own schedule and replaces the events wholesale. Every event carries a stable
 * UID derived from the task id or class code + date, so an edited deadline
 * moves the existing event rather than duplicating it, and a removed task
 * disappears.
 *
 * All times are Sydney local time, declared with an embedded VTIMEZONE so that
 * the daylight-saving change (first Sunday in October) is handled by the
 * client. Served by app/calendar/[feed]/route.ts.
 */
import { course } from '@/data/course'
import timetable from '@/data/timetable.json'
import syllabus from '@/data/syllabus.json'
import assessment from '@/data/assessment.json'

type ClassEntry = {
  code: string
  type: string
  stream: string
  /** myUNSW section code, e.g. `M14A`. */
  section: string
  day: string
  time: string
  durationMinutes: number
  location?: string
}

type Cancelled = { date: string; reason: string }

type Week = {
  week: number
  starts: string
  teaching?: boolean
  event?: { topic: string; detail: string } | null
  accelerator?: { topic: string; detail: string } | null
  mle: {
    sections: { heading: string }[]
    guest: { topic: string } | null
  }
}

type Task = {
  id: string
  key: string
  task: string
  marks: number
  marksNote?: string
  start: string
  deadline: string
}

type Segment = { id: string; name: string; tasks: Task[] }

export type Feed = {
  /** URL slug, e.g. `lecture` or `lab-01`; served as `/calendar/<id>.ics`. */
  id: string
  /** Shown in the picker, e.g. "Lab 01 (Monday 2:00 PM)". */
  label: string
  /** Calendar name shown in the student's app. */
  name: string
  /** Class codes included, alongside the deadlines. */
  classes: ClassEntry[]
}

const TZID = 'Australia/Sydney'
const classes = timetable.classes as ClassEntry[]
const cancelled = (timetable.cancelled ?? []) as Cancelled[]
const weeks = syllabus.weeks as Week[]

const lectures = classes.filter((c) => c.type === 'Lecture')
const labs = classes.filter((c) => c.type === 'Lab')

/** The feeds on offer: lecture only, then one per lab stream. */
export const feeds: Feed[] = [
  {
    id: 'lecture',
    label: 'Lectures only (no lab)',
    name: `${course.code} lectures and deadlines`,
    classes: lectures,
  },
  ...labs.map((lab) => ({
    id: `lab-${lab.stream.toLowerCase()}`,
    label: `Lab ${lab.stream}, ${lab.section} (${lab.day} ${lab.time})`,
    name: `${course.code} with Lab ${lab.stream}`,
    classes: [...lectures, lab],
  })),
]

export function feedPath(feed: Feed): string {
  return `/calendar/${feed.id}.ics`
}

/* ---------- date helpers (no Date-with-timezone, all string arithmetic) ---------- */

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** `2026-09-14` plus n days, as an ISO date. Uses UTC so no DST slippage. */
function addDays(iso: string, n: number): string {
  const m = ISO_DATE.exec(iso)
  if (!m) throw new Error(`Not an ISO date: ${iso}`)
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + n))
  return d.toISOString().slice(0, 10)
}

/** `2026-09-14` -> `20260914`. */
function compact(iso: string): string {
  return iso.replace(/-/g, '')
}

/** `2:00 PM` -> minutes since midnight. */
function toMinutes(time: string): number {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!m) throw new Error(`Not a clock time: ${time}`)
  let hour = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') hour += 12
  return hour * 60 + Number(m[2])
}

/** Local date-time in iCalendar form, `20260914T110000`, for a TZID property. */
function localDateTime(iso: string, minutes: number): string {
  const dayCarry = Math.floor(minutes / (24 * 60))
  const rem = minutes - dayCarry * 24 * 60
  const hh = String(Math.floor(rem / 60)).padStart(2, '0')
  const mm = String(rem % 60).padStart(2, '0')
  return `${compact(addDays(iso, dayCarry))}T${hh}${mm}00`
}

/** Build time as a UTC iCalendar timestamp, `20260913T031500Z`. */
function utcNow(): string {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/* ---------- iCalendar serialisation ---------- */

/** Escape a TEXT value: backslash, semicolon, comma, and newlines. */
function esc(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/** Fold a content line at 75 octets with CRLF + space, per RFC 5545 §3.1. */
function fold(line: string): string {
  const bytes = Buffer.from(line, 'utf8')
  if (bytes.length <= 75) return line
  const out: string[] = []
  let start = 0
  let first = true
  while (start < bytes.length) {
    const limit = first ? 75 : 74
    let end = Math.min(start + limit, bytes.length)
    // Do not split a multi-byte UTF-8 character: back up to a boundary.
    while (end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--
    out.push((first ? '' : ' ') + bytes.subarray(start, end).toString('utf8'))
    start = end
    first = false
  }
  return out.join('\r\n')
}

type Event = {
  uid: string
  summary: string
  description?: string
  location?: string
  /** Either `allDay` (an ISO date) or `start`/`end` (local date-times). */
  allDay?: string
  start?: string
  end?: string
  /** Reminder offset such as `-PT15H`; omitted for no alarm. */
  alarm?: string
}

function serialiseEvent(ev: Event, stamp: string): string[] {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${ev.uid}`,
    `DTSTAMP:${stamp}`,
  ]
  if (ev.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${compact(ev.allDay)}`)
    lines.push(`DTEND;VALUE=DATE:${compact(addDays(ev.allDay, 1))}`)
  } else {
    lines.push(`DTSTART;TZID=${TZID}:${ev.start}`)
    lines.push(`DTEND;TZID=${TZID}:${ev.end}`)
  }
  lines.push(`SUMMARY:${esc(ev.summary)}`)
  if (ev.description) lines.push(`DESCRIPTION:${esc(ev.description)}`)
  if (ev.location) lines.push(`LOCATION:${esc(ev.location)}`)
  if (ev.alarm) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${esc(ev.summary)}`,
      `TRIGGER:${ev.alarm}`,
      'END:VALARM',
    )
  }
  lines.push('END:VEVENT')
  return lines
}

/**
 * Sydney's rules since 2008: AEDT starts first Sunday of October at 2 am,
 * AEST resumes first Sunday of April at 3 am. Embedded so every client
 * resolves the TZID the same way, including ones without a zone database.
 */
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${TZID}`,
  'X-LIC-LOCATION:Australia/Sydney',
  'BEGIN:STANDARD',
  'DTSTART:19700405T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=4;BYDAY=1SU',
  'TZOFFSETFROM:+1100',
  'TZOFFSETTO:+1000',
  'TZNAME:AEST',
  'END:STANDARD',
  'BEGIN:DAYLIGHT',
  'DTSTART:19701004T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=1SU',
  'TZOFFSETFROM:+1000',
  'TZOFFSETTO:+1100',
  'TZNAME:AEDT',
  'END:DAYLIGHT',
  'END:VTIMEZONE',
]

/* ---------- events from the data files ---------- */

const uidDomain = new URL(course.siteUrl).hostname

function classEvents(cls: ClassEntry, skipped: Set<string>): Event[] {
  const offset = DAY_ORDER.indexOf(cls.day)
  if (offset < 0) throw new Error(`Unknown weekday in timetable: ${cls.day}`)
  const startMin = toMinutes(cls.time)
  const events: Event[] = []

  for (const week of weeks) {
    // Non-teaching weeks and whole-week events (Demo Day) have no regular classes.
    if (week.teaching === false || week.event) continue
    const date = addDays(week.starts, offset)
    if (cancelled.some((c) => c.date === date)) {
      skipped.add(date)
      continue
    }

    const isLecture = cls.type === 'Lecture'
    const headings = week.mle.sections.map((s) => s.heading)
    const guest = week.mle.guest?.topic
    const topics = [...headings, ...(guest ? [`Guest lecture: ${guest}`] : [])]

    const summary = isLecture
      ? `${course.code} Lecture: ${topics.length ? headings.join(', ') : `Week ${week.week}`}`
      : `${course.code} Lab ${cls.stream}`

    const description = [
      `Week ${week.week}. ${cls.code} (section ${cls.section})`,
      ...(isLecture ? topics.map((t) => `- ${t}`) : []),
      ...(!isLecture && week.accelerator ? [`Accelerator: ${week.accelerator.topic}`] : []),
      `${course.siteUrl}/syllabus/`,
    ].join('\n')

    events.push({
      uid: `${cls.code}-${compact(date)}@${uidDomain}`,
      summary,
      description,
      location: cls.location || undefined,
      start: localDateTime(date, startMin),
      end: localDateTime(date, startMin + cls.durationMinutes),
    })
  }
  return events
}

function deadlineEvents(): Event[] {
  const segments = assessment.segments as Segment[]
  const groups: { name: string; tasks: Task[] }[] = [
    ...segments.map((s) => ({ name: s.name, tasks: s.tasks })),
    { name: 'Optional bonus', tasks: assessment.bonus as Task[] },
  ]
  const events: Event[] = []
  for (const group of groups) {
    for (const task of group.tasks) {
      // Text deadlines ("Week 11 event (TBC)") stay off the calendar until fixed.
      if (!ISO_DATE.test(task.deadline)) continue
      const marks = `${task.marks} marks${task.marksNote ? ` (${task.marksNote})` : ''}`
      const opens = ISO_DATE.test(task.start) ? `Opens ${task.start}. ` : ''
      events.push({
        uid: `${task.id}@${uidDomain}`,
        summary: `Due: ${task.task} (${task.key})`,
        description: [
          `${group.name}: ${marks}.`,
          `${opens}Due 11:59 pm Sydney time.`,
          `${course.siteUrl}/assessment/`,
        ].join('\n'),
        allDay: task.deadline,
        // 9 am the day before (15 hours before the all-day start at midnight).
        alarm: '-PT15H',
      })
    }
  }
  return events
}

function cancelledEvents(dates: Set<string>): Event[] {
  return cancelled
    .filter((c) => dates.has(c.date))
    .map((c) => ({
      uid: `cancelled-${compact(c.date)}@${uidDomain}`,
      summary: `No ${course.code} classes`,
      description: c.reason,
      allDay: c.date,
    }))
}

/** The complete `.ics` text for a feed, CRLF line endings. */
export function buildFeed(feed: Feed): string {
  const skipped = new Set<string>()
  const events = [
    ...feed.classes.flatMap((cls) => classEvents(cls, skipped)),
    ...deadlineEvents(),
    ...cancelledEvents(skipped),
  ]
  const stamp = utcNow()
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${uidDomain}//${course.code} course site//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(feed.name)}`,
    `X-WR-TIMEZONE:${TZID}`,
    `X-WR-CALDESC:${esc(`${course.code} ${timetable.term}. Times are Sydney local time.`)}`,
    // Hint to clients how often to poll; Outlook honours these, others ignore.
    'REFRESH-INTERVAL;VALUE=DURATION:PT6H',
    'X-PUBLISHED-TTL:PT6H',
    ...VTIMEZONE,
    ...events.flatMap((ev) => serialiseEvent(ev, stamp)),
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
