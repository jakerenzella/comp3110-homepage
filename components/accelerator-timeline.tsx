/**
 * Condensed accelerator timeline for the home page: the five phases as a simple
 * vertical stepper with yellow markers on a connecting rail. Custom + server-
 * rendered (no client JS, no marketing-block styling) per the design brief.
 */
import type { Phase } from '@/data/course'
import { Icon } from './icon'

export function AcceleratorTimeline({ phases }: { phases: readonly Phase[] }) {
  return (
    <ol className="relative">
      {phases.map((phase, i) => {
        const isLast = i === phases.length - 1
        return (
          <li key={phase.name} className="relative flex gap-4 pb-8 last:pb-0">
            {/* rail + marker */}
            <div className="relative flex flex-col items-center">
              <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-subtle bg-accent text-ink-strong">
                <Icon name={phase.icon} size={18} />
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="absolute top-9 bottom-0 w-px bg-subtle"
                />
              )}
            </div>
            {/* content */}
            <div className="pt-1 pb-1">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="font-semibold text-ink-strong">{phase.name}</h3>
                <span className="font-mono text-xs text-muted">{phase.when}</span>
              </div>
              <p className="mt-1 text-muted leading-relaxed">{phase.summary}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
