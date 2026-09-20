# COMP3110 · Machine Learning Engineering — Course Site

A static, document-style course website for **UNSW COMP3110**, built with Next.js
(App Router) + HeroUI v3 / HeroUI Pro + Tailwind CSS v4, and content authored in
MDX. The whole site exports to plain HTML for hosting on GitHub Pages or any static
host.

The visual design follows the "Academic Precision" system from the project's Google
Stitch design: a single 800px reading column, flat cards with 1px borders (no
shadows), Inter + JetBrains Mono, near-black text on off-white, and UNSW yellow
(`#ffeb00`) used sparingly for accents.

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Building the static site

```bash
npm run build    # type-checks, builds, and exports static HTML to ./out
npm run serve    # preview the exported ./out folder locally
```

`npm run build` produces a fully static `out/` directory. Deploy its contents to
any static host.

> **GitHub Pages:** if you deploy to a project page
> (`https://<user>.github.io/<repo>/`), open `next.config.mjs` and set `basePath`
> and `assetPrefix` to `'/<repo>'` (there is a `TODO` comment marking the spot),
> then rebuild.

---

## Updating the site

You do **not** need to know React or edit any code to keep this site current.
Everything below is a plain text / Markdown edit. After any change, run
`npm run build` (or push — if CI is set up it rebuilds for you).

### Calendar subscription

The **Add to your calendar** card on the Assessment and Syllabus pages points at
`.ics` feeds generated at build time from `data/timetable.json` (class times and
cancelled dates), `data/syllabus.json` (which weeks are teaching weeks, and each
week's topics) and `data/assessment.json` (deadlines). There is one feed per lab
stream plus a lecture-only feed, served from `/calendar/<feed>.ics`.

Nothing extra to maintain: edit those JSON files as usual and the next build
republishes the feeds. Students' calendar apps re-fetch the URL on their own
schedule (Apple: user setting, Google: roughly daily, Outlook: every few hours),
and because each event has a stable id an edited date moves the existing event
instead of duplicating it. To cancel a class for a public holiday, add the date
to `cancelled` in `data/timetable.json`. The public site URL used in the links
is `siteUrl` in `data/course.ts`.

### Add a project

Create one new file in `content/projects/`, named after the project in lowercase
with dashes, e.g. `content/projects/smart-irrigation.mdx`. Copy this template:

```mdx
---
title: Smart Irrigation Scheduler
year: 2025
team: [First Last, Another Name]
tags: [time-series, IoT]
cover: /projects/smart-irrigation.svg   # optional; put the image in public/projects/
demo: https://...                       # optional
repo: https://...                       # optional
award: Demo Day Winner                  # optional — remove the line if none
---

## The problem
Write the write-up here in Markdown — headings, lists, links all work.
```

Save it. The project automatically appears in the **Projects** gallery (and under
the correct year tab), and gets its own detail page at `/projects/smart-irrigation`.
Award winners get a yellow badge. No code changes needed.

To feature a project on the home page, add its filename (without `.mdx`) to
`featuredProjectSlugs` in `data/course.ts`.

### Add a mentor

Create one new file in `content/mentors/`, e.g. `content/mentors/jane-doe.mdx`:

```mdx
---
name: Jane Doe
affiliation: Company Name
role: ML Engineer
expertise: [MLOps, deployment]
photo: /mentors/jane-doe.svg      # optional; put the image in public/mentors/
links:
  website: https://...
  linkedin: https://...
---

A short one-paragraph bio goes here.
```

The mentor appears automatically on the **Mentors** page.

### Add or change a tutor

Tutors are listed in `data/tutors.json`. The lead tutor / course administrator has
`"lead": true` and is shown first with a yellow accent:

```json
{
  "tutors": [
    {
      "name": "Sofia De Bellis",
      "role": "Course Administrator",
      "lead": true,
      "photo": "/staff/sofia.png"
    },
    { "name": "New Tutor", "role": "Tutor", "photo": "" }
  ]
}
```

`photo` is optional (falls back to the person's initials). To add an image, drop it
in `public/staff/` and point `photo` at it (e.g. `/staff/new-tutor.svg`).

### Change logistics

Open `data/course.ts` and edit the `logistics` array

The same file holds lecture times, location, grading, contact, staff, the FAQ, and
the accelerator phases. Edit the text between the quotes.

### Update the timetable (new term)

The weekly class timetable on the home page comes from `data/timetable.json`.
Edit the `term` label and the `classes` list:

```json
{
  "term": "Term 3, 2026",
  "classes": [
    {
      "code": "COMP3110-T3U1-LEC/A:1",
      "type": "Lecture",
      "stream": "A",
      "day": "Monday",
      "time": "11:00 AM",
      "location": ""
    }
  ]
}
```

`type` is `Lecture` or `Lab`, `day` is a weekday name, `time` is the start time,
and `location` is optional. Rows sort themselves by day and time — just add,
remove, or edit entries.

### Set (or clear) the announcement banner

The slim banner above the navbar is controlled by `announcement` in
`data/course.ts`:

```ts
announcement: {
  message: 'Demo Day 2025 recordings are now live.',
  href: '#',                 // optional link
  linkLabel: 'Watch on YouTube',
},
```

To **hide** the banner entirely, set it to `null`:

```ts
announcement: null,
```

When hidden it takes up no space, so nothing else on the page shifts.

### Edit long-form pages

- **The Accelerator** page → `content/accelerator.mdx`
- **Resources** page → `content/resources.mdx`

Both are plain Markdown/MDX — edit the prose directly.

---

## Project structure

```
app/                 Routes (App Router). One folder per page.
components/           Reusable UI (navbar, footer, timeline, cards, MDX renderer).
content/             ← EDIT THESE: MDX for projects, mentors, and prose pages.
data/course.ts       ← EDIT THIS: logistics, staff, schedule, FAQ, banner.
lib/content.ts       Build-time loader that turns content/ into typed data.
public/              Images (project covers, avatars).
```

Search the code for `TODO` to find placeholder values (sample dates, emails, and
links) that should be replaced with real course data.
# comp3110-homepage
