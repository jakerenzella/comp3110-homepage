import type { Metadata } from 'next'
import { Alert, Typography } from '@heroui/react'
import { AssessmentTable } from '@/components/assessment-table'
import { CalendarSubscribe } from '@/components/calendar-subscribe'

export const metadata: Metadata = {
  title: 'Assessment',
  description:
    'Task marks, start dates and deadlines for COMP3110 technical tasks, accelerator crits and the final project.',
}

export default function AssessmentPage() {
  return (
    <div className="doc-column py-10 md:py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Typography type="h1">Assessment</Typography>
      </header>
      {/* Single-line note, so the message is the Title rather than a
          Description: see the matching comment in app/syllabus/page.tsx. */}
      {/* <Alert>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>
            Proposed schedule: all dates are in 2026 and remain subject to
            confirmation. Deadlines are 11:59 pm Sydney time, except the
            scheduled Demo Day presentation.
          </Alert.Title>
        </Alert.Content>
      </Alert> */}
      <AssessmentTable />
      <CalendarSubscribe />
    </div>
  )
}
