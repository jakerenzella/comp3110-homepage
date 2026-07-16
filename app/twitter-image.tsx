import { renderCourseOg } from '@/lib/og'

// Bake the PNG at build time; `output: export` has no server to render it live.
export const dynamic = 'force-static'

export { alt, size, contentType } from '@/lib/og'

export default function Image() {
  return renderCourseOg()
}
