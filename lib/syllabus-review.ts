/**
 * The checks the builder runs over a draft outline.
 *
 * These are lints, not rules: each one is a question worth answering, and every
 * one of them is dismissable by simply ignoring it. They exist because the four
 * things that go wrong in a syllabus are hard to see from inside a single week,
 * and only show up when you look across all ten at once:
 *
 *  - is the content right?          -> `coverage`, `duplicate`
 *  - does it align with the         -> `alignment`
 *    accelerator?
 *  - is it modern, not tool-led?    -> `tool`
 *  - does it fit the timeline?      -> `load`, `empty`, `unmerged`
 *
 * Everything here is a pure function of the draft, so the panel recomputes as
 * you type with no effects and nothing to keep in sync.
 */
import type { DraftWeek, WeekEntry } from './outline'
import { SUGGESTED_TOPICS } from '@/data/syllabus-topics'

export type Severity = 'warn' | 'info'

export type Finding = {
  id: string
  /** The week it belongs to, or null for a whole-of-course finding. */
  week: number | null
  severity: Severity
  kind: 'tool' | 'load' | 'empty' | 'unmerged' | 'alignment' | 'coverage' | 'duplicate'
  message: string
  /** What to do about it, when there is an obvious move. */
  hint?: string
}

/**
 * Vendor and library names that date a syllabus. The rule is not "never say
 * these": it is that a tool should be the example under a concept heading, not
 * the heading itself, because the tool churns and the concept does not.
 */
const TOOL_NAMES: { pattern: RegExp; concept: string }[] = [
  { pattern: /\bunsloth\b/i, concept: 'parameter-efficient fine-tuning (LoRA/QLoRA)' },
  { pattern: /\bgrafana\b/i, concept: 'observability and dashboards' },
  { pattern: /\bdatadog\b/i, concept: 'observability and dashboards' },
  { pattern: /\blangchain\b/i, concept: 'orchestration and tool calling' },
  { pattern: /\blangsmith\b/i, concept: 'tracing and evaluation harnesses' },
  { pattern: /\bllamaindex\b/i, concept: 'retrieval pipelines' },
  { pattern: /\bhugging\s?face\b/i, concept: 'model and dataset registries' },
  { pattern: /\bweights?\s*&\s*biases\b|\bwandb\b/i, concept: 'experiment tracking' },
  { pattern: /\bmlflow\b/i, concept: 'experiment tracking' },
  { pattern: /\bkubeflow\b/i, concept: 'training and serving infrastructure' },
  { pattern: /\bsagemaker\b/i, concept: 'managed training and serving' },
  { pattern: /\bvllm\b/i, concept: 'inference serving and batching' },
  { pattern: /\bpinecone\b|\bweaviate\b|\bchroma\b/i, concept: 'vector search' },
  { pattern: /\bkaggle\b/i, concept: 'dataset sourcing' },
]

/**
 * What the accelerator track needs the technical track to have taught by a
 * given week. The accelerator is the fixed point: its sprint reviews and Demo
 * Day are dates, so the technical content has to arrive before them, not after.
 * Keyed by the week the dependency is DUE.
 */
const ALIGNMENT: { week: number; needs: RegExp; because: string }[] = [
  {
    week: 5,
    needs: /\beval|\bmetric|\bbaseline|\bholdout|\bjudge\b/i,
    because:
      'the accelerator runs a baseline review in week 5, so students need an evaluation and a baseline by then',
  },
  {
    week: 8,
    needs: /\berror analysis|\bmonitor|\bdrift|\bregression|\bobservab/i,
    because:
      'the accelerator measures impact in week 8, which needs error analysis or monitoring to measure against',
  },
  {
    week: 9,
    needs: /\bdeploy|\bserv|\blatency|\bcost\b|\bscale\b/i,
    because:
      'the accelerator covers reliability, scale and cost in week 9, so the system has to be deployed by then',
  },
  {
    week: 10,
    needs: /\bguardrail|\bsafety|\bstress|\bsecurity|\bcomplian/i,
    because:
      'Demo Day is week 10 and the system goes in front of real people, so guardrails cannot land later',
  },
]

/** Weeks with no teaching, exempt from the load and empty checks. */
const BREAK_WEEKS = /break|flexibility/i

function weekText(week: DraftWeek): string {
  return week.sections
    .flatMap((s) => [s.heading, ...s.rows.map((r) => r.text)])
    .join(' \n ')
}

function countBullets(week: DraftWeek): number {
  return week.sections.reduce(
    (n, s) => n + s.rows.filter((r) => r.text.trim()).length,
    0,
  )
}

function isBreak(week: DraftWeek): boolean {
  return week.sections.some((s) => BREAK_WEEKS.test(s.heading))
}

/**
 * A rough test for "the outline already says this", used by the unmerged and
 * coverage checks. Compares on content words, so "Model deployment" matches
 * "Deployment" and "Deploying the model" without a real stemmer.
 */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'for', 'in', 'on', 'vs', 'with',
  'how', 'what', 'is', 'are', 'it', 'its', 'your', 'you', 'we', 'do', 'does',
])

function contentWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w))
    .map((w) => w.replace(/(ing|ment|tion|s)$/, ''))
}

