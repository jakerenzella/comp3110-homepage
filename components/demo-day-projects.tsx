'use client'

/**
 * A term's Demo Day projects: one card per team, and a single shared Modal
 * that plays the selected team's pitch from YouTube. Follows the same
 * controlled Modal pattern as `lecture-recording.tsx`:
 * https://heroui.com/docs/react/components/modal
 *
 * The data lives in `data/projects-<term>.json`. Once a project's `youtube`
 * field holds the video id (the part after `v=` in the video's URL), its card
 * shows the video's thumbnail and becomes a button that opens the player.
 * `cover` is the placeholder image under `public/` used until then. `clip` names the source recording so
 * the id can be matched to the right upload; it is not shown on the site.
 * The iframe only exists while the modal is open, so the page does not load
 * a player per project up front.
 */
import { useState } from 'react'
import { Modal, Typography } from '@heroui/react'
import Image from 'next/image'

export type DemoDayProject = {
  id: string
  title: string
  /** Team id such as "G19". Absent for an individual project. */
  group?: string
  /** Author of an individual project. */
  by?: string
  /** The project's earlier name, if it was renamed during the term. */
  formerly?: string
  /** Placeholder card image, a path under `public/`. */
  cover: string
  /** File name of the Demo Day recording this project's video comes from. */
  clip?: string
  /** YouTube video id. Empty until the pitch is uploaded. */
  youtube?: string
}

const TERM_YEAR = 2026

const CARD =
  'group flex flex-col border border-subtle bg-surface rounded-sm overflow-hidden'

export function DemoDayProjects({ projects }: { projects: DemoDayProject[] }) {
  const [playing, setPlaying] = useState<DemoDayProject | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {projects.map((p) => {
          const body = (
            <>
              <div className="relative aspect-video w-full border-b border-subtle bg-paper">
                {p.youtube ? (
                  // YouTube's 480x360 thumbnail is letterboxed; object-cover in
                  // the 16:9 frame crops the bars away.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`https://i.ytimg.com/vi/${p.youtube}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={p.cover}
                    alt=""
                    width={800}
                    height={450}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <Typography
                    type="body"
                    weight="semibold"
                    className="leading-snug"
                  >
                    {p.title}
                  </Typography>
                  <span className="font-mono text-xs text-muted shrink-0 pt-1">
                    {p.group ?? TERM_YEAR}
                  </span>
                </div>
                {p.by || p.formerly ? (
                  <Typography type="body-sm" color="muted">
                    {p.by ?? `Formerly ${p.formerly}`}
                  </Typography>
                ) : null}
              </div>
            </>
          )
          // With a pitch video the whole card is a button that opens the
          // player; without one it is static.
          return p.youtube ? (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlaying(p)}
              aria-label={`Watch the ${p.title} pitch`}
              className={`${CARD} cursor-pointer text-left hover:border-ink-strong transition-colors`}
            >
              {body}
            </button>
          ) : (
            <div key={p.id} className={CARD}>
              {body}
            </div>
          )
        })}
      </div>

      <Modal.Backdrop
        isOpen={playing !== null}
        onOpenChange={(open) => {
          if (!open) setPlaying(null)
        }}
      >
        <Modal.Container size="lg">
          <Modal.Dialog className="sm:max-w-4xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{playing?.title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {playing?.youtube ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playing.youtube}?autoplay=1&rel=0`}
                  title={`${playing.title} Demo Day pitch`}
                  allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="aspect-video w-full rounded-2xl bg-black"
                />
              ) : null}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}
