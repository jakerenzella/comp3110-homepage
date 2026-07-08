'use client'

import { Accordion } from '@heroui/react'
import type { FaqItem } from '@/data/course'
import { Icon } from './icon'

/**
 * FAQ accordion driven from `course.faq`. Single-expand (React Aria default).
 */
export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <Accordion className="flex flex-col gap-3">
      {items.map((item, i) => (
        <Accordion.Item
          key={i}
          id={String(i)}
          className="border border-subtle rounded-sm bg-surface"
        >
          <Accordion.Heading>
            <Accordion.Trigger className="flex w-full items-center justify-between gap-4 p-4 text-left font-semibold text-ink-strong">
              {item.q}
              <Accordion.Indicator>
                <Icon name="chevron-down" size={20} className="text-muted" />
              </Accordion.Indicator>
            </Accordion.Trigger>
          </Accordion.Heading>
          <Accordion.Panel>
            <Accordion.Body className="px-4 pb-4 text-muted leading-relaxed">
              {item.a}
            </Accordion.Body>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  )
}
