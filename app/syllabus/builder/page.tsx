import type { Metadata } from 'next'
import { Typography } from '@heroui/react'
import { SyllabusBuilder } from '@/components/syllabus-builder'

/**
 * An authoring tool, not part of the public course site: it exists to merge the
 * Engineering and MLE columns of `data/syllabus.json` into one outline. It is
 * deliberately absent from the navbar, and noindex'd, since a half-merged
 * syllabus is not something to show students. Delete the route once the merge
 * is done.
 */
export const metadata: Metadata = {
  title: 'Syllabus builder',
  description: 'Internal tool for merging and reorganising the syllabus outline.',
  robots: { index: false, follow: false },
}

export default function SyllabusBuilderPage() {
  return (
    <div className="doc-column py-10 md:py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Typography type="h1">Syllabus builder</Typography>
        <Typography type="body" color="muted" className="max-w-2xl">
          Merge the Engineering column into the MLE outline, week by week. Pull
          topics across from the sources on the right, edit them into headings
          and bullets, move them between weeks, and export the result over{' '}
          <Typography type="code">data/syllabus.json</Typography>. Your work is
          kept in this browser until you export it.
        </Typography>
      </header>
      <SyllabusBuilder />
    </div>
  )
}
