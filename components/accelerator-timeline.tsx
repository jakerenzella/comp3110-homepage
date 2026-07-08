'use client'

/**
 * Home-page accelerator timeline, built on the HeroUI Pro `Timeline` component
 * (https://heroui.pro/docs/react/components/timeline). Each phase is a
 * `Timeline.Item` with an icon `Marker`; the rail and connectors are handled by
 * the component (the connector auto-hides on the last item).
 */
import { Timeline } from '@heroui-pro/react'
import type { Phase } from '@/data/course'
import { Icon } from './icon'

export function AcceleratorTimeline({ phases }: { phases: readonly Phase[] }) {
  return (
    <Timeline>
      {phases.map((phase) => (
        <Timeline.Item key={phase.name}>
          <Timeline.Marker>
            <Icon name={phase.icon} size={16} />
          </Timeline.Marker>
          <Timeline.Content>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h3 className="font-semibold text-ink-strong">{phase.name}</h3>
              <span className="font-mono text-xs text-muted">{phase.when}</span>
            </div>
            <p className="mt-1 text-muted leading-relaxed">{phase.summary}</p>
          </Timeline.Content>
        </Timeline.Item>
      ))}
    </Timeline>
  )
}
