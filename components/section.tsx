/** Shared section wrapper: a bordered heading + vertical rhythm, reused across
 *  pages so the whole site reads as one document set. */
import { Typography } from '@heroui/react'

export function Section({
  title,
  id,
  children,
}: {
  title?: string
  id?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      {title ? (
        <Typography
          type="h2"
          className="border-b border-subtle pb-2 mb-6"
        >
          {title}
        </Typography>
      ) : null}
      {children}
    </section>
  )
}
