/**
 * Site footer — UNSW CSE attribution, quick links, and an Acknowledgement of
 * Country. Server component (static). Links come from `course.footerLinks`.
 */
import Image from 'next/image'
import { course } from '@/data/course'

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-subtle bg-surface mt-16">
      <div className="doc-column py-8 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Landscape UNSW logo locked up with the course + school */}
          <div className="flex items-center gap-3">
            {/* Inverted (white) logo swaps in for dark mode. */}
            <Image
              src="/brand/unsw-landscape.png"
              alt="UNSW Sydney"
              width={915}
              height={383}
              className="h-11 w-auto dark:hidden"
            />
            <Image
              src="/brand/unsw-landscape-inv.png"
              alt="UNSW Sydney"
              width={918}
              height={385}
              className="h-11 w-auto hidden dark:block"
            />
            <span aria-hidden="true" className="h-9 w-px bg-subtle" />
            <div className="text-sm leading-tight">
              <div className="font-semibold text-ink-strong">{course.code}</div>
              <div className="text-muted">{course.school}</div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {course.footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted hover:text-ink-strong hover:underline decoration-accent decoration-2 underline-offset-2"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="border-t border-subtle pt-6 flex flex-col gap-3">
          <h2 className="text-base font-semibold text-ink-strong">
            Acknowledgement of Country
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            UNSW respectfully acknowledges the Bidjigal, Biripai, Dharug, Gadigal,
            Gumbaynggirr, Ngunnawal and Wiradjuri peoples, on whose unceded lands
            we are privileged to learn, teach and work. We honour the Elders of
            these Nations, past and present, and recognise the broader Nations
            with whom we walk together. UNSW acknowledges the enduring connection
            of Aboriginal and Torres Strait Islander peoples to culture, community
            and Country.
          </p>
          <a
            href="https://ulurustatement.org/"
            className="self-start text-sm font-medium text-ink-strong underline decoration-accent decoration-2 underline-offset-2 hover:decoration-ink-strong"
          >
            The Uluru Statement
          </a>
        </div>
      </div>
    </footer>
  )
}
