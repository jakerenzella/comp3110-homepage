/**
 * Server-rendered MDX. Compiles a raw MDX body at build time with
 * next-mdx-remote's RSC entry and wraps it in the shared `.prose-doc` styles.
 * Used by the accelerator, resources, and project/mentor detail pages.
 */
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'

export function Mdx({ source }: { source: string }) {
  return (
    <div className="prose-doc">
      <MDXRemote
        source={source}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </div>
  )
}
