import type { Metadata } from 'next'
import { Alert, Typography } from '@heroui/react'
import { CalendarSubscribe } from '@/components/calendar-subscribe'
import { SyllabusTable } from '@/components/syllabus-table'

export const metadata: Metadata = {
  title: 'Syllabus',
  description:
    'Week-by-week schedule for COMP3110, with the technical and accelerator content covered each week and the materials that go with them.',
}

export default function SyllabusPage() {
  return (
    <div className="doc-column py-10 md:py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Typography type="h1">Syllabus</Typography>
      </header>
      {/* Plain note, so the message is the Title rather than a
          Description: only alert__title carries the 24px line-height that
          matches the indicator's box, so it centres against the icon. A
          description-only Alert sits high. */}
      <Alert>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>
            Materials will be published as term progresses.{' '}
            This schedule is subject to change according to guest lecturer
            availability and to the pace of the class.
          </Alert.Title>
        </Alert.Content>
      </Alert>
      <SyllabusTable />
      <CalendarSubscribe />
    </div>
  )
}
