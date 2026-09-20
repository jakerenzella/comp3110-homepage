/**
 * Named icon wrapper over lucide-react. Consumers use `<Icon name="rocket" />`;
 * this maps the site's icon names (data/course.ts `IconName` plus a few UI
 * glyphs) to Lucide components. Lucide ships tree-shakeable SVG components, so
 * the static export stays fully offline with no icon-font/CDN dependency.
 * Server-safe (Lucide components carry no "use client").
 */
import type { ComponentType } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  Download,
  ExternalLink,
  FileCheck,
  Flag,
  GitBranch,
  Globe,
  GraduationCap,
  Link,
  IndentDecrease,
  IndentIncrease,
  Mail,
  Megaphone,
  MapPin,
  Monitor,
  Moon,
  Package,
  Play,
  Presentation,
  Plus,
  RotateCcw,
  Rocket,
  Sun,
  Trash2,
  TriangleAlert,
  Trophy,
  Users,
  Zap,
  type LucideProps,
} from 'lucide-react'
import type { IconName } from '@/data/course'

/**
 * Lucide dropped its brand marks, so LinkedIn is the one glyph drawn here: the
 * standard 24-unit logo path, filled rather than stroked, on the same props as
 * the Lucide components so `<Icon name="linkedin" />` behaves like the rest.
 */
function LinkedinGlyph({ size = 24, color = 'currentColor', ...props }: LucideProps) {
  // Lucide-specific stroke props have no meaning on a filled mark.
  const { strokeWidth: _strokeWidth, absoluteStrokeWidth: _abs, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      {...rest}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const ICONS = {
  calendar: Calendar,
  location: MapPin,
  group: Users,
  grading: FileCheck,
  mail: Mail,
  code: GitBranch,
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
  // People page: a mentor's own links.
  linkedin: LinkedinGlyph,
  globe: Globe,
  link: Link,
  // Syllabus outline: lecture slides for a topic.
  slides: Presentation,
  // Syllabus outline: the week's lecture recording.
  play: Play,
  // Editing glyphs, used by the syllabus builder.
  plus: Plus,
  trash: Trash2,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  indent: IndentIncrease,
  outdent: IndentDecrease,
  copy: Copy,
  download: Download,
  reset: RotateCcw,
  check: Check,
  warning: TriangleAlert,
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
