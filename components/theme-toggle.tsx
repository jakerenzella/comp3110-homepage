'use client'

/**
 * Three-state theme switch (System -> Light -> Dark -> System) built on
 * next-themes' `useTheme`, per HeroUI's dark-mode docs. next-themes owns the
 * pre-hydration script, persistence, and system tracking; this is just the UI.
 */
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Icon, type IconGlyph } from './icon'

type Mode = 'system' | 'light' | 'dark'

const ORDER: Mode[] = ['system', 'light', 'dark']
const META: Record<Mode, { label: string; icon: IconGlyph }> = {
  system: { label: 'System', icon: 'monitor' },
  light: { label: 'Light', icon: 'sun' },
  dark: { label: 'Dark', icon: 'moon' },
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  // theme is undefined until mounted; render a stable placeholder to keep the
  // server and first client render identical (avoids a hydration mismatch).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const mode: Mode =
    mounted && theme && ORDER.includes(theme as Mode) ? (theme as Mode) : 'system'

  function cycle() {
    setTheme(ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length])
  }

  const { label, icon } = META[mode]

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to switch.`}
      title={`Theme: ${label}`}
      className="flex h-9 w-9 items-center justify-center rounded-sm border border-subtle bg-surface text-muted transition-colors hover:text-ink-strong hover:border-accent"
    >
      <Icon name={icon} size={18} />
      <span className="sr-only">{label} theme</span>
    </button>
  )
}
