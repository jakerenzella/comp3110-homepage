# Syllabus refit: Labour Day, Monday 5 October 2026

Draft for review. Nothing in `data/syllabus.json` has been changed yet.

## The constraint

- Monday 5 October 2026 is Labour Day in NSW. Week 4 loses the lecture (Mon 11am) and Lab 01 (Mon 2pm). Labs 02 and 03 run on Tuesday as normal.
- Week 6 is the mid-term break and Week 9 is George Ye's guest lecture; neither moves.
- That leaves four lecture slots after Week 3: Weeks 5, 7, 8 and 10. The current outline has five content blocks to fit into them (Agents + MCP, Evals + LLM as a judge, Serving/security/regression, Monitoring, Launch readiness), plus instruction following to add. One block has to be cut or merged.

## What to cut, least important first

1. **Serving (Week 7 heading).** As asked. The serving bullets (API, latency and batching, caching and quantisation) already live in Week 9, and George's session covers the economics. The Week 7 heading loses the word; none of its bullets were serving anyway.
2. **MCP as its own section.** It is "TBC" with no bullets. Fold it into Agents and tool use as a single bullet: "MCP: a standard for the tool catalogue". A line, not a section.
3. **Regressions as its own bullet.** It is the eval-suite-as-regression-test idea and belongs with Evals: "Assertions as a regression suite: run on every prompt or model change". Nothing is lost; the security lecture gets the time back.
4. **Logging and dashboards.** Week 1 already covers "Caching, limits and logging" and the Evals week teaches reading traces. Drop the dashboards bullet; keep traces and spans, drift, and ease of recovery.
5. **Monitoring as its own week: merge it into Launch readiness (Week 10).** Launch readiness is two bullets and its "final guardrails pass" repeats the security week. The merged week, "Launch and operate", reads: stress-test before real users, final guardrails pass, traces and spans, drift, ease of recovery. It fits two hours and is the right last message before Demo Day.

Alternative to (5): keep Monitoring whole in Week 10 and drop Launch readiness entirely (guardrails is redundant with Week 8, stress-testing overlaps Week 9 latency). I prefer the merge because "the pass before it meets real users" is the right note for the week before Demo Day.

## Where instruction following goes: Week 8, in front of security

Prompt injection is instruction following gone wrong: the model follows an instruction from the wrong principal. Teaching the instruction hierarchy first (system, developer, user, then tool output and retrieved content) gives injection and system-prompt leakage one shared explanation instead of two separate tricks. It also links back to the Evals week: instruction following is measured with checkable assertions, which students have just built.

Proposed Week 8 outline:

- **Instruction following**
  - Constraint adherence and structured output (formats, schemas, refusals)
  - The instruction hierarchy: system, developer, user, tool output
  - Measuring it: checkable constraints as assertions (IFEval-style)
  - Why it degrades: long contexts, competing instructions, tool results
- **Security**
  - Prompt injection: direct, and indirect via tool results and retrieved content
  - System-prompt leakage
  - Least privilege for tools

The other candidate slot is Week 10 as part of the guardrails pass. Weaker: it would be taught after the security week it explains.

## Option A: straight shift (what was asked)

| Week | Monday | Lecture | Accelerator |
| --- | --- | --- | --- |
| 4 | 5 Oct | No lecture: Labour Day public holiday | Talking to users (unchanged) |
| 5 | 12 Oct | Agents and tool use (+ MCP bullet) | Baseline review |
| 6 | 19 Oct | Mid-term break | Flexibility week |
| 7 | 26 Oct | Evals; LLM as a judge (+ regression bullet) | Positioning and users |
| 8 | 2 Nov | Instruction following; Security | Measuring impact |
| 9 | 9 Nov | Deployment, serving and cost; guest: George Ye (unchanged) | Design, reliability, scale and cost |
| 10 | 16 Nov | Launch and operate (launch readiness + monitoring) | Polish and Demo Day prep |
| 11 | 23 Nov | Demo Day | Demo Day |

Sprints stay as they are (1: Weeks 3-5, 2: Weeks 7-9, 3: Week 10).

The one thing that grates: Week 5's accelerator is "Baseline review: teams present a baseline metric and the objective it is measured against", and under a straight shift the Evals lecture now lands two weeks after it. Week 1's "design and implement metrics first" is the only lead-in. If you take Option A, consider swapping the Week 4 and Week 5 accelerator sessions so the baseline review sits in Week 7 next to Evals; the Week 4 Tuesday labs can still run "Talking to users".

## Option B: Evals hold Week 5, Agents jump the break (recommended)

| Week | Monday | Lecture | Accelerator |
| --- | --- | --- | --- |
| 4 | 5 Oct | No lecture: Labour Day public holiday | Talking to users (unchanged) |
| 5 | 12 Oct | Evals; LLM as a judge (+ regression bullet) | Baseline review |
| 6 | 19 Oct | Mid-term break | Flexibility week |
| 7 | 26 Oct | Agents and tool use (+ MCP bullet) | Positioning and users |
| 8 | 2 Nov | Instruction following; Security | Measuring impact |
| 9 | 9 Nov | Deployment, serving and cost; guest: George Ye (unchanged) | Design, reliability, scale and cost |
| 10 | 16 Nov | Launch and operate (launch readiness + monitoring) | Polish and Demo Day prep |
| 11 | 23 Nov | Demo Day | Demo Day |

Why I prefer it:

- Sprint 1 is scoping and baseline; the Evals lecture stays in the same week as the baseline review, which is what it was there for.
- Sprint 2 is the build sprint and opens with Agents and tool use. "Least privilege for tools" then lands the week after tools are introduced, and indirect injection via tool results has a concrete referent.
- It is the same set of cuts as Option A; only Weeks 5 and 7 differ.

Cost: it is not literally "everything back a week", and teams will not have seen agents before Sprint 1 ends. Given Sprint 1 is scoping, talking to users and a baseline, I do not think they need to.

## Option C: drop, do not merge

Straight shift as in Option A, but drop Monitoring as a block and add one "traces, spans and drift" bullet to Launch readiness in Week 10. Least preferred: observability is core MLE, and the merged Week 10 in A/B only costs one dashboards bullet.

## Judgement calls

- **Not cut: LLM as a judge.** It is half of how teams will actually run evals; without it the assertions bullet has nowhere to go for subjective criteria.
- **Not cut: Least privilege for tools.** It is the mitigation for the two attacks the week teaches.
- **Kept but worth reframing: Model drift.** Most teams are on hosted APIs, so "upstream model changes and deprecations" is the drift they will actually meet. Suggest that wording for the Week 10 bullet.
- **Not touched: Weeks 1-3.** Week 3 has Kenneth Zhang's guest and Weeks 1-3 have slides in flight, so the shift starts at Week 4.
- **Week 4 row.** Render it like Week 6: a single section headed "No lecture: Labour Day public holiday" with no bullets and `sprint: 1` kept so the stripe still reads as Sprint 1. The accelerator entry stays.
- **Assumption: the accelerator column does not shift.** "Talking to users" is a between-sessions task and the Tuesday labs run, so Week 4 still works for it. If Lab 01 needs a make-up, that is a timetable question, not a syllabus one.
