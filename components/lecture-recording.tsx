'use client'

/**
 * A week's lecture recording: a "Watch the lecture" button that opens the
 * Echo360 player in a Modal, so a student plays the lecture without leaving
 * the schedule. Uses the controlled Modal pattern from the HeroUI docs:
 * https://heroui.com/docs/react/components/modal
 *
 * `href` is the recording's Echo360 public link (Share > Public link). Echo360's
 * own embed snippet is that same URL with the player's autoplay and automute
 * flags appended, so one field in the data serves both the iframe and the
 * "Open in Echo360" fallback. The iframe only exists while the modal is open,
 * so the table doesn't load a player per week up front.
 *
 * The trigger is a ghost Button pulled left by its own horizontal padding, so
 * its play glyph lines up with the slides icons in the gutter above and its
 * label lines up with the headings.
 */
import { useState } from 'react'
import { Button, Modal, Typography } from '@heroui/react'
import Link from 'next/link'
import { Icon } from './icon'

function embedUrl(publicUrl: string): string {
  const url = new URL(publicUrl)
  url.searchParams.set('autoplay', 'false')
  url.searchParams.set('automute', 'false')
  return url.toString()
}

export function LectureRecording({
  title,
  href,
}: {
  /** Names the recording in the dialog heading and the iframe: "Week 1 lecture". */
  title: string
  /** The Echo360 public link. */
  href: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onPress={() => setIsOpen(true)}
        className="-ml-3 self-start"
      >
        <Icon name="play" size={16} />
        Watch the lecture
      </Button>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog className="sm:max-w-4xl">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <iframe
                src={embedUrl(href)}
                title={title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="aspect-video w-full rounded-2xl bg-black"
              />
            </Modal.Body>
            <Modal.Footer>
              <Typography type="body-sm" color="muted">
                <Link
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-2 hover:no-underline"
                >
                  Open in Echo360
                  <Icon name="external" size={14} />
                </Link>
              </Typography>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}
