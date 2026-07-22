import type { Metadata } from 'next'
import { getPage } from '@/lib/content'
import { Mdx } from '@/components/mdx'

const page = getPage('partners.mdx')

export const metadata: Metadata = {
  title: 'Partners',
  description: (page.frontmatter.description as string) ?? undefined,
}

export default function PartnersPage() {
  return (
    <div className="doc-column py-10 md:py-14">
      <Mdx source={page.body} />
    </div>
  )
}
