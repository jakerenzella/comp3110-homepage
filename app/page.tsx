import Link from "next/link";
import { Typography } from "@heroui/react";
import { EmptyState } from "@heroui-pro/react";
import { course } from "@/data/course";
import timetable from "@/data/timetable.json";
import tutorData from "@/data/tutors.json";
import { getMentors } from "@/lib/content";
import { Section } from "@/components/section";
import { Icon } from "@/components/icon";
import { AcceleratorTimeline } from "@/components/accelerator-timeline";
import { LogisticsTable } from "@/components/logistics-table";
import { PersonCard, type Person } from "@/components/person-card";
import { Timetable } from "@/components/timetable";
import { FaqAccordion } from "@/components/faq-accordion";

export default function HomePage() {
  const mentors = getMentors();
  const tutors = tutorData.tutors as Person[];
  const staff = tutorData.staff as Person[];

  return (
    <div className="doc-column py-10 md:py-14 flex flex-col gap-16">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <Typography type="h1">
          {course.code}: {course.title}
        </Typography>
        <Typography type="body" color="muted" className="max-w-2xl">
          {course.tagline}
        </Typography>
      </header>

      {/* Logistics */}
      <Section title="Logistics" id="logistics">
        <LogisticsTable />
      </Section>

      {/* Overview */}
      <Section title="Overview" id="overview">
        <Typography.Prose>
          <p>
            What good is AI if it isn't used to solve real problems?
          </p>
          <p>
            As AI transforms our world, the role of Machine
            Learning Engineers becomes increasingly critical. This course, Machine Learning Engineering, will
            prepare you to operate at the intersection of software engineering
            and machine learning, equipping you with the skills to design,
            develop, deploy, and maintain robust machine learning systems that
            solve real problems for people.
          </p>

          <p>
            You will explore key areas such as data collection and sanitisation,
            model design, and deployment.
          </p>
          <p>
            And in order to solve real problems, we must be able to identify
            them. Towards this, this course will run in an accelerator format.
          </p>
          <h3>Why an accelerator format</h3>
          <p>
            An{" "}
            <Link href="https://en.wikipedia.org/wiki/Startup_accelerator">
              accelerator
            </Link>{" "}
            is typically a cohort and mentor-oriented program to provide
            guidance, support and resources to startups in exchange for equity.
            Accelerators have been used by Y Combinator, Google, Cicada
            Innovations, and others to kickstart countless successful companys.
          </p>
          <p>
            While we won't be taking any equity in your projects, the
            accelerator format provides a great structure to onboard you with
            the technical content of COMP3110, and then get you focused and
            supported to make a real impact with your computing skills.
          </p>
          <h3>Informal prerequisites</h3>
          <ul>
            <li>
              A competent programmer, which we are sure you are all by now!
            </li>
            <li>A good understanding of AI/ML/LLM approaches.</li>
            <li>
              Willingness to pick up new technologies, to work pragmatically and
              with others.
            </li>
            <li>
              A keeness to identify societal or commercial problems, and to
              solve them.
            </li>
          </ul>
        </Typography.Prose>
      </Section>

      {/* Timetable */}
      <Section title="Timetable" id="timetable">
        <Typography type="body" color="muted" className="mb-6">
          Weekly class times for {timetable.term}.
        </Typography>
        <Timetable />
      </Section>

      {/* Accelerator timeline */}
      <Section title="The accelerator" id="accelerator">
        <Typography type="body" color="muted" className="mb-6 max-w-2xl">
          The accelerator includes two-week onboarding, three
          build sprints with industry mentors, and a public Demo Day.
        </Typography>
        <AcceleratorTimeline phases={course.phases} />
        <Link
          href="/accelerator"
          className="mt-6 inline-flex items-center gap-1.5 font-semibold text-ink-strong underline decoration-accent decoration-2 underline-offset-4"
        >
          How the accelerator works
          <Icon name="arrow-right" size={16} />
        </Link>
      </Section>

      {/* Team */}
      <Section title="Team" id="team">
        <Typography
          type="body-xs"
          color="muted"
          weight="semibold"
          className="uppercase tracking-wider mb-3"
        >
          Lecturer in Charge
        </Typography>
        <div className="max-w-sm">
          <PersonCard person={course.instructor} />
        </div>

        <Typography
          type="body-xs"
          color="muted"
          weight="semibold"
          className="uppercase tracking-wider mt-6 mb-3"
        >
          Tutors
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tutors.map((tutor) => (
            <PersonCard key={tutor.name} person={tutor} />
          ))}
        </div>

        <Typography
          type="body-xs"
          color="muted"
          weight="semibold"
          className="uppercase tracking-wider mt-6 mb-3"
        >
          Staff
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {staff.map((member) => (
            <PersonCard key={member.name} person={member} />
          ))}
        </div>
      </Section>

      {/* Mentors strip */}
      <Section title="Mentors" id="mentors">
        <Typography type="body" color="muted" className="mb-6 max-w-2xl">
          {course.mentorIntro}
        </Typography>
        {course.mentorsComingSoon ? (
          <EmptyState>
            <EmptyState.Media>
              <Icon name="group" size={24} />
            </EmptyState.Media>
            <EmptyState.Header>
              <EmptyState.Title>Mentors coming soon</EmptyState.Title>
              <EmptyState.Description>
                This term&rsquo;s mentors are being confirmed.
              </EmptyState.Description>
            </EmptyState.Header>
          </EmptyState>
        ) : (
          <>
            {/* Same ItemCard as the tutors above, so the two people strips
                read as one set. Two columns, not three: mentor names run long
                and ItemCard truncates its title rather than wrapping it. Each
                card links to the mentor's full card on /people. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mentors.map((m) => (
                <PersonCard
                  key={m.slug}
                  person={{
                    name: m.frontmatter.name,
                    role: m.frontmatter.affiliation,
                    photo: m.frontmatter.photo,
                    url: `/people#${m.slug}`,
                  }}
                />
              ))}
            </div>
            <Link
              href="/people#mentors"
              className="mt-6 inline-flex items-center gap-1.5 font-semibold text-ink-strong underline decoration-accent decoration-2 underline-offset-4"
            >
              Meet the mentors
              <Icon name="arrow-right" size={16} />
            </Link>
          </>
        )}
      </Section>

      {/* FAQ */}
      <Section title="FAQ" id="faq">
        <FaqAccordion items={course.faq} />
      </Section>
    </div>
  );
}
