'use client'

/**
 * Three-state theme switch (System -> Light -> Dark -> System) built on
 * next-themes' `useTheme`, per HeroUI's dark-mode docs. next-themes owns the
 * pre-hydration script, persistence, and system tracking; this is just the UI:
 * a HeroUI icon-only ghost Button, so it sits in the navbar without a frame.
 */
import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { Button } from '@heroui/react'
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
    <Button
      isIconOnly
      variant="ghost"
      size="sm"
      aria-label={`Theme: ${label}. Click to switch.`}
      onPress={cycle}
    >
      <Icon name={icon} size={18} />
    </Button>
  )
}
