/**
 * Build-time content loader for the MDX collections under `content/`.
 *
 * Runs only on the server / at build time (uses `fs`). Pages call these to
 * turn `content/mentors/*.mdx` into typed data for the grid, and to fetch a
 * single file's raw MDX body. Adding a new .mdx file to a collection makes it
 * appear automatically, with no code changes.
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export type MentorFrontmatter = {
  name: string
  affiliation: string
  role: string
  expertise: string[]
  photo?: string
  links?: Record<string, string>
}

export type Entry<T> = {
  slug: string
  frontmatter: T
  /** Raw MDX body (everything after the frontmatter). */
  body: string
}

function readCollection<T>(dir: string): Entry<T>[] {
  const full = path.join(CONTENT_DIR, dir)
  if (!fs.existsSync(full)) return []
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith('.mdx'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(full, file), 'utf8')
      const { data, content } = matter(raw)
      return {
        slug: file.replace(/\.mdx$/, ''),
        frontmatter: data as T,
        body: content,
      }
    })
}

function readSingle(file: string): Entry<Record<string, unknown>> {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8')
  const { data, content } = matter(raw)
  return { slug: file.replace(/\.mdx$/, ''), frontmatter: data, body: content }
}

/** All mentors, alphabetical by name. */
export function getMentors(): Entry<MentorFrontmatter>[] {
  return readCollection<MentorFrontmatter>('mentors').sort((a, b) =>
    a.frontmatter.name.localeCompare(b.frontmatter.name),
  )
}

/** Load a top-level single MDX page such as accelerator.mdx / resources.mdx. */
export function getPage(file: string): Entry<Record<string, unknown>> {
  return readSingle(file)
}
