/**
 * Server-rendered MDX. Compiles a raw MDX body at build time with
 * next-mdx-remote's RSC entry and wraps it in HeroUI's `Typography.Prose`.
 * Used by the accelerator, resources, and project/mentor detail pages.
 */
import { Typography } from '@heroui/react'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { MdxTable } from './mdx-table'

// Both GFM pipe-tables and literal <table> elements render via HeroUI's Table.
const components = { table: MdxTable }

export function Mdx({ source }: { source: string }) {
  // Typography.Prose applies HeroUI's long-form text styling (headings, body,
  // lists, links, code) — the documented way to render rich content.
  return (
    <Typography.Prose>
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </Typography.Prose>
  )
}
