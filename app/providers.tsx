'use client'

/**
 * next-themes provider — the approach HeroUI's docs recommend for dark mode.
 * We use `attribute="data-theme"` because the whole site keys off
 * `[data-theme='dark']`: HeroUI's own dark block, the Stitch token overrides,
 * and the Tailwind `dark:` custom-variant (see app/globals.css). next-themes
 * injects its own pre-hydration script (no FOUC) and persists the choice.
 */
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  )
}
