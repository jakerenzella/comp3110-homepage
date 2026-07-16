/**
 * Single source of truth for course logistics, staff, schedule, and FAQ.
 *
 * Tutors and non-developers edit THIS file (and the MDX files under content/)
 * to update the site — no JSX/React changes required. See the "Updating the
 * site" section of the README.
 *
 * Values marked `TODO` are placeholders — replace with real course data.
 */

export type IconName =
  | "calendar"
  | "location"
  | "group"
  | "grading"
  | "mail"
  | "rocket"
  | "deploy"
  | "flag"
  | "trophy"
  | "sprint";

export type Announcement = {
  message: string;
  /** Optional call-to-action link shown at the end of the banner. */
  href?: string;
  linkLabel?: string;
};

export type LogisticsItem = {
  label: string;
  icon: IconName;
  /** A single line, or a bulleted list of lines. */
  value: string | string[];
};

export type Staff = {
  name: string;
  role: string;
  photo: string;
  url?: string;
};

export type Phase = {
  name: string;
  /** e.g. "Weeks 1–2" */
  when: string;
  summary: string;
  icon: IconName;
};

export type FaqItem = {
  q: string;
  a: string;
};

export const course = {
  code: "COMP3110",
  title: "Machine Learning Engineering",
  school: "UNSW School of Computer Science and Engineering",
  term: "UNSW Sydney · Term 2, 2025", // TODO: confirm the offering term
  tagline:
    "An accelerator-style course for applying machine learning to solve real problems.",

  /**
   * Slim banner shown above the navbar. Set to `null` to hide it entirely
   * (the layout reserves no space when null, so there is no layout shift).
   */
  // Set to an object to show a slim banner above the navbar; null hides it.
  announcement: null as Announcement | null,

  logistics: [
    {
      label: "Lectures",
      icon: "calendar",
      // Overridden on the home page with live times from data/timetable.json.
      value: "See the weekly timetable below.",
    },
    {
      label: "Location",
      icon: "location",
      value: "TBC.", // TODO
    },
    {
      label: "Grading",
      icon: "grading",
      value: [
        "Portfolio of Tasks (60%): evidence across your onboarding and accelerator tasks, including individual contributions",
        "Final Project (40%): your final deliverable, including your Demo Day performance and communication",
      ],
    },
    {
      label: "Contact",
      icon: "mail",
      value: "jake.renzella@unsw.edu.au · Course forum on Ed", // TODO: confirm forum
    },
  ] as LogisticsItem[],

  instructor: {
    name: "Jake Renzella",
    role: "Lecturer in Charge",
    photo: "/staff/instructor.png",
    url: "https://www.unsw.edu.au/staff/jake-renzella", // TODO: confirm URL
  } as Staff,

  // Tutors live in data/tutors.json so they can be updated without touching code.

  /** The five accelerator phases, in order, for the home-page timeline. */
  phases: [
    {
      name: "Onboarding",
      when: "Weeks 1-2",
      summary:
        "Find teams and identify your accelerator project.",
      icon: "rocket",
    },
    {
      name: "Sprint 1",
      when: "Weeks 3-5",
      summary:
        "AI/ML/LLM prototype.",
      icon: "sprint",
    },
    {
      name: "Sprint 2",
      when: "Weeks 7-9",
      summary:
        "metrics, evals and model improvement.",
      icon: "sprint",
    },
    {
      name: "Sprint 3",
      when: "Weeks 9-10",
      summary:
        "Polish and Demo Day preparations.",
      icon: "deploy",
    },
    {
      name: "Demo Day",
      when: "Week 10",
      summary:
        "Each team gives a short, live presentation of a deployed system to an audience of peers, mentors, and industry guests.",
      icon: "trophy",
    },
  ] as Phase[],

  faq: [
    {
      q: "How difficult is the course?",
      a: "The material is approachable, but your Accelerator project should be involved and is recommended to be taken in groups. Take it if you are ready to build things, be pragmatic and learn from hands-on experience across a full term.",
    },
    {
      q: "Are lectures recorded?",
      a: "Yes. Lectures are recorded and made available to enrolled students on Youtube.",
    },
    {
      q: "What is the format of the class?",
      a: "Lectures for primary content and guest lectures, labs for hands on activity and accelerator check-ins, and the discussion fourm. We aim to engage with a number of industry practitioners both technical and non-technical.",
    },
    {
      q: "How are teams and mentors available?",
      a: "We're still working out details, but we expect mentors to be available by booking in 30min slots in a shared calendar.",
    },
  ] as FaqItem[],

  /** Slugs (filenames without .mdx) of the projects featured on the home page. */
  featuredProjectSlugs: [
    "real-time-fraud-detection",
    "clinical-note-summariser",
    "campus-energy-forecasting",
  ],

  mentorIntro:
    "Every team is provided access to philanthropic, industry and academic mentors who have experience in their relevent domain. Mentors have limited time available to book in consult sessions when needed, and may be able to provide guidance on identifying your problem, reviewing technical decisions, and helping your team navigate messy realities.",

  /**
   * When true, mentor listings (home strip + /mentors page) show a "coming soon"
   * placeholder instead of the mentor cards. The content/mentors/*.mdx files are
   * kept and re-appear automatically when this is set back to false.
   */
  mentorsComingSoon: true,

  footerLinks: [
    {
      label: "UNSW Handbook",
      href: "https://www.handbook.unsw.edu.au/undergraduate/courses/2026/COMP3110",
    },
    { label: "Moodle", href: "https://moodle.telt.unsw.edu.au/" },
    {
      label: "CSE",
      href: "https://www.unsw.edu.au/engineering/our-schools/computer-science-and-engineering",
    },
  ],
} as const;

export type Course = typeof course;
