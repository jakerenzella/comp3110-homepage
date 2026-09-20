'use client'

/**
 * "Add to your calendar" card: pick a lab stream, then subscribe with one of
 * the three ways calendar apps accept a feed URL. Built from HeroUI Card,
 * Select and Button per the v3 docs (Button has no documented anchor form, so
 * the two subscribe buttons navigate from onPress):
 * https://heroui.com/docs/react/components/select
 * https://heroui.com/docs/react/components/card
 *
 * The feed list comes from lib/calendar.ts (one per Lab in
 * data/timetable.json plus lecture-only), so a new stream appears here and as
 * a new .ics with no code change. The chosen stream is remembered in
 * localStorage so the assessment and syllabus pages agree.
 *
 * Apple Calendar and Outlook open `webcal://` URLs directly. Google Calendar
 * has no URL scheme, so it gets a prefilled "add by URL" link. The plain
 * https URL is offered for anything else.
 */
import { useEffect, useState } from 'react'
import type { Key } from '@heroui/react'
import { Button, Card, Label, Link, ListBox, Select, Typography } from '@heroui/react'
import { course } from '@/data/course'
import { feedPath, feeds } from '@/lib/calendar'
import { Icon } from './icon'

const STORAGE_KEY = 'comp3110-calendar-feed'
const DEFAULT_FEED = feeds[0].id

export function CalendarSubscribe() {
  const [feedId, setFeedId] = useState<Key | null>(DEFAULT_FEED)
  const [copied, setCopied] = useState(false)

  // Restore the last choice after mount so SSR and first render match.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved && feeds.some((f) => f.id === saved)) setFeedId(saved)
  }, [])

  function choose(value: Key | null) {
    if (value == null) return
    setFeedId(value)
    window.localStorage.setItem(STORAGE_KEY, String(value))
    setCopied(false)
  }

  const feed = feeds.find((f) => f.id === feedId) ?? feeds[0]
  const httpsUrl = `${course.siteUrl}${feedPath(feed)}`
  const webcalUrl = httpsUrl.replace(/^https?:/, 'webcal:')
  const googleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`

  async function copy() {
    await navigator.clipboard.writeText(httpsUrl)
    setCopied(true)
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Add to calendar</Card.Title>
        <Card.Description>
          Subscribe to lectures, lab, and task deadlines. Times are Sydney time.
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <Select
          value={feedId}
          onChange={choose}
          className="max-w-xs"
        >
          <Label>Your lab</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {feeds.map((f) => (
                <ListBox.Item key={f.id} id={f.id} textValue={f.label}>
                  {f.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <div className="flex flex-wrap gap-2">
          <Button onPress={() => window.location.assign(webcalUrl)}>
            <Icon name="calendar" size={16} />
            Apple or Outlook
          </Button>
          <Button onPress={() => window.open(googleUrl, '_blank', 'noopener')}>
            <Icon name="calendar" size={16} />
            Google Calendar
          </Button>
          <Button variant="outline" onPress={copy}>
            <Icon name={copied ? 'check' : 'copy'} size={16} />
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>
      </Card.Content>
      <Card.Footer>
        <Typography type="body-sm" color="muted">
          Paste the link into any calendar app that can subscribe to a URL:{' '}
          <Link href={httpsUrl} className="font-mono break-all">
            {httpsUrl}
          </Link>
        </Typography>
      </Card.Footer>
    </Card>
  )
}
