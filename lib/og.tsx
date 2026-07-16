/**
 * The homepage social card, drawn from live course data.
 *
 * Rendered by `next/og` (Satori) at build time into a static PNG, so it ships
 * with the static export and needs no server. It is "dynamic" in that every
 * value comes from the data, not from a hand-made image: the title and term
 * from the course/syllabus files, and the strip along the bottom straight from
 * `data/syllabus.json` — one tick per week, coloured by sprint, with Demo Day
 * starred. Edit the syllabus and the card redraws on the next build.
 *
 * Shared by the `/opengraph-image` and `/twitter-image` routes; both just
 * re-export the pieces here so the card is defined once.
 *
 * Satori constraints worth remembering: it has no system fonts (every glyph
 * needs a supplied font), and any element with more than one child must set
 * `display: flex`.
 */
import { ImageResponse } from 'next/og'
import fs from 'node:fs'
import path from 'node:path'
import { course } from '@/data/course'
import syllabus from '@/data/syllabus.json'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = `${course.code}: ${course.title} — UNSW`

// Brand tokens, copied from the light theme in app/globals.css. Hardcoded
// because Satori styles are inline and cannot read CSS custom properties.
const INK_STRONG = '#000000'
const INK = '#1a1c1c'
const MUTED = '#555555'
const PAPER = '#f9f9f9'
const ACCENT = '#ffeb00'

const FONT_DIR = path.join(process.cwd(), 'public/brand/fonts')
const readFont = (file: string) => fs.readFileSync(path.join(FONT_DIR, file))
const dataUri = (rel: string, mime: string) =>
  `data:${mime};base64,${fs.readFileSync(path.join(process.cwd(), rel)).toString('base64')}`

export async function renderCourseOg() {
  const weeks = [...syllabus.weeks]
  const crest = dataUri('public/brand/unsw-portrait.png', 'image/png')

  // "Machine Learning Engineering" -> "Machine Learning" / "Engineering".
  const words = course.title.split(' ')
  const line1 = words.slice(0, -1).join(' ')
  const line2 = words.at(-1) ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: PAPER,
          padding: 64,
          fontFamily: 'Roboto',
          color: INK,
        }}
      >
        {/* kicker + crest */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: INK_STRONG,
            }}
          >
            {course.code}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={crest} alt="" height={100} />
        </div>

        {/* headline, centred in the space below the header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Clancy',
              fontWeight: 700,
              fontSize: 112,
              lineHeight: 1.0,
              color: INK_STRONG,
            }}
          >
            <span>{line1}</span>
            <span>{line2}</span>
          </div>
          <div style={{ display: 'flex', width: 240, height: 16, background: ACCENT, marginTop: 32 }} />
          <div style={{ display: 'flex', fontSize: 34, color: INK, marginTop: 32 }}>
            From idea to Demo Day in {weeks.length} weeks.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Clancy', data: readFont('Clancy-Bold.otf'), weight: 700, style: 'normal' },
        { name: 'Roboto', data: readFont('Roboto-Regular.ttf'), weight: 400, style: 'normal' },
        { name: 'Roboto', data: readFont('Roboto-Medium.ttf'), weight: 500, style: 'normal' },
      ],
    },
  )
}
