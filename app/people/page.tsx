/**
 * Everyone who teaches or supports the course, in three sections: the course
 * staff (from data/course.ts and data/tutors.json, the same entries the home
 * page lists), guest lecturers (from data/people.json, the same entries the
 * syllabus names) and mentors (from content/mentors/*.mdx). One page rather
 * than three, so a name in the syllabus has somewhere to land: the chips link
 * to `/people#<id>`, which is the id on that person's card.
 *
 * Staff first: they are who a student needs to find, and they are the same
 * people all term. Guests and mentors are the ones who change week to week.
 */
import type { Metadata } from 'next'
import { Typography } from '@heroui/react'
import { EmptyState } from '@heroui-pro/react'
import { course } from '@/data/course'
import tutorData from '@/data/tutors.json'
import { getPeople } from '@/lib/people'
import { getMentors } from '@/lib/content'
import { GuestCard } from '@/components/guest-card'
import { MentorCard } from '@/components/mentor-card'
import { PersonCard, type Person as StaffMember } from '@/components/person-card'
import { Section } from '@/components/section'
import { Icon } from '@/components/icon'

export const metadata: Metadata = {
  title: 'People',
  description:
    'Guest lecturers who teach a session of COMP3110, and the industry mentors who pair with teams to guide their ML systems from idea to deployment.',
}

/** A section's blurb, or nothing at all when course.ts leaves it blank. */
function SectionIntro({ children }: { children: string }) {
  if (!children) return null
  return (
    <Typography type="body" color="muted" className="mb-6 max-w-2xl">
      {children}
    </Typography>
  )
}

export default function PeoplePage() {
  const guests = getPeople()
  const mentors = getMentors()
  // Lecturer in charge first, then the tutors as tutors.json orders them (lead
  // tutor / course admin first), so the section reads down from who runs the
  // course to who to ask day to day.
  const staff: StaffMember[] = [
    course.instructor,
    ...(tutorData.tutors as StaffMember[]),
  ]

  return (
    <div className="doc-column py-10 md:py-14 flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <Typography type="h1">People</Typography>
        <Typography type="body" color="muted" className="max-w-2xl">
          {course.peopleIntro}
        </Typography>
      </header>

      <Section title="Staff" id="staff">
        {/* Each section intro is optional: an empty string in course.ts drops
            the paragraph rather than leaving a blank line's worth of margin. */}
        <SectionIntro>{course.staffIntro}</SectionIntro>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {staff.map((member) => (
            <PersonCard key={member.name} person={member} />
          ))}
        </div>
      </Section>

      <Section title="Guest lecturers" id="guest-lecturers">
        <SectionIntro>{course.guestIntro}</SectionIntro>
        {guests.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {guests.map((person) => (
              <GuestCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <EmptyState>
            <EmptyState.Media>
              <Icon name="school" size={24} />
            </EmptyState.Media>
            <EmptyState.Header>
              <EmptyState.Title>Guest lecturers coming soon</EmptyState.Title>
              <EmptyState.Description>
                This term&rsquo;s guests are being confirmed. The syllabus names
                each session&rsquo;s lead as it is locked in.
              </EmptyState.Description>
            </EmptyState.Header>
          </EmptyState>
        )}
      </Section>

      <Section title="Mentors" id="mentors">
        <SectionIntro>{course.mentorIntro}</SectionIntro>
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {mentors.map((m) => (
              <MentorCard key={m.slug} entry={m} />
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}
