/** Tailwind CSS v4 is a PostCSS plugin. This config lets Next.js run it so the
 *  `@import "tailwindcss"` in globals.css scans the source and generates
 *  utilities + Preflight. Without it, only literal CSS is emitted. */
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
