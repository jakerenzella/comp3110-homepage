/**
 * Topics a 2026 MLE course should plausibly cover that neither draft column
 * currently does, from a July 2026 review of what the field teaches and what
 * production teams actually do. The builder shows these as a third source to
 * pull from, and lints the draft against them ("not covered anywhere").
 *
 * This is a checklist to argue with, not a spec. Each entry carries the reason
 * it is here and where the reasoning came from, so a decision to skip one can
 * be made on the merits and stay made.
 *
 * `aliases` exist because the coverage check matches on words: an entry only
 * counts as covered if the outline says something close to its title, so an
 * alias catches the other names the same idea goes by.
 */

export type SuggestedTopic = {
  id: string
  title: string
  /** Why it earns a place in 2026, in one or two sentences. */
  why: string
  /** Other names for the same idea, for the coverage check. */
  aliases?: string[]
  /** Where it would sit if adopted. */
  suggestedWeek: number
  priority: 'high' | 'medium'
  /** Ready-made bullets, so adopting it is one click rather than a blank page. */
  bullets: string[]
  source: { label: string; href: string }
}

export const SUGGESTED_TOPICS: SuggestedTopic[] = [
  {
    id: 'agents',
    title: 'Agents and tool use',
    why: 'Neither column contains the word "agent", and this is the biggest gap. Around 57% of organisations run agents in production, and it is what every team here will actually ship.',
    aliases: ['tool calling', 'agentic systems', 'planning and memory'],
    suggestedWeek: 4,
    priority: 'high',
    bullets: [
      'The tool-call loop: model, tool, result, repeat',
      'Designing a tool catalogue (minimal, non-overlapping, error-tolerant)',
      'Planning vs reflection, and where memory lives',
      'Agent failure modes: find the last good state and the first bad one',
      'Stable tool interfaces (MCP as the idea, not the tutorial)',
    ],
    source: {
      label: 'LangChain, State of Agent Engineering',
      href: 'https://www.langchain.com/state-of-agent-engineering',
    },
  },
  {
    id: 'error-analysis',
    title: 'Error analysis as the primary method',
    why: 'Error analysis is currently in week 8, framed as post-deployment ops. That is backwards: looking at real failures is what tells you which evals to write. Teaching evals first is the "eval-driven development" anti-pattern.',
    aliases: ['open coding', 'axial coding', 'failure modes', 'looking at traces'],
    suggestedWeek: 5,
    priority: 'high',
    bullets: [
      'Read your traces: open coding, one annotation per failure',
      'Cluster annotations into failure modes (axial coding)',
      'Let the failure modes decide which evals are worth writing',
      'The anti-pattern: writing evals for failures you have never seen',
    ],
    source: {
      label: 'Hamel Husain and Shreya Shankar, LLM Evals FAQ',
      href: 'https://hamel.dev/blog/posts/evals-faq/',
    },
  },
  {
    id: 'context-engineering',
    title: 'Context engineering',
    why: 'The concept that replaced prompt engineering, and where RAG now lives: retrieval as one way of assembling the right tokens for a call, rather than a pattern of its own.',
    aliases: ['context window', 'retrieval', 'RAG', 'compaction'],
    suggestedWeek: 2,
    priority: 'high',
    bullets: [
      'Curating the smallest token set that does the job',
      'Context rot: degradation is a gradient, not a cliff',
      'Compaction, and carrying identifiers to load just in time',
      'Isolating context across sub-agents',
    ],
    source: {
      label: 'Anthropic, Effective Context Engineering for AI Agents',
      href: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
    },
  },
  {
    id: 'prompt-injection',
    title: 'Prompt injection and agentic security',
    why: 'Number one on the OWASP LLM Top 10, now covering indirect injection. Once the course teaches agents, this is the attack surface rather than an optional extra.',
    aliases: ['injection', 'system prompt leakage', 'least privilege'],
    suggestedWeek: 10,
    priority: 'high',
    bullets: [
      'Direct and indirect injection: untrusted input is anything the model reads',
      'Isolate untrusted input; least privilege for tools',
      'Deterministic egress blocks, and human approval for costly actions',
      'System-prompt leakage: assume it is public',
    ],
    source: {
      label: 'OWASP Top 10 for LLM Applications (2025)',
      href: 'https://genai.owasp.org/llm-top-10/',
    },
  },
  {
    id: 'judge-alignment',
    title: 'Aligning an LLM judge',
    why: 'Week 5 already names LLM-as-judge failure modes, which is the right topic half-covered. The missing half is measuring the judge against human labels: position bias runs up to 70%, verbosity bias above 90%, and judge-human correlation is 0.3 to 0.6 against 0.8 to 0.9 human-human.',
    aliases: ['llm as judge', 'judge', 'evaluator alignment'],
    suggestedWeek: 5,
    priority: 'high',
    bullets: [
      'Score the judge against human labels on a held-out set (TPR/TNR)',
      'Binary pass/fail beats a Likert scale',
      'Direct scoring for objective criteria, pairwise for subjective',
      'Position, verbosity and self-enhancement bias',
    ],
    source: {
      label: 'Eugene Yan, LLM-Evaluators',
      href: 'https://eugeneyan.com/writing/llm-evaluators/',
    },
  },
  {
    id: 'feedback-design',
    title: 'Feedback design and human-in-the-loop',
    why: 'The course has no product surface at all, which is odd for a strand attached to an accelerator with real users and a Demo Day. The classic failure is that users correct the system and nothing captures it.',
    aliases: ['user feedback', 'human in the loop', 'escalation'],
    suggestedWeek: 9,
    priority: 'medium',
    bullets: [
      'Designing for model error: a backup path, not an error message',
      'Confidence thresholds and when to escalate to a human',
      'Instrumenting corrections so they become training signal',
      'What conversational feedback can and cannot tell you',
    ],
    source: {
      label: 'Chip Huyen, AI Engineering (ch. 10)',
      href: 'https://github.com/chiphuyen/aie-book/blob/main/ToC.md',
    },
  },
  {
    id: 'model-selection',
    title: 'Model selection, routing and gateways',
    why: '"Which model, at what cost, for which request" is a daily MLE decision and appears nowhere. Over three quarters of teams route across more than one model. Reading a leaderboard sceptically is a durable skill.',
    aliases: ['build vs buy', 'model router', 'benchmarks', 'leaderboard'],
    suggestedWeek: 1,
    priority: 'medium',
    bullets: [
      'Reading public benchmarks without believing them',
      'Build vs buy, and what an API actually costs you',
      'Routing: small model by default, big model on escalation',
      'The gateway as the place to put caching, limits and logging',
    ],
    source: {
      label: 'Chip Huyen, AI Engineering (ch. 4, 10)',
      href: 'https://github.com/chiphuyen/aie-book/blob/main/ToC.md',
    },
  },
  {
    id: 'cost-engineering',
    title: 'Cost engineering',
    why: 'Currently a sub-bullet of deployment. For a team with a term budget it is a design constraint from week 1, and prompt caching alone cuts API cost by roughly half.',
    aliases: ['token budget', 'prompt caching', 'batching', 'quantization'],
    suggestedWeek: 9,
    priority: 'medium',
    bullets: [
      'Measure first: cost per request, per user, per day',
      'Reduce tokens, then cache, then batch, then quantise',
      'Prompt caching, and designing prompts that are cacheable',
      'Cost as a design constraint, not an afterthought',
    ],
    source: {
      label: 'Anthropic, prompt caching',
      href: 'https://docs.claude.com/en/docs/build-with-claude/prompt-caching',
    },
  },
  {
    id: 'observability',
    title: 'Tracing and observability',
    why: 'Week 8 uses classic-ML monitoring vocabulary (drift, regression suites). Tracing a multi-step agent span is a different idea, and the one students will need: 62% of teams trace individual steps and tool calls.',
    aliases: ['tracing', 'spans', 'logging'],
    suggestedWeek: 8,
    priority: 'medium',
    bullets: [
      'A trace, a span, and why an agent needs both',
      'Logging the inputs and outputs you will want at 2am',
      'Drift is the classic-ML question; "which step went wrong" is this one',
    ],
    source: {
      label: 'LangChain, State of Agent Engineering',
      href: 'https://www.langchain.com/state-of-agent-engineering',
    },
  },
  {
    id: 'synthetic-data',
    title: 'Synthetic data and distillation',
    why: 'Both columns treat data as something you source and clean. In 2026 you mostly generate it, especially eval data.',
    aliases: ['data synthesis', 'distillation', 'generating eval data'],
    suggestedWeek: 3,
    priority: 'medium',
    bullets: [
      'Define the dimensions, hand-write a few tuples, then generate combinations',
      'Synthetic eval sets, and how they go stale',
      'Distilling a big model into one you can afford to run',
    ],
    source: {
      label: 'Hamel Husain, Your AI Product Needs Evals',
      href: 'https://hamel.dev/blog/posts/evals/',
    },
  },
]

