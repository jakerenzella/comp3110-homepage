import type { Metadata } from 'next'
import { Typography } from '@heroui/react'
import { EmptyState } from '@heroui-pro/react'
import { course } from '@/data/course'
import { getMentors } from '@/lib/content'
import { MentorCard } from '@/components/mentor-card'
import { Icon } from '@/components/icon'

export const metadata: Metadata = {
  title: 'Mentors',
  description:
    'Industry mentors who pair with COMP3110 teams to guide their ML systems from idea to deployment.',
}

export default function MentorsPage() {
  const mentors = getMentors()

  return (
    <div className="doc-column py-10 md:py-14 flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Typography type="h1">Mentors</Typography>
        <Typography type="body" color="muted" className="max-w-2xl">
          {course.mentorIntro}
        </Typography>
      </header>
      {course.mentorsComingSoon ? (
        <EmptyState>
          <EmptyState.Media>
            <Icon name="group" size={24} />
          </EmptyState.Media>
          <EmptyState.Header>
            <EmptyState.Title>Mentors coming soon</EmptyState.Title>
            <EmptyState.Description>
              This term&rsquo;s mentors are being confirmed. Check back soon to
              meet the industry, academic, and philanthropic mentors supporting
              our teams.
            </EmptyState.Description>
          </EmptyState.Header>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {mentors.map((m) => (
            <MentorCard key={m.slug} entry={m} />
          ))}
        </div>
      )}
    </div>
  )
}
