# Path to MVP — Scaling Coaching Effectiveness in Contact Centers

**Author:** Jason Corning
**Draft:** April 15, 2026
**Status:** PRD Review v2

---

## Problem Statement

Contact center supervisors coach 10–15 agents today. The business needs that ratio at 1:50, with every agent performing at or above an absolute quality threshold. An existing QA platform scores every call. The gap is the layer between that scoring signal and effective supervisor action: diagnosing what kind of problem each sub-threshold agent has, routing it to the right intervention, and delivering coaching — only where coaching is the right answer — with specificity grounded in the agent's actual calls.

## Context

The 1:50 target cannot be reached by coaching faster or longer. Coaching effectiveness correlates with contextual specificity, not frequency or duration. A meaningful share of sub-threshold performance has non-coaching root causes — tooling, logistics, personal, policy — where coaching is the wrong intervention entirely. Supervisors today treat every gap as a coaching problem because they have no mechanism to efficiently diagnose otherwise. The MVP collapses this gap with an agentic diagnosis-and-routing layer; coaching is one of several outputs.

"Top performance quartile" is retired as a goal because it is a moving benchmark. The MVP uses a Composite Performance Score (CPS) — a weighted blend of CSAT, FCR, escalation, AHT, compliance, and call quality — against an absolute threshold. The goal is every agent at or above threshold.

## Assumptions

1. Coaching improves performance when it is contextually specific to the individual agent. Length and frequency alone do not.
2. CPS is a valid operational proxy for the outcomes the contact center cares about.
3. A meaningful share of sub-threshold agents (hypothesis: 30–40%) have non-coaching root causes; to validate in discovery.
4. Supervisors accept agentic delegation of diagnosis and plan authoring; they retain judgment on exceptions and personal issues.
5. Agents engage with AI-delivered coaching when it is grounded in their actual calls and framed developmentally.
6. Agentic delegation is legally acceptable in target geographies.

## Personas

**Primary — Maya, Contact Center Supervisor.** Manages 15 agents today, targeted to manage 50. Owns team CPS against threshold. Her workflow change is the business case and the measurable ROI for the buyer.

Secondary — Devin, Tier-1 Agent. Tenure 14 months, mid-CPS. Outcomes happen through him; his trust determines adoption.

Tertiary — Priya, Ops Director. Economic buyer; needs a defensible ROI story for the 1:50 investment.

The MVP is designed around Maya. Devin and Priya are addressed through downstream surfaces in v2.

## Pain Points (Maya)

Five observed, prioritized for MVP:

**PP1 (top priority) — No efficient mechanism to diagnose issue type.** Maya treats every sub-threshold agent as a coaching problem because she has no way to rapidly distinguish a knowledge gap from a broken CRM from a personal crisis. Her highest-value hours are spent coaching agents whose real problem coaching cannot fix.

**PP2 — Administrative burden crowds out actual coaching.** Scorecard review, call sampling, and report generation consume the hours that should be spent on the coaching conversation itself.

**PP3 — Cannot generate contextually specific coaching at scale.** When coaching *is* the right answer, generic tips do not move behavior. Maya can produce grounded, call-specific coaching for 15 agents; she cannot for 50.

PP4 — Reactive rather than proactive. Trajectory breaks and early-warning signals are visible in the data but not surfaced until performance has already slipped.

PP5 — No visibility into which of her coaching actions actually worked. Effectiveness feedback arrives weeks late, confounded by external factors.

PP4 and PP5 are deferred from MVP and become the basis for v2 (trajectory monitoring and effectiveness loop).

## MVP Solution

Three capabilities, each mapped to a prioritized pain point, designed to work as one end-to-end flow.

**Solution for PP1 — Issue-Type Router (MVP core).**
An agent scans CPS trajectory, call transcripts, score patterns, and metadata for every sub-threshold agent. It classifies each by issue type — onboarding, knowledge, policy, logistics, personal, or motivational — and routes to the appropriate action path. High-confidence knowledge and onboarding cases route to automated coaching plan generation. Personal, policy, and low-confidence cases route to Maya for direct handling. Logistics cases route to ops escalation. Maya reviews, confirms, or overrides.

**Solution for PP2 — Supervisor Attention Allocator.**
A ranked daily queue showing which agents need Maya's time this week, with the diagnostic reason attached: trajectory break, recurring policy flag, gaming signal, personal context. Agents served by the automated path are visible but de-prioritized from her direct queue. This is the workflow engine that makes 1:50 operationally possible.

**Solution for PP3 — Contextual Coaching Plan Generator.**
For agents routed to coaching, the system produces a plan grounded in specific call moments — named calls, named behaviors, observable next-call actions. No generic tips. The plan is delivered conversationally to the agent and practiced between Maya's touchpoints.

## Maya's Workflow — Before and After

**Today (1:15).** Maya starts her day in the scorecard tool. She samples calls, reviews scores across 15 agents, and builds a mental ranking of who needs attention. Coaching conversations happen when time allows after admin — often reactive, often generic, often delayed days after the triggering call. Every sub-threshold agent receives the same treatment because diagnosis is expensive. Personal and logistics issues surface through intuition or complaint, not through the data.

**With MVP (1:50).** Maya opens a single dashboard. CPS status for all 50 agents is visible against the absolute threshold. The attention allocator shows her ranked queue for the day: six agents flagged for direct human time, with the diagnostic reason on each. The remaining sub-threshold agents have been routed — most to automated contextual coaching, some to ops escalation — and Maya reviews the routing decisions in minutes rather than hours. She spends the bulk of her day on the six conversations only she can have: the new hire struggling emotionally, the policy escalation, the agent showing a gaming pattern. Routine knowledge coaching happens in the background, grounded in specific calls, with agents engaging between her touchpoints.

The ratio scales because Maya stops doing the work that does not require her, and the work that does require her becomes visible.

## Success Metrics

**Leading (30–60 days)**
- Issue-type classification agreement rate between router and supervisor
- Supervisor time reallocation from admin to direct human coaching
- Coaching plan specificity rate (percent grounded in named calls and observable behaviors)
- Agent engagement rate with AI-delivered coaching

**Lagging (90+ days)**
- Headline: percent of a supervisor's agents at or above CPS threshold
- Sustainable supervisor:agent ratio holding CPS threshold
- Time-to-threshold for new hires and for returning sub-threshold agents
- Cost per threshold-performing agent

**Counter-metrics (Goodhart guards)**
- External CSAT tracks CPS movement
- Escalation and rework do not rise as CPS rises
- Blind QA audit alignment with automated scoring
- Agent trust NPS — surveillance backlash canary

---