/**
 * Re-weightings rather than gaps: content that exists but sits at the wrong
 * size or in the wrong order. Kept separate from SUGGESTED_TOPICS because the
 * coverage lint would only ever report these as already-covered, which is the
 * point — the problem is how much room they take, not whether they are there.
 */
export type Reframe = {
  id: string
  title: string
  note: string
  week: number
}

export const REFRAMES: Reframe[] = [
  {
    id: 'tuning-ladder',
    title: 'Demote tuning to the last rung of a ladder',
    note: 'Weeks 2, 3 and 7 orbit adapting weights, but no team here will fine-tune. Teach the escalation ladder instead: prompt, then context and retrieval, then tools and agents, then finetune last. Keep DPO/KTO as a named concept, not a week.',
    week: 2,
    },
  {
    id: 'data-weeks',
    title: 'Two data weeks is one too many',
    note: 'Weeks 3 and 7 are both tuning data. Merge into one week repointed at eval data, synthetic data, and curation driven by error analysis.',
    week: 3,
  },
  {
    id: 'keep-law-of-instrument',
    title: 'Keep "do we really need ML?"',
    note: 'The one thing the MLE outline has that the Engineering column badly lacks. A course that never asks whether the answer is a regex teaches students to reach for the model every time.',
    week: 1,
  },
  {
    id: 'tools-in-labs',
    title: 'Tools belong in the labs, not the outline',
    note: 'Unsloth, Grafana and Datadog will be stale before the course runs twice. Keep the outline at concept altitude and let the lab sheets name versions.',
    week: 8,
  },
]
