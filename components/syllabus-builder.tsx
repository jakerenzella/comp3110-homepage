'use client'

/**
 * An authoring tool for merging the two technical columns of the syllabus into
 * one outline. Not part of the public site: see app/syllabus/builder/page.tsx.
 *
 * The shape of the thing: one week at a time. The left pane is the outline for
 * that week and is the only editable surface. The right pane is everything that
 * should inform it — the Engineering topic waiting to be merged, the accelerator
 * session the week has to line up with, and the topics a 2026 review says are
 * missing. Clicking any source pulls it into the outline; nothing is dragged.
 *
 * Editing works on flat `Row`s (text + depth) rather than the nested bullets the
 * file stores, so reorder is a swap and indent is `depth ± 1`. See lib/outline.ts.
 *
 * Nothing here writes to the repo — a static export has no server. Work lives in
 * localStorage and leaves via the export panel as JSON to paste over
 * data/syllabus.json. That keeps the file the source of truth and the tool a
 * scratchpad, which is the right way round for something with a short life.
 */
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Chip,
  Dropdown,
  Input,
  Separator,
  TextField,
  Typography,
  toast,
} from '@heroui/react'
import { EmptyState } from '@heroui-pro/react'
import syllabus from '@/data/syllabus.json'
import { REFRAMES, SUGGESTED_TOPICS } from '@/data/syllabus-topics'
import {
  fromDraft,
  nextId,
  toCandidateBullets,
  toDraft,
  toSyllabusWeeks,
  type DraftSection,
  type DraftWeek,
  type Row,
  type WeekEntry,
} from '@/lib/outline'
import { review, type Finding } from '@/lib/syllabus-review'
import { Icon } from './icon'

const WEEKS = syllabus.weeks as WeekEntry[]
const STORAGE_KEY = 'comp3110:syllabus-builder:v1'

/* -------------------------------------------------------------------------- */
/* state helpers — all pure, all immutable                                     */
/* -------------------------------------------------------------------------- */

function replaceWeek(
  draft: DraftWeek[],
  week: number,
  fn: (w: DraftWeek) => DraftWeek,
): DraftWeek[] {
  return draft.map((w) => (w.week === week ? fn(w) : w))
}

function replaceSection(
  week: DraftWeek,
  sectionId: string,
  fn: (s: DraftSection) => DraftSection,
): DraftWeek {
  return {
    ...week,
    sections: week.sections.map((s) => (s.id === sectionId ? fn(s) : s)),
  }
}

/** Swap an item with its neighbour. Out-of-range means "already at the end". */
function move<T>(items: T[], index: number, delta: number): T[] {
  const target = index + delta
  if (target < 0 || target >= items.length) return items
  const next = [...items]
  const [item] = next.splice(index, 1)
  if (item) next.splice(target, 0, item)
  return next
}

/* -------------------------------------------------------------------------- */
/* row                                                                         */
/* -------------------------------------------------------------------------- */

