# Coaching Command Center

An agentic diagnosis-and-routing layer that sits between call-quality scoring and supervisor action in contact centers. Built with Claude Sonnet 4.6 via the Anthropic API.

## The problem

Contact center supervisors today coach 10–15 agents. The business case for AI in contact centers depends on getting that ratio to 1:50 while every agent performs at or above an absolute quality threshold. You cannot coach 50 agents the way you coach 15 by going faster. The math does not work, and coaching effectiveness correlates with contextual specificity, not frequency.

The deeper issue: a meaningful share of sub-threshold performance is not a coaching problem at all. Some agents are new and still learning the systems. Some have a real knowledge gap on a specific topic. Some are dealing with a personal crisis. Some are blocked by a broken tool. Some are gaming the scorecard. Each requires a different response. Coaching the agent dealing with a personal crisis is not just ineffective — it can make things worse.

Supervisors treat every gap as a coaching problem today because diagnosing the actual root cause for 50 agents is too expensive. This system collapses that gap.

## What it does

Three tabs, one workflow.

**Today.** Maya (the supervisor persona) opens the dashboard. She sees how many of her 50 agents are above the CPS threshold today, who needs her direct attention, and who is being handled automatically. Her queue is already prioritized before she opens a single file.

**Router.** For any sub-threshold agent, Maya can run a live diagnosis. The system reads the agent's recent call transcripts, performance trajectory, and metric patterns, then classifies the root cause into one of six types: onboarding, knowledge, policy, logistics, personal, or motivational. Confidence is scored. Evidence cites specific call IDs. Routing is determined by the diagnosis: knowledge gaps with high confidence go to automated coaching; personal issues and policy violations route to Maya; tooling problems escalate to ops. Maya can accept or override every decision, with the override rate becoming a built-in supervisor-vs-system agreement signal.

**Coaching Plans.** For agents routed to automated coaching, the system generates a plan grounded in their actual call moments. The system prompt forbids generic advice. Every focus area must cite at least one specific call ID and describe an observable behavior from that call. The plan is written in second person, with practice drills the agent can run between calls. A preview shows what the agent will receive.

## Design decisions

These are the parts that make this more than a generic LLM wrapper.

**Diagnose before coaching.** Existing coaching tools treat sub-threshold performance as a coaching problem by default. This system refuses to coach until it has classified the root cause and confirmed coaching is actually the right intervention. About half the agents in the seed data have non-coaching root causes — they need tooling fixes, supervisor conversations, or HR support, not coaching.

**Grounded specificity as the prompt-level anti-hallucination defense.** The coaching plan generator's system prompt includes: *"Every focus area must cite at least one specific call_id from the agent's recent calls and describe a specific observable behavior from that call. You are forbidden from writing generic coaching advice such as 'improve your empathy,' 'listen more carefully,' or 'handle objections better.' If you cannot ground a coaching action in a specific call moment from the data provided, do not include it."* Generic tips do not move behavior, and an LLM left to its own devices will produce generic tips by default. The prompt pattern is what makes coaching at 1:50 actually work.

**Confidence-thresholded routing with a forced human path.** The diagnosis returns a confidence score. The routing rules apply hard thresholds: knowledge or onboarding at ≥0.65 confidence routes to automated coaching; any classification below 0.55 confidence routes to the supervisor regardless of type. Personal, policy, and motivational always route to the supervisor. Logistics always escalates to ops. The system is not allowed to send a low-confidence classification straight to automated coaching, and the supervisor cannot be removed from cases where judgment is the point.

**Agreement rate as built-in eval.** Every override is logged. The system reports the supervisor-vs-system agreement rate continuously. This is the metric you need to deploy this kind of system responsibly — without it, you have no signal on whether the diagnosis is actually trustworthy or just confident-sounding.

**Goodhart signal detection.** One of the six issue types is "motivational" — high call quality score but low CSAT. The seed data includes two agents with this pattern. The framing in the system prompt: *"call quality score high but CSAT low, suggesting the agent is optimizing for scored behaviors at the expense of actual customer outcomes."* A coaching plan would make this agent better at gaming the score. A supervisor conversation might actually help. The taxonomy itself is doing work.

**Single-file frontend, intentional.** The prototype is one ~100KB React file. Splitting it into 30 files would have made it look more "production" without adding clarity. The design lives in the system prompts and the agent data shape, not the React component structure.

## Running it

```bash
npm install
npm run dev
```

On first load the app prompts for an Anthropic API key. The key is held in memory only and cleared on page reload. No backend, no persistence, no auth.

## Tech stack

- React + Vite + Tailwind
- Anthropic API (`claude-sonnet-4-6`) called directly from the browser via `anthropic-dangerous-direct-browser-access`
- Recharts for sparklines
- 50 fabricated agents across 7 latent-issue cohorts

## What this is not

- Not production. No auth, no rate limiting, no persistence, no integrations.
- Not proof the framework works in practice. The agents and call transcripts are entirely synthetic. The framework is original; whether the diagnoses generalize to real call data is an empirical question this artifact does not answer.
- Not tied to any specific QA scoring platform. The "Call Quality" metric is treated as an arbitrary upstream signal — the diagnosis layer is agnostic to where the score comes from.

## Repo layout

```
.
├── prototype.jsx          # The React app
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── docs/
    └── prd.md             # Product requirements document
```

## License

MIT.
