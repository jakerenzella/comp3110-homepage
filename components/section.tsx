/** Shared section wrapper: a bordered heading + vertical rhythm, reused across
 *  pages so the whole site reads as one document set. */
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
        <h2 className="text-2xl font-semibold text-ink-strong border-b border-subtle pb-2 mb-6">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  )
}
