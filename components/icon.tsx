/**
 * Named icon wrapper over lucide-react. Consumers use `<Icon name="rocket" />`;
 * this maps the site's icon names (data/course.ts `IconName` plus a few UI
 * glyphs) to Lucide components. Lucide ships tree-shakeable SVG components, so
 * the static export stays fully offline with no icon-font/CDN dependency.
 * Server-safe (Lucide components carry no "use client").
 */
import type { ComponentType } from 'react'
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ExternalLink,
  FileCheck,
  Flag,
  GraduationCap,
  Mail,
  Megaphone,
  MapPin,
  Monitor,
  Moon,
  Package,
  Rocket,
  Sun,
  Trophy,
  Users,
  Zap,
  type LucideProps,
} from 'lucide-react'
import type { IconName } from '@/data/course'

const ICONS = {
  calendar: Calendar,
  location: MapPin,
  group: Users,
  grading: FileCheck,
  mail: Mail,
  rocket: Rocket,
  deploy: Package,
  flag: Flag,
  trophy: Trophy,
  sprint: Zap,
  school: GraduationCap,
  campaign: Megaphone,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  'arrow-right': ArrowRight,
  'chevron-down': ChevronDown,
  external: ExternalLink,
} satisfies Record<IconName, ComponentType<LucideProps>> &
  Record<string, ComponentType<LucideProps>>

export type IconGlyph = keyof typeof ICONS

export function Icon({
  name,
  size = 20,
  ...props
}: { name: IconGlyph; size?: number } & Omit<LucideProps, 'name' | 'size'>) {
  const Glyph = ICONS[name]
  // Match the previous hand-rolled stroke weight so the visual weight is stable.
  return <Glyph size={size} strokeWidth={1.75} aria-hidden="true" {...props} />
}