function RowEditor({
  row,
  index,
  rows,
  onChange,
}: {
  row: Row
  index: number
  rows: Row[]
  onChange: (rows: Row[]) => void
}) {
  const set = (patch: Partial<Row>) =>
    onChange(rows.map((r) => (r.id === row.id ? { ...r, ...patch } : r)))

  // A nested row needs a top-level row above it to nest under.
  const canIndent = row.depth === 0 && index > 0
  const canOutdent = row.depth === 1

  return (
    <div
      className="flex items-center gap-1"
      style={{ paddingLeft: row.depth * 20 }}
    >
      <span aria-hidden="true" className="text-muted select-none">
        {row.depth === 0 ? '•' : '◦'}
      </span>
      <TextField
        aria-label={`Bullet ${index + 1}`}
        value={row.text}
        onChange={(text) => set({ text })}
        fullWidth
      >
        <Input placeholder="Bullet text" />
      </TextField>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Indent"
        isDisabled={!canIndent}
        onPress={() => set({ depth: 1 })}
      >
        <Icon name="indent" size={14} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Outdent"
        isDisabled={!canOutdent}
        onPress={() => set({ depth: 0 })}
      >
        <Icon name="outdent" size={14} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Move bullet up"
        isDisabled={index === 0}
        onPress={() => onChange(move(rows, index, -1))}
      >
        <Icon name="arrow-up" size={14} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Move bullet down"
        isDisabled={index === rows.length - 1}
        onPress={() => onChange(move(rows, index, 1))}
      >
        <Icon name="arrow-down" size={14} />
      </Button>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="Delete bullet"
        onPress={() => onChange(rows.filter((r) => r.id !== row.id))}
      >
        <Icon name="trash" size={14} />
      </Button>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* section                                                                     */
/* -------------------------------------------------------------------------- */

function SectionEditor({
  section,
  index,
  count,
  weeks,
  onChange,
  onMove,
  onDelete,
  onMoveToWeek,
}: {
  section: DraftSection
  index: number
  count: number
  weeks: number[]
  onChange: (s: DraftSection) => void
  onMove: (delta: number) => void
  onDelete: () => void
  onMoveToWeek: (week: number) => void
}) {
  return (
    <Card variant="secondary">
      <Card.Header className="flex flex-row items-center gap-2">
        <TextField
          aria-label="Section heading"
          value={section.heading}
          onChange={(heading) => onChange({ ...section, heading })}
          fullWidth
        >
          <Input placeholder="Heading" />
        </TextField>
        <Dropdown>
          {/* Dropdown.Trigger is itself the <button>; a Button inside it would
              nest one button in another and break hydration. */}
          <Dropdown.Trigger className="text-sm">Move to week</Dropdown.Trigger>
          <Dropdown.Popover>
            <Dropdown.Menu onAction={(key) => onMoveToWeek(Number(key))}>
              {weeks.map((w) => (
                <Dropdown.Item key={w} id={String(w)} textValue={`Week ${w}`}>
                  Week {w}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Move section up"
          isDisabled={index === 0}
          onPress={() => onMove(-1)}
        >
          <Icon name="arrow-up" size={14} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Move section down"
          isDisabled={index === count - 1}
          onPress={() => onMove(1)}
        >
          <Icon name="arrow-down" size={14} />
        </Button>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label="Delete section"
          onPress={onDelete}
        >
          <Icon name="trash" size={14} />
        </Button>
      </Card.Header>
      <Card.Content className="flex flex-col gap-1">
        {section.rows.map((row, i) => (
          <RowEditor
            key={row.id}
            row={row}
            index={i}
            rows={section.rows}
            onChange={(rows) => onChange({ ...section, rows })}
          />
        ))}
        <div>
          <Button
            size="sm"
            variant="tertiary"
            onPress={() =>
              onChange({
                ...section,
                rows: [...section.rows, { id: nextId('row'), text: '', depth: 0 }],
              })
            }
          >
            <Icon name="plus" size={14} />
            Add bullet
          </Button>
        </div>
      </Card.Content>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* sources                                                                     */
/* -------------------------------------------------------------------------- */

function SourcesPane({
  entry,
  onAddSection,
  onAddBullet,
}: {
  entry: WeekEntry
  onAddSection: (heading: string, bullets: string[]) => void
  onAddBullet: (text: string) => void
}) {
  const [showAll, setShowAll] = useState(false)
  const technical = entry.technical
  const candidates = technical ? toCandidateBullets(technical.detail) : []
  const topics = showAll
    ? SUGGESTED_TOPICS
    : SUGGESTED_TOPICS.filter((t) => t.suggestedWeek === entry.week)
  const reframes = REFRAMES.filter((r) => r.week === entry.week)

  return (
    <div className="flex flex-col gap-4">
      {/* The column being merged away. Gone once `technical` is pruned. */}
      {technical ? (
        <Card>
          <Card.Header>
            <Card.Title>Engineering</Card.Title>
            <Card.Description>
              The column this tool exists to fold in.
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-3">
            <Typography type="body-sm" weight="medium">
              {technical.topic}
            </Typography>
            <Button
              size="sm"
              variant="secondary"
              onPress={() => onAddSection(technical.topic, candidates)}
            >
              <Icon name="plus" size={14} />
              Add as section
            </Button>
            <Separator />
            <Typography type="body-xs" color="muted">
              Or take it a sentence at a time:
            </Typography>
            {candidates.map((text) => (
              <div key={text} className="flex items-start gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  aria-label={`Add bullet: ${text}`}
                  onPress={() => onAddBullet(text)}
                >
                  <Icon name="plus" size={14} />
                </Button>
                <Typography type="body-xs" color="muted">
                  {text}
                </Typography>
              </div>
            ))}
          </Card.Content>
        </Card>
      ) : null}

      {/* Context, deliberately not addable: the accelerator is the fixed point. */}
      <Card variant="tertiary">
        <Card.Header>
          <Card.Title>Accelerator, week {entry.week}</Card.Title>
          <Card.Description>
            What this week has to line up with.
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-2">
          <Typography type="body-sm" weight="medium">
            {entry.accelerator.topic}
          </Typography>
          <Typography type="body-xs" color="muted">
            {entry.accelerator.detail}
          </Typography>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Suggested</Card.Title>
          <Card.Description>
            From a July 2026 review of what the field teaches.
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          {topics.length === 0 ? (
            <Typography type="body-xs" color="muted">
              Nothing suggested for this week.
            </Typography>
          ) : null}
          {topics.map((topic) => (
            <div key={topic.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Typography type="body-sm" weight="medium">
                  {topic.title}
                </Typography>
                {topic.priority === 'high' ? (
                  <Chip size="sm" variant="soft" color="warning">
                    <Chip.Label>gap</Chip.Label>
                  </Chip>
                ) : null}
                {showAll ? (
                  <Chip size="sm" variant="soft">
                    <Chip.Label>wk {topic.suggestedWeek}</Chip.Label>
                  </Chip>
                ) : null}
              </div>
              <Typography type="body-xs" color="muted">
                {topic.why}
              </Typography>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => onAddSection(topic.title, topic.bullets)}
                >
                  <Icon name="plus" size={14} />
                  Add
                </Button>
                <a
                  href={topic.source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted underline underline-offset-2 hover:text-ink-strong"
                >
                  {topic.source.label}
                </a>
              </div>
            </div>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onPress={() => setShowAll((v) => !v)}
          >
            {showAll ? 'Only this week' : 'Show all weeks'}
          </Button>
        </Card.Content>
      </Card>

      {reframes.length ? (
        <Card variant="tertiary">
          <Card.Header>
            <Card.Title>Worth reconsidering</Card.Title>
            <Card.Description>
              Not gaps: content that is here at the wrong size.
            </Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-3">
            {reframes.map((r) => (
              <div key={r.id} className="flex flex-col gap-1">
                <Typography type="body-sm" weight="medium">
                  {r.title}
                </Typography>
                <Typography type="body-xs" color="muted">
                  {r.note}
                </Typography>
              </div>
            ))}
          </Card.Content>
        </Card>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* review                                                                      */
/* -------------------------------------------------------------------------- */

const KIND_LABEL: Record<Finding['kind'], string> = {
  tool: 'tool-led',
  load: 'timeline',
  empty: 'timeline',
  unmerged: 'merge',
  alignment: 'accelerator',
  coverage: 'content',
  duplicate: 'content',
}

function ReviewPanel({
  findings,
  onGoToWeek,
}: {
  findings: Finding[]
  onGoToWeek: (week: number) => void
}) {
  const warnings = findings.filter((f) => f.severity === 'warn')

  if (!findings.length) {
    return (
      <Alert status="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Nothing flagged.</Alert.Title>
        </Alert.Content>
      </Alert>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Typography type="h3">Review</Typography>
        <Chip size="sm" variant="soft" color={warnings.length ? 'warning' : 'default'}>
          <Chip.Label>
            {warnings.length} to look at, {findings.length - warnings.length}{' '}
            for information
          </Chip.Label>
        </Chip>
      </div>
      <ul className="flex flex-col gap-2">
        {findings.map((f) => (
          <li key={f.id}>
            <Alert status={f.severity === 'warn' ? 'warning' : 'default'}>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{f.message}</Alert.Title>
                {f.hint ? (
                  <Alert.Description>{f.hint}</Alert.Description>
                ) : null}
              </Alert.Content>
              <div className="flex items-center gap-2 self-start">
                <Chip size="sm" variant="soft">
                  <Chip.Label>{KIND_LABEL[f.kind]}</Chip.Label>
                </Chip>
                {f.week !== null ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => onGoToWeek(f.week as number)}
                  >
                    Week {f.week}
                  </Button>
                ) : null}
              </div>
            </Alert>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* export                                                                      */
/* -------------------------------------------------------------------------- */

function ExportPanel({ draft }: { draft: DraftWeek[] }) {
  // The whole file, not just the weeks, so it can be pasted over wholesale.
  const json = useMemo(
    () =>
      JSON.stringify(
        { ...syllabus, weeks: toSyllabusWeeks(WEEKS, draft) },
        null,
        2,
      ) + '\n',
    [draft],
  )

  const download = () => {
    const url = URL.createObjectURL(
      new Blob([json], { type: 'application/json' }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'syllabus.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3">
      <Typography type="h3">Export</Typography>
      <Typography type="body-sm" color="muted">
        The whole of{' '}
        <Typography type="code">data/syllabus.json</Typography> with every
        week&rsquo;s outline replaced. The other tracks pass through untouched.
      </Typography>
      <div className="flex flex-wrap gap-2">
        <Button
          onPress={async () => {
            await navigator.clipboard.writeText(json)
            toast.success('Copied. Paste it over data/syllabus.json.')
          }}
        >
          <Icon name="copy" size={16} />
          Copy JSON
        </Button>
        <Button variant="secondary" onPress={download}>
          <Icon name="download" size={16} />
          Download
        </Button>
      </div>
      <pre className="max-h-72 overflow-auto border border-subtle bg-surface p-3 text-xs">
        {json}
      </pre>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* builder                                                                     */
/* -------------------------------------------------------------------------- */

export function SyllabusBuilder() {
  // Seeded from the file so the server and the first client render agree;
  // localStorage is read after mount, which is the only hydration-safe order.
  const [draft, setDraft] = useState<DraftWeek[]>(() => toDraft(WEEKS))
  const [selected, setSelected] = useState(1)
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setDraft(JSON.parse(saved) as DraftWeek[])
        setRestored(true)
      }
    } catch {
      // A corrupt or unreadable draft is not worth failing over: the file is
      // still the source of truth, and the tool reloads from it.
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch {
      // Private mode, quota, etc. Losing the autosave is survivable; losing the
      // session to a thrown error is not.
    }
  }, [draft])

  const findings = useMemo(() => review(draft, WEEKS), [draft])
  const week = draft.find((w) => w.week === selected)
  const entry = WEEKS.find((e) => e.week === selected)
  const weekNumbers = draft.map((w) => w.week)

  const update = (fn: (w: DraftWeek) => DraftWeek) =>
    setDraft((d) => replaceWeek(d, selected, fn))

  const addSection = (heading: string, bullets: string[]) =>
    update((w) => ({
      ...w,
      sections: [
        ...w.sections,
        {
          id: nextId('section'),
          heading,
          rows: bullets.map((text) => ({
            id: nextId('row'),
            text,
            depth: 0 as const,
          })),
        },
      ],
    }))

  /** Append to the last section, or start one if the week is empty. */
  const addBullet = (text: string) =>
    update((w) => {
      if (!w.sections.length) {
        return {
          ...w,
          sections: [
            {
              id: nextId('section'),
              heading: '',
              rows: [{ id: nextId('row'), text, depth: 0 }],
            },
          ],
        }
      }
      const last = w.sections.at(-1) as DraftSection
      return replaceSection(w, last.id, (s) => ({
        ...s,
        rows: [...s.rows, { id: nextId('row'), text, depth: 0 }],
      }))
    })

  const moveSectionToWeek = (sectionId: string, target: number) => {
    if (target === selected) return
    setDraft((d) => {
      const from = d.find((w) => w.week === selected)
      const section = from?.sections.find((s) => s.id === sectionId)
      if (!section) return d
      return d.map((w) => {
        if (w.week === selected) {
          return { ...w, sections: w.sections.filter((s) => s.id !== sectionId) }
        }
        if (w.week === target) {
          return { ...w, sections: [...w.sections, section] }
        }
        return w
      })
    })
    toast(`Moved to week ${target}.`)
  }

  /**
   * Trade the whole outline of the selected week with another week's. Only the
   * `sections` move: the week number and its sprint stripe belong to the
   * calendar position, not to the content, so week 3 stays in Sprint 1 whatever
   * outline lands in it. This is the week-2/week-3 flip as one action.
   */
  const swapWeeks = (target: number) => {
    if (target === selected) return
    setDraft((d) => {
      const a = d.find((w) => w.week === selected)
      const b = d.find((w) => w.week === target)
      if (!a || !b) return d
      return d.map((w) => {
        if (w.week === selected) return { ...w, sections: b.sections }
        if (w.week === target) return { ...w, sections: a.sections }
        return w
      })
    })
    toast(`Swapped weeks ${selected} and ${target}.`)
  }

  return (
    <div className="flex flex-col gap-6">
      {restored ? (
        <Alert status="accent">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Picked up where you left off.</Alert.Title>
            <Alert.Description>
              This draft is from your browser, not the file. Reset to start again
              from data/syllabus.json.
            </Alert.Description>
          </Alert.Content>
          <Button
            size="sm"
            variant="tertiary"
            className="self-start"
            onPress={() => {
              setDraft(toDraft(WEEKS))
              setRestored(false)
              toast('Reset to the file.')
            }}
          >
            <Icon name="reset" size={14} />
            Reset
          </Button>
        </Alert>
      ) : null}

      {/* Week rail. Each week wears its own findings count, so the thin and the
          overloaded weeks are visible without opening them. */}
      <div className="flex flex-wrap gap-2">
        {draft.map((w) => {
          const warn = findings.filter(
            (f) => f.week === w.week && f.severity === 'warn',
          ).length
          return (
            <Button
              key={w.week}
              size="sm"
              variant={w.week === selected ? 'primary' : 'tertiary'}
              onPress={() => setSelected(w.week)}
            >
              Week {w.week}
              {warn ? (
                <Chip size="sm" variant="soft" color="warning">
                  <Chip.Label>{warn}</Chip.Label>
                </Chip>
              ) : null}
            </Button>
          )
        })}
      </div>

      {week && entry ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <Typography type="h3">Week {week.week} outline</Typography>
              <div className="flex items-center gap-2">
                <Dropdown>
                  {/* Trigger is itself the <button>; see the section dropdown. */}
                  <Dropdown.Trigger className="text-sm">
                    Swap with week
                  </Dropdown.Trigger>
                  <Dropdown.Popover>
                    <Dropdown.Menu
                      onAction={(key) => swapWeeks(Number(key))}
                      disabledKeys={[String(selected)]}
                    >
                      {weekNumbers.map((w) => (
                        <Dropdown.Item
                          key={w}
                          id={String(w)}
                          textValue={`Week ${w}`}
                        >
                          Week {w}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => addSection('', [])}
                >
                  <Icon name="plus" size={14} />
                  Add section
                </Button>
              </div>
            </div>

            {week.sections.length === 0 ? (
              <EmptyState>
                <EmptyState.Media>
                  <Icon name="plus" size={24} />
                </EmptyState.Media>
                <EmptyState.Header>
                  <EmptyState.Title>Nothing here yet</EmptyState.Title>
                  <EmptyState.Description>
                    Pull a topic across from the sources on the right, or add a
                    section and write it from scratch.
                  </EmptyState.Description>
                </EmptyState.Header>
              </EmptyState>
            ) : null}

            {week.sections.map((section, i) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={i}
                count={week.sections.length}
                weeks={weekNumbers}
                onChange={(s) =>
                  update((w) => replaceSection(w, section.id, () => s))
                }
                onMove={(delta) =>
                  update((w) => ({ ...w, sections: move(w.sections, i, delta) }))
                }
                onDelete={() =>
                  update((w) => ({
                    ...w,
                    sections: w.sections.filter((s) => s.id !== section.id),
                  }))
                }
                onMoveToWeek={(target) => moveSectionToWeek(section.id, target)}
              />
            ))}

            {/* What this week will look like in the table. */}
            <Card variant="tertiary">
              <Card.Header>
                <Card.Title>Preview</Card.Title>
                <Card.Description>
                  The cell as the syllabus table will render it.
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <OutlinePreview week={week} />
              </Card.Content>
            </Card>
          </div>

          <SourcesPane
            entry={entry}
            onAddSection={addSection}
            onAddBullet={addBullet}
          />
        </div>
      ) : null}

      <Separator />
      <ReviewPanel findings={findings} onGoToWeek={setSelected} />
      <Separator />
      <ExportPanel draft={draft} />
    </div>
  )
}

/** Renders a draft week the way components/syllabus-table.tsx renders a cell. */
function OutlinePreview({ week }: { week: DraftWeek }) {
  const outline = fromDraft(week)
  if (!outline.sections.length) {
    return (
      <Typography type="body-xs" color="muted">
        Empty.
      </Typography>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {outline.sections.map((section, i) => (
        <div key={`${section.heading}-${i}`} className="flex flex-col gap-1.5">
          <Typography type="body-sm" weight="medium">
            {section.heading}
          </Typography>
          <ul className="flex list-disc flex-col gap-0.5 pl-4">
            {section.bullets.map((bullet) => {
              const text = typeof bullet === 'string' ? bullet : bullet.text
              const children =
                typeof bullet === 'string' ? [] : (bullet.children ?? [])
              return (
                <li key={text}>
                  <Typography type="body-sm" color="muted">
                    {text}
                  </Typography>
                  {children.length ? (
                    <ul className="mt-0.5 flex list-[circle] flex-col gap-0.5 pl-4">
                      {children.map((child) => (
                        <li key={child}>
                          <Typography type="body-sm" color="muted">
                            {child}
                          </Typography>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
