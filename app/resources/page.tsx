import type { Metadata } from 'next'
import { getPage } from '@/lib/content'
import { Mdx } from '@/components/mdx'

const page = getPage('resources.mdx')

export const metadata: Metadata = {
  title: 'Resources',
  description: (page.frontmatter.description as string) ?? undefined,
}

export default function ResourcesPage() {
  return (
    <div className="doc-column py-10 md:py-14">
      <Mdx source={page.body} />
    </div>
  )
}
