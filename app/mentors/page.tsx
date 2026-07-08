import type { Metadata } from 'next'
import { course } from '@/data/course'
import { getMentors } from '@/lib/content'
import { MentorCard } from '@/components/mentor-card'

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
        <h1 className="text-4xl font-bold tracking-tight text-ink-strong">
          Mentors
        </h1>
        <p className="text-xl text-muted leading-relaxed max-w-2xl">
          {course.mentorIntro}
        </p>
      </header>
      {course.mentorsComingSoon ? (
        <div className="border border-subtle rounded-sm bg-surface p-8 text-center">
          <span className="inline-block border border-accent bg-banner text-ink-strong text-xs font-medium px-2 py-0.5 rounded-sm mb-3">
            Coming soon
          </span>
          <p className="text-muted max-w-md mx-auto">
            This term&rsquo;s mentors are being confirmed. Check back soon to meet
            the industry, academic, and philanthropic mentors supporting our teams.
          </p>
        </div>
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