function mentions(haystack: string, needle: string): boolean {
  const words = contentWords(needle)
  if (!words.length) return false
  const hay = contentWords(haystack).join(' ')
  const hits = words.filter((w) => hay.includes(w)).length
  return hits / words.length >= 0.5
}

export function review(draft: DraftWeek[], source: WeekEntry[]): Finding[] {
  const findings: Finding[] = []
  const allText = draft.map(weekText).join(' \n ')

  for (const week of draft) {
    const entry = source.find((e) => e.week === week.week)
    const text = weekText(week)
    const bullets = countBullets(week)
    const teaching = !isBreak(week)

    // c) modern, not tool-focused. A row can name two tools that share one
    // concept (e.g. "Grafana, Datadog" -> observability); report each concept
    // once per row, so the finding ids stay unique and the advice isn't doubled.
    for (const section of week.sections) {
      for (const row of section.rows) {
        const concepts = new Set<string>()
        for (const tool of TOOL_NAMES) {
          if (tool.pattern.test(row.text)) concepts.add(tool.concept)
        }
        for (const concept of concepts) {
          findings.push({
            id: `tool-${week.week}-${row.id}-${concept}`,
            week: week.week,
            severity: 'warn',
            kind: 'tool',
            message: `Week ${week.week} names a specific tool: "${row.text.trim()}"`,
            hint: `Teach ${concept} as the heading and let the tool be the example, so the week survives the tool being replaced.`,
          })
        }
      }
    }

    if (teaching) {
      // d) fits the timeline
      if (bullets === 0) {
        findings.push({
          id: `empty-${week.week}`,
          week: week.week,
          severity: 'warn',
          kind: 'empty',
          message: `Week ${week.week} has no outline content.`,
          hint: 'Pull something across from the Engineering column, or move a section here from a fuller week.',
        })
      } else if (bullets > 12) {
        findings.push({
          id: `load-over-${week.week}`,
          week: week.week,
          severity: 'warn',
          kind: 'load',
          message: `Week ${week.week} carries ${bullets} bullets, which is more than a week can hold.`,
          hint: 'Split it across two weeks, or demote the detail into sub-bullets you will not lecture from.',
        })
      } else if (bullets < 3) {
        findings.push({
          id: `load-under-${week.week}`,
          week: week.week,
          severity: 'info',
          kind: 'load',
          message: `Week ${week.week} carries only ${bullets} bullet${bullets === 1 ? '' : 's'}.`,
          hint: 'Thin for a full week. Either it absorbs a neighbouring topic, or it is really half a week.',
        })
      }

      // Engineering content still sitting unmerged. Once `technical` is pruned
      // from the data there is nothing left to merge, so this never fires.
      if (entry?.technical?.topic && !mentions(text, entry.technical.topic)) {
        findings.push({
          id: `unmerged-${week.week}`,
          week: week.week,
          severity: 'info',
          kind: 'unmerged',
          message: `Week ${week.week}'s Engineering topic "${entry.technical.topic}" is not in the outline yet.`,
          hint: 'Merge it or decide against it. Once every week is merged, the Engineering column can go.',
        })
      }
    }

    // b) aligns with the accelerator: is the dependency taught by its due week?
    for (const rule of ALIGNMENT) {
      if (rule.week !== week.week) continue
      const taughtByNow = draft
        .filter((w) => w.week <= rule.week)
        .map(weekText)
        .join(' \n ')
      if (rule.needs.test(taughtByNow)) continue
      findings.push({
        id: `alignment-${rule.week}`,
        week: rule.week,
        severity: 'warn',
        kind: 'alignment',
        message: `Nothing by week ${rule.week} covers what the accelerator needs there.`,
        hint: `${entry ? `Accelerator week ${rule.week} is "${entry.accelerator.topic}": ` : ''}${rule.because}.`,
      })
    }
  }

  // a) is the content right: anything the research flagged that is nowhere yet.
  for (const topic of SUGGESTED_TOPICS) {
    if (mentions(allText, topic.title)) continue
    if (topic.aliases?.some((alias) => mentions(allText, alias))) continue
    findings.push({
      id: `coverage-${topic.id}`,
      week: topic.suggestedWeek,
      severity: topic.priority === 'high' ? 'warn' : 'info',
      kind: 'coverage',
      message: `Not covered anywhere: ${topic.title}.`,
      hint: `${topic.why} Suggested home: week ${topic.suggestedWeek}.`,
    })
  }

  // A heading repeated across weeks is usually a topic that was never split.
  const headings = new Map<string, number[]>()
  for (const week of draft) {
    for (const section of week.sections) {
      const key = section.heading.trim().toLowerCase()
      if (!key) continue
      headings.set(key, [...(headings.get(key) ?? []), week.week])
    }
  }
  for (const [heading, weeks] of headings) {
    if (weeks.length < 2) continue
    findings.push({
      id: `duplicate-${heading}`,
      week: weeks[0] ?? null,
      severity: 'info',
      kind: 'duplicate',
      message: `"${heading}" is the heading for weeks ${weeks.join(' and ')}.`,
      hint: 'Two weeks under one heading reads as one topic stretched. Give each week the name of what it actually teaches.',
    })
  }

  return findings
}
