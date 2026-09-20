/**
 * Serves the calendar feeds at /calendar/<id>.ics. With `output: 'export'`
 * Next.js runs this once per `generateStaticParams` entry at build time and
 * writes the response to `out/calendar/<id>.ics`, so the host serves plain
 * static files (typed `text/calendar` from the extension). The content comes
 * from lib/calendar.ts and ultimately the JSON under data/.
 */
import { buildFeed, feeds } from '@/lib/calendar'

export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return feeds.map((feed) => ({ feed: `${feed.id}.ics` }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ feed: string }> },
) {
  const { feed: file } = await params
  const feed = feeds.find((f) => `${f.id}.ics` === file)
  if (!feed) return new Response('Not found', { status: 404 })
  return new Response(buildFeed(feed), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${file}"`,
    },
  })
}
