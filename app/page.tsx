import Link from "next/link";
import { Avatar, Table } from "@heroui/react";
import { course } from "@/data/course";
import timetable from "@/data/timetable.json";
import tutorData from "@/data/tutors.json";
import { getProjects, getMentors } from "@/lib/content";
import { Section } from "@/components/section";
import { Icon } from "@/components/icon";
import { AcceleratorTimeline } from "@/components/accelerator-timeline";
import { Timetable } from "@/components/timetable";
import { ProjectCard } from "@/components/project-card";
import { FaqAccordion } from "@/components/faq-accordion";

function initials(name: string) {
  const p = name.split(" ").filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.at(-1)?.[0] ?? "")).toUpperCase();
}

export default function HomePage() {
  const projects = getProjects();
  const featured = course.featuredProjectSlugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const mentors = getMentors();
  const tutors = tutorData.tutors as {
    name: string;
    role: string;
    photo?: string;
    lead?: boolean;
  }[];

  // Live lecture time(s) from the timetable, used in the Logistics "Lectures" row.
  const lectureLine = timetable.classes
    .filter((c) => c.type === "Lecture")
    .map((c) => `${c.day} ${c.time}`)
    .join(", ");

  return (
    <div className="doc-column py-10 md:py-14 flex flex-col gap-16">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink-strong">
          {course.code}: {course.title}
        </h1>
        <p className="text-xl text-muted leading-relaxed max-w-2xl">
          {course.tagline}
        </p>
      </header>

      {/* Logistics */}
      <Section title="Logistics" id="logistics">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Course logistics">
              <Table.Header>
                <Table.Column isRowHeader>Item</Table.Column>
                <Table.Column>Details</Table.Column>
              </Table.Header>
              <Table.Body>
                {course.logistics.map((item) => {
                  // The Lectures row is driven live from the timetable JSON.
                  const value =
                    item.label === "Lectures" && lectureLine
                      ? lectureLine
                      : item.value;
                  return (
                    <Table.Row key={item.label}>
                      <Table.Cell className="whitespace-nowrap align-top">
                        <span className="flex items-center gap-2 font-semibold text-ink-strong">
                          <Icon
                            name={item.icon}
                            size={18}
                            className="text-muted"
                          />
                          {item.label}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="text-muted align-top">
                        {Array.isArray(value) ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {value.map((v) => (
                              <li key={v}>{v}</li>
                            ))}
                          </ul>
                        ) : (
                          value
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </Section>

      {/* Overview */}
      <Section title="Overview" id="overview">
        <div className="prose-doc">
          <p>
            What good is Artificial Intelligence if it can't be used by real
            people in real products to solve real problems?
          </p>
          <p>
            As Artificial Intelligence transforms our world, the role of Machine
            Learning Engineers becomes increasingly critical in bringing AI
            models to life. This course, Machine Learning Engineering, will
            prepare you to operate at the intersection of software engineering
            and machine learning, equipping you with the skills to design,
            develop, deploy, and maintain robust machine learning systems that
            solve real problems.
          </p>

          <p>
            Through hands-on learning and industry-aligned practices, you will
            explore key areas such as data collection and sanitisation,
            cloud-based deployment, model monitoring, and system scalability.
            This course will prepare you to pursue careers as a Machine Learning
            Engineer, but more importantly, to solve a real problem for society.
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
            supported to make a real imapct with your COMP skills.
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
        </div>
      </Section>

      {/* Timetable */}
      <Section title="Timetable" id="timetable">
        <p className="text-muted mb-6">
          Weekly class times for {timetable.term}.
        </p>
        <Timetable />
      </Section>

      {/* Accelerator timeline */}
      <Section title="The accelerator" id="accelerator">
        <p className="text-muted mb-6 max-w-2xl">
          The term runs like a startup accelerator: a two-week bootcamp, three
          build sprints with industry mentors, and a public Demo Day.
        </p>
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
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">
          Instructor
        </h3>
        <div className="flex items-center gap-4 p-4 border border-subtle rounded-sm bg-surface max-w-sm">
          <Avatar size="lg">
            <Avatar.Image src={course.instructor.photo} alt="" />
            <Avatar.Fallback>
              {initials(course.instructor.name)}
            </Avatar.Fallback>
          </Avatar>
          <div>
            <div className="font-semibold text-ink-strong">
              {course.instructor.name}
            </div>
            {course.instructor.url ? (
              <a
                href={course.instructor.url}
                className="text-sm text-muted hover:text-ink-strong"
              >
                {course.instructor.role}
              </a>
            ) : (
              <span className="text-sm text-muted">
                {course.instructor.role}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mt-6 mb-3">
          Tutors
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tutors.map((tutor) => (
            <div
              key={tutor.name}
              className={
                "flex items-center gap-3 p-3 border rounded-sm bg-surface " +
                (tutor.lead
                  ? "border-subtle border-l-2 border-l-accent"
                  : "border-subtle")
              }
            >
              <Avatar size="md">
                {tutor.photo ? <Avatar.Image src={tutor.photo} alt="" /> : null}
                <Avatar.Fallback>{initials(tutor.name)}</Avatar.Fallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-sm font-medium text-ink-strong truncate">
                  {tutor.name}
                </div>
                <div className="text-xs text-muted truncate">{tutor.role}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Featured projects */}
      <Section title="Featured projects" id="projects">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {featured.map((p) => (
            <ProjectCard key={p.slug} entry={p} />
          ))}
        </div>
        <Link
          href="/projects"
          className="mt-6 inline-flex items-center gap-1.5 font-semibold text-ink-strong underline decoration-accent decoration-2 underline-offset-4"
        >
          Browse all projects
          <Icon name="arrow-right" size={16} />
        </Link>
      </Section>

      {/* Mentors strip */}
      <Section title="Mentors" id="mentors">
        <p className="text-muted mb-6 max-w-2xl">{course.mentorIntro}</p>
        {course.mentorsComingSoon ? (
          <div className="border border-subtle rounded-sm bg-surface p-6 flex items-center gap-3">
            <span className="inline-block border border-accent bg-banner text-ink-strong text-xs font-medium px-2 py-0.5 rounded-sm">
              Coming soon
            </span>
            <span className="text-muted text-sm">
              This term&rsquo;s mentors are being confirmed.
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-5">
              {mentors.map((m) => (
                <div key={m.slug} className="flex items-center gap-3">
                  <Avatar size="md">
                    {m.frontmatter.photo ? (
                      <Avatar.Image src={m.frontmatter.photo} alt="" />
                    ) : null}
                    <Avatar.Fallback>
                      {initials(m.frontmatter.name)}
                    </Avatar.Fallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium text-ink-strong">
                      {m.frontmatter.name}
                    </div>
                    <div className="text-muted">
                      {m.frontmatter.affiliation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/mentors"
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
