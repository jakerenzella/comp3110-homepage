/**
 * Server-rendered MDX. Compiles a raw MDX body at build time with
 * next-mdx-remote's RSC entry and wraps it in the shared `.prose-doc` styles.
 * Used by the accelerator, resources, and project/mentor detail pages.
 */
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { MdxTable } from './mdx-table'

// Both GFM pipe-tables and literal <table> elements render via HeroUI's Table.
const components = { table: MdxTable }

export function Mdx({ source }: { source: string }) {
  return (
    <div className="prose-doc">
      <MDXRemote
        source={source}
        components={components}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  )
}
