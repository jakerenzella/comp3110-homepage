# COMP3110 course site

## Writing style

- Never use em dashes (—) in any content, code comments, or copy. Use a colon, a comma, parentheses, or two separate sentences instead.

## HeroUI

- This site uses **HeroUI v3** (`@heroui/react`) + **HeroUI Pro** (`@heroui-pro/react`).
- **Always follow the official HeroUI docs.** Before using or changing any HeroUI component, fetch and read its docs — do not improvise props, hand-roll the collection, or guess the API from memory.
  - **Always fetch the docs version matching the installed HeroUI version.** This project is v3, so use the v3 docs at `https://heroui.com/docs/react/...` (component pages: `https://heroui.com/docs/react/components/<name>`). Do NOT use v2 docs (`v2.heroui.com`) or beta docs — the APIs differ. Check the installed version with `node -e "require('./node_modules/@heroui/react/package.json').version"` if unsure. The docs are LLM-friendly (fetchable as plain content).
- **Keep it minimal and in line with what the docs intend.** Use the documented component structure and props; don't add wrapper markup or logic the docs don't call for.
- **Avoid CSS or Tailwind class overrides on HeroUI components unless necessary.** Prefer the component's own props/variants and documented styling hooks. If the default looks wrong, first re-check the docs for the intended pattern rather than fighting it with `!important`, custom classes, or global CSS. Only override when the docs offer no supported way, and keep it as small as possible.
- **Dark mode** follows HeroUI's guide: use `next-themes` (`ThemeProvider` in `app/providers.tsx`, `attribute="data-theme"`, `defaultTheme="system"`, `enableSystem`) with `suppressHydrationWarning` on `<html>`. See https://heroui.com/docs/react/getting-started/dark-mode. Do not hand-roll theme scripts.
- **Prefer HeroUI components over hand-rolled UI.** Before building any UI pattern (card, banner, badge, empty state, timeline, stepper, accordion, etc.) from raw `<div>`s + Tailwind, scan the available components and use the relevant one:
  1. **HeroUI Pro** (`@heroui-pro/react`) first — richer patterns. Docs: `https://heroui.pro/docs/react/components.mdx` (and `.../components/<name>.mdx`). Installed component list: `node -e "console.log(Object.keys(require('./node_modules/@heroui-pro/react/package.json').exports))"`.
  2. Then **core HeroUI** (`@heroui/react`).
  Only hand-roll when no component fits. Match the doc version to the installed package version (see rule above). The home-page timeline uses Pro `Timeline`; the navbar uses Pro `Navbar`; tables/tabs/accordion/avatar use HeroUI components — keep new UI consistent with that.
- **Tables** must use the dynamic-collection API (`columns` on `Table.Header`, `items` on `Table.Body`, with render functions and stable `id`s on the data). Hand-mapping static `<Table.Row>`/`<Table.Cell>` (or inventing cell `id`s) makes react-aria's keys non-deterministic and breaks SSR hydration. Because the render-function children can't cross the RSC boundary, a Table must live in a client component.
- Verify UI changes in a real browser (not just screenshots): hydration mismatches only surface in the browser console under `next dev`. There is a puppeteer smoke test pattern that loads each page and asserts no console/hydration errors.
