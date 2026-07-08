/**
 * Slim announcement strip above the navbar. Driven by `course.announcement`.
 * Renders nothing when the announcement is null — and because it is the first
 * element in the flow (not absolutely positioned), an empty announcement simply
 * reserves no space, so toggling it causes no layout shift of the content below.
 */
import type { Announcement } from '@/data/course'
import { Icon } from './icon'

export function AnnouncementBanner({
  announcement,
}: {
  announcement: Announcement | null
}) {
  if (!announcement) return null

  return (
    <div className="w-full bg-banner border-b border-subtle text-ink">
      <div className="doc-column flex items-center justify-center gap-2 py-2 text-sm text-center">
        <Icon name="campaign" size={16} className="shrink-0 text-muted" />
        <span>{announcement.message}</span>
        {announcement.href && announcement.linkLabel ? (
          <a
            href={announcement.href}
            className="font-semibold underline decoration-accent decoration-2 underline-offset-2 hover:decoration-ink-strong"
          >
            {announcement.linkLabel}
          </a>
        ) : null}
      </div>
    </div>
  )
}
