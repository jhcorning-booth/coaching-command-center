# Prototype Build Spec — Maya's Coaching Command Center

**For:** Claude Code
**Target:** Working, demo-able prototype in a single React artifact
**Audience for demo:** Observe.AI PM, Designer, Engineers
**Demo length:** 10 minutes, end-to-end flow

---

## 1. What we are building

A single-page React application that demonstrates how Maya — a contact center supervisor managing 50 agents — uses an agentic system to hit her CPS threshold target. The prototype must show the end-to-end flow across all three solutions:

1. **Issue-Type Router** (addresses PP1: diagnose issue type)
2. **Supervisor Attention Allocator** (addresses PP2: admin burden)
3. **Contextual Coaching Plan Generator** (addresses PP3: specificity at scale)

This is a **functional prototype**, not a mock. It uses real LLM calls via the Anthropic API for the agentic behaviors (diagnosis, plan generation). All agent data is seeded (no backend). State lives in React.

**Explicit non-goals:** real auth, real persistence, real integrations, mobile responsiveness, production error handling, agent-facing surface (Devin's view is shown as a preview inside Maya's screen, not a separate app).

---

## 2. Tech stack

- Single React artifact (.jsx), default export, no required props
- Tailwind core utilities only
- `lucide-react` for icons
- `recharts` for CPS visualizations
- Anthropic API via `fetch` to `https://api.anthropic.com/v1/messages`, model `claude-sonnet-4-20250514`, no API key passed
- All state in React hooks; no `localStorage`, no `sessionStorage`
- Seed data as a constant at the top of the file

---

## 3. Seed data spec

Create **50 agents** in a constant array. Each agent object:

```
{
  id: "A001" ... "A050",
  name: [realistic first + last],
  tenure_months: 1–48,
  cps: 0–100,                      // Composite Performance Score
  cps_threshold: 75,               // absolute, same for all
  cps_trend_7d: [7 daily CPS values],
  metrics: {
    csat: 0–100,
    fcr: 0–100,                    // first call resolution %
    aht_seconds: 180–600,
    escalation_rate: 0–20,         // %
    compliance_score: 0–100,
    call_quality: 0–100            // Observe.AI score proxy
  },
  recent_calls: [3–5 call objects],
  latent_issue_type: one of ["onboarding","knowledge","policy","logistics","personal","none"],
  latent_issue_evidence: [2–4 short strings describing why]
}
```

Each `recent_call` object:
```
{
  call_id: "C...",
  date: ISO date within last 7 days,
  duration_seconds,
  intent: e.g. "billing dispute", "plan change", "cancellation",
  outcome: "resolved" | "escalated" | "callback" | "abandoned",
  transcript_excerpt: 2–4 sentences of plausible agent+customer dialogue,
  flags: array of short strings e.g. ["long hold time","policy misstatement","empathy miss"]
}
```

**Distribution requirements** so the demo tells a story:
- ~30 agents above threshold (CPS ≥ 75)
- ~20 agents below threshold, split roughly:
  - 6 knowledge-gap (repeated same-topic errors in transcripts)
  - 3 onboarding (tenure < 3 months, wide metric variance)
  - 3 logistics (transcripts mention system/tool problems, high AHT)
  - 3 personal (sudden trajectory break in cps_trend_7d, tone shift)
  - 3 policy (compliance flags on multiple calls)
  - 2 motivational / gaming (call_quality high but CSAT low — Goodhart signal)

The `latent_issue_type` field is the **ground truth** the router will try to match. It is not shown in the UI; it is used to display router agreement rate.

---

## 4. Application layout

Single page, three primary sections stacked vertically with in-page navigation (sticky top nav with three tabs: **Today**, **Router**, **Coaching Plans**). No routing library — use state to switch views.

Persistent left rail across all tabs: Maya's identity card, team CPS summary (percent above threshold, large number), and a "Start Demo Tour" button that walks through the three sections in sequence.

---

## 5. Tab 1 — Today (Supervisor Attention Allocator)

This is Maya's landing view. Solves **PP2**.

**Layout:**
- Top strip: four KPI cards
  - Agents above CPS threshold (e.g. "32 / 50")
  - Agents needing your direct time today (e.g. "6")
  - Agents on automated coaching track (e.g. "12")
  - Hours saved this week vs. manual workflow (computed stub: `agents_auto_routed * 0.75`)
- Main area, left 60%: **Your Queue Today** — a ranked list of 5–8 agents the system has flagged for Maya's direct attention. Each row shows:
  - Agent name, tenure, current CPS with delta vs. 7-day avg
  - **Reason chip** — one of: "Trajectory break", "Policy escalation", "Gaming signal", "Personal context flag", "Low-confidence routing — needs your call"
  - One-line context (e.g. "CPS dropped 12 points in 3 days — no prior pattern")
  - Action button: "Open"
- Main area, right 40%: **Auto-Routed** — a collapsed summary list of agents handled by the automated path, grouped by issue type with counts. Clicking expands to show names. This makes visible *what Maya is no longer doing manually* — key to the demo narrative.

**Ranking logic for Your Queue:** deterministic scoring based on seeded data — personal/policy issues rank highest, then trajectory breaks, then gaming signals, then low-confidence router cases. Implement as a pure function.

**Interaction:** clicking "Open" on a queue row deep-links to that agent in the Router tab with their diagnostic pre-loaded.

---

## 6. Tab 2 — Router (Issue-Type Router)

The agentic core. Solves **PP1**.

**Layout:**
- Top: filter bar — "Show: [All sub-threshold] [Unrouted] [Low confidence]"
- Main area, left 40%: list of sub-threshold agents (the ~20 below CPS 75). Each row shows name, CPS, and a routing status pill: "Routed", "Needs review", or "Not yet diagnosed".
- Main area, right 60%: **Diagnostic Panel** for the selected agent.

**Diagnostic Panel contents (for selected agent):**
- Agent header: name, tenure, CPS vs threshold, small sparkline of `cps_trend_7d` using recharts
- Metric breakdown: small grid of the 6 CPS component metrics with color-coded deltas vs. threshold
- Recent calls strip: 3 call cards showing intent, outcome, flags, and a "view transcript" expand
- **"Run Diagnosis" button** — this is the agentic action

**Run Diagnosis behavior:**
1. Show loading state with rotating messages: "Reading recent calls", "Scanning trajectory", "Classifying issue type"
2. Call the Anthropic API. Build the prompt by passing the agent's full object (metrics, trend, recent calls with transcript excerpts and flags) and ask Claude to return **JSON only** with this schema:
   ```
   {
     "issue_type": "onboarding" | "knowledge" | "policy" | "logistics" | "personal" | "motivational" | "none",
     "confidence": 0.0-1.0,
     "evidence": [string, string, string],
     "recommended_route": "automated_coaching" | "supervisor_direct" | "ops_escalation",
     "reasoning": "2-3 sentence explanation"
   }
   ```
   System prompt must instruct Claude to respond with raw JSON, no markdown fences, no preamble. Parse defensively — strip code fences if present, wrap in try/catch.

3. Render the result in the panel:
   - Issue type as a prominent badge
   - Confidence as a horizontal bar
   - Evidence as a bulleted list, each item referencing specific call IDs where possible
   - Recommended route with an explanatory sentence
   - Two buttons: **"Accept and Route"** and **"Override"**

4. **Accept and Route** updates the agent's routing status in state. If route is `automated_coaching`, reveal a "Generate Coaching Plan" CTA that jumps to Tab 3. If `supervisor_direct`, add to Maya's Today queue. If `ops_escalation`, show a stubbed "Ticket created for Ops" confirmation.

5. **Override** opens a small form letting Maya pick a different issue_type and route, with a required note field. Store the override.

**Router agreement metric:** small indicator at the top of the tab — "Router agreement with supervisor: X%" — computed as `1 - (overrides / total_routed)`. This directly maps to our leading success metric.

---

## 7. Tab 3 — Coaching Plans (Contextual Coaching Plan Generator)

Solves **PP3**. Only applies to agents routed to `automated_coaching`.

**Layout:**
- Left 30%: list of agents with an active or pending coaching plan
- Right 70%: plan detail view

**Plan Detail view:**
- Agent header (same as Router tab)
- **"Generate Plan" button** if no plan exists yet

**Generate Plan behavior:**
1. Loading state: "Grounding in specific calls", "Drafting behavioral targets", "Writing practice drills"
2. Call Anthropic API. Prompt must include: agent's issue_type and evidence from the router step, full recent_calls array with transcript excerpts, and explicit instruction that **every coaching action must cite a specific call_id and a specific observable behavior**. Generic tips are forbidden. Return JSON:
   ```
   {
     "plan_title": string,
     "diagnosis_summary": "1-2 sentences",
     "focus_areas": [
       {
         "area": string,
         "grounded_in_calls": [call_id, ...],
         "observed_behavior": "what Devin did on those calls",
         "target_behavior": "what to do next time — observable and specific",
         "practice_drill": "a concrete 2-minute drill"
       }
     ],  // 2-4 focus areas
     "next_checkpoint": "what Maya should look for in the next 5 calls"
   }
   ```
3. Render plan:
   - Diagnosis summary at top
   - Each focus area as a card showing: linked call chips (clickable, expand to transcript), observed vs. target behavior side-by-side, practice drill in a highlighted box
   - Next checkpoint as a footer
   - Buttons: **"Approve and Send to Agent"** and **"Edit"**
   - A specificity indicator: "Grounded in N specific calls" — this is the design-visible proof that the plan is not generic

**Approve behavior:** marks plan as sent, shows a "Preview: Devin's view" collapsed panel that displays the plan in agent-facing framing (second person, developmental tone, practice drill front and center). This demonstrates the secondary persona's experience without building a separate app.

---

## 8. Demo tour (wiring it all together)

The "Start Demo Tour" button runs a guided sequence using a simple step counter in state:

1. Land on **Today** → highlight KPI strip, then Your Queue, then Auto-Routed panel. Narration card: "Maya's day starts here. Six agents need her directly; twelve are handled by the automated path."
2. Click into a queued agent → jumps to **Router** with that agent pre-selected. Narration: "Before coaching anyone, the system diagnoses *what kind of problem* this is."
3. Run Diagnosis live → narration: "This is an agentic call — Claude is reading the actual transcripts."
4. Accept and Route → jump to **Coaching Plans**. Narration: "Because this was routed to automated coaching, we now generate a plan grounded in specific calls."
5. Generate Plan live → narration: "Every action cites a specific call. No generic tips. This is what makes coaching work at 1:50."
6. Show Devin preview → narration: "And this is what the agent actually sees."
7. Return to Today with one more agent moved above threshold (simulate by bumping CPS on the completed agent). Narration: "The loop closes. Maya's attention stays on what only she can do."

The tour should use a persistent step indicator and Next/Back buttons.

---

## 9. API call implementation notes for Claude Code

- Both agentic calls (Router diagnosis, Plan generation) use the same `fetch` pattern to `https://api.anthropic.com/v1/messages`
- `max_tokens: 1000`, model `claude-sonnet-4-6` *(corrected from claude-sonnet-4-20250514)*
- API key is entered by the user in a modal on first load. Store in `useState`. Do not use localStorage, sessionStorage, or hardcoded values. The modal renders if `apiKey` state is empty; disappears once a key is entered and does not reappear until page reload.
- System prompt must end with: *"Respond with raw JSON only. No markdown fences, no preamble, no explanation outside the JSON."*
- Parse with: strip ` ```json ` and ` ``` ` fences, `JSON.parse` inside try/catch
- On parse failure, show an inline error and a "Retry" button — do not crash the view
- Both calls should work with a single well-formed prompt; no multi-turn

### 9a. Router Diagnosis — Exact Prompts

**System prompt:**
```
You are a contact center performance analyst. Your job is to diagnose why a specific agent is performing below their CPS threshold by analyzing their recent call data, performance metrics, and 7-day trajectory.

Classify the root cause as exactly one of these issue types:
- "onboarding": agent tenure under 3 months, wide metric variance, still learning fundamentals
- "knowledge": repeated errors on the same topic or product area across multiple calls — the agent consistently mishandles the same type of situation
- "policy": compliance flags, policy misstatements, or regulatory issues appearing in call flags
- "logistics": tool or system friction — high AHT without corresponding quality issues, transfer loops, transcripts mentioning system problems
- "personal": sudden trajectory break with no prior pattern — CPS drops sharply over a short window with no metric-level explanation
- "motivational": Goodhart signal — call quality score high but CSAT low, suggesting the agent is optimizing for scored behaviors at the expense of actual customer outcomes
- "none": agent is performing adequately; no clear root cause for sub-threshold status

Routing rules (apply these exactly):
- "knowledge" or "onboarding" at confidence ≥ 0.65 → "automated_coaching"
- "knowledge" or "onboarding" at confidence < 0.65 → "supervisor_direct"
- "personal" → "supervisor_direct" always
- "policy" → "supervisor_direct" always
- "logistics" → "ops_escalation" always
- "motivational" → "supervisor_direct" always
- Any issue type at confidence < 0.55 → "supervisor_direct" regardless

Each evidence item must reference a specific call_id from the agent's data. Do not produce generic observations that could apply to any agent.

Respond with raw JSON only. No markdown fences, no preamble, no explanation outside the JSON.
```

**User prompt** (constructed dynamically from agent object):
```
Diagnose the following agent's performance issue and return a JSON diagnosis.

Agent: {name} | Tenure: {tenure_months} months | CPS: {cps} / 100 (threshold: {cps_threshold})

7-day CPS trend (oldest to newest): {cps_trend_7d.join(', ')}

Performance metrics vs. threshold:
- CSAT: {metrics.csat}
- First Call Resolution: {metrics.fcr}%
- Average Handle Time: {metrics.aht_seconds}s
- Escalation Rate: {metrics.escalation_rate}%
- Compliance Score: {metrics.compliance_score}
- Call Quality: {metrics.call_quality}

Recent calls:
{recent_calls.map(c =>
  `[${c.call_id}] ${c.date} | ${c.duration_seconds}s | Intent: ${c.intent} | Outcome: ${c.outcome}
Transcript: ${c.transcript_excerpt}
Flags: ${c.flags.join(', ') || 'none'}`
).join('\n\n')}

Return this JSON schema exactly:
{
  "issue_type": "onboarding" | "knowledge" | "policy" | "logistics" | "personal" | "motivational" | "none",
  "confidence": 0.0–1.0,
  "evidence": ["cite call_id and specific behavior", "cite call_id and specific behavior", "cite call_id and specific behavior"],
  "recommended_route": "automated_coaching" | "supervisor_direct" | "ops_escalation",
  "reasoning": "2–3 sentences explaining your diagnosis and routing decision"
}
```

### 9b. Coaching Plan Generator — Exact Prompts

**System prompt:**
```
You are a contact center coaching specialist. Your job is to write a specific, actionable coaching plan for an agent based on a confirmed diagnosis and their actual call transcripts.

CRITICAL REQUIREMENT — GROUNDED SPECIFICITY: Every focus area must cite at least one specific call_id from the agent's recent calls and describe a specific observable behavior from that call. You are forbidden from writing generic coaching advice such as "improve your empathy," "listen more carefully," or "handle objections better." If you cannot ground a coaching action in a specific call moment from the data provided, do not include it.

Tone: write in second person (you, your) with a developmental, non-punitive framing. The agent should feel supported and capable of improving, not evaluated or judged.

Quantity: include 2–4 focus areas. Fewer, well-grounded areas are more effective than many generic ones. Do not pad.

Respond with raw JSON only. No markdown fences, no preamble, no explanation outside the JSON.
```

**User prompt** (constructed dynamically):
```
Write a contextual coaching plan for the following agent.

Agent: {name} | Tenure: {tenure_months} months | CPS: {cps} / 100 (threshold: {cps_threshold})

Confirmed diagnosis:
- Issue type: {issue_type}
- Evidence from diagnosis:
{evidence.map(e => `  • ${e}`).join('\n')}

Recent calls (the only calls you may reference):
{recent_calls.map(c =>
  `[${c.call_id}] ${c.date} | ${c.duration_seconds}s | Intent: ${c.intent} | Outcome: ${c.outcome}
Transcript: ${c.transcript_excerpt}
Flags: ${c.flags.join(', ') || 'none'}`
).join('\n\n')}

Return this JSON schema exactly:
{
  "plan_title": "short descriptive title specific to this agent's situation",
  "diagnosis_summary": "1–2 sentences describing what the data shows, framed developmentally — what the agent is working through, not what they did wrong",
  "focus_areas": [
    {
      "area": "short label for this skill or behavior area",
      "grounded_in_calls": ["call_id", ...],
      "observed_behavior": "what you specifically did on those calls — describe the observable action, not a judgment",
      "target_behavior": "what to do next time — specific, observable, and something a manager could verify by listening to a call",
      "practice_drill": "a concrete 2-minute drill you can do between calls to build this skill — name the exact exercise"
    }
  ],
  "next_checkpoint": "what your supervisor will listen for in your next 5 calls to measure progress on these areas"
}
```

---

## 10. Visual and interaction standards

- Clean, dense, information-first layout — this is a supervisor tool, not a consumer app
- Neutral palette with one accent color for CPS status (above threshold = green, below = amber, critical = red)
- CPS threshold line visible in every CPS chart
- All agentic outputs must visibly reference the specific data they used — call IDs, metric deltas, transcript excerpts — because *the whole point of the product is grounded specificity*
- Empty states matter: "No agents need your direct attention today" is a feature, not a bug — design it intentionally

---

## 11. Acceptance criteria

The prototype is done when Claude Code can walk through this script without exception:

1. Open the app. See 50 agents, 32 above threshold, 6 in Today's queue.
2. Click the first queued agent. Land in Router with that agent loaded.
3. Click Run Diagnosis. See a live LLM response parsed into the diagnostic panel with issue type, confidence, evidence citing call IDs, and a recommended route.
4. Click Accept and Route. See the agent move to automated coaching and a CTA to generate a plan.
5. Click to Coaching Plans. Click Generate Plan. See a live LLM response with 2–4 focus areas, each citing specific call IDs and observable behaviors, plus a practice drill.
6. Click Approve. See Devin's preview.
7. Return to Today. See the KPI strip reflect the change.
8. Separately: open any other sub-threshold agent in Router and run diagnosis — works independently.
9. Override a routing decision — the router agreement metric updates.

---

## 12. Gap resolutions (pre-build decisions)

The following ambiguities were identified in review and resolved before build:

| Gap | Resolution |
|-----|-----------|
| Model ID was `claude-sonnet-4-20250514` | Corrected to `claude-sonnet-4-6` throughout |
| No API key mechanism specified | API key modal on first load; stored in `useState` for session lifetime only; no localStorage |
| Hours Saved KPI undefined on cold load | Defaults to `0`; updates reactively as agents are routed via Accept and Route |
| Deep-link (Tab 1 → Tab 2) conflict with "Not yet diagnosed" initial state | Deep-link navigates to Router tab and selects the agent; does NOT auto-trigger diagnosis. Maya clicks Run Diagnosis manually. |
| CPS bump at demo tour step 7 underspecified | "Approve and Send to Agent" applies a fixed `+8` CPS delta to that agent in state; cascades to KPI strip and all agent displays |
| Tab 3 initial state undefined | Empty on first load with intentional empty state message; agents appear in Tab 3 left panel only after Accept and Route sets route to `automated_coaching` |

---

## 13. Build order

| Phase | What | Why |
|-------|------|-----|
| 1 | 50-agent seed data + three-tab skeleton + left rail + API key modal | Everything else depends on correct seed distribution and centralized state; API key modal gates all subsequent phases |
| 2 | Tab 1 — Attention Allocator (no API) | Landing view and demo entry point; deterministic ranking, Hours Saved defaulting to 0, deep-link wiring; validates state-sharing approach |
| 3 | Tab 2 — Router UI only (no API) | Build and test all layout, filtering, metrics grid, sparkline, routing pills, Override form before introducing async behavior |
| 4 | Tab 2 — Router API integration | Highest-risk piece; isolate in fully working UI context; Run Diagnosis, loading states, fetch, defensive JSON parse, Accept and Route state updates including Hours Saved increment and Tab 3 population |
| 5 | Tab 3 — Coaching Plans (UI + API) | Depends on routing state from Phase 4; empty state, plan list, Generate Plan fetch, focus area cards, specificity indicator, Approve + CPS bump, Devin preview |
| 6 | Demo tour | Thin layer on top of working features; step counter, narration cards, 7-step sequence tested end to end |
| 7 | Polish + acceptance criteria | Empty states, error states, color coding, threshold lines, full 9-point acceptance checklist |

---

## 14. What this spec deliberately leaves out

- Effectiveness tracking loop (PP4/PP5) — belongs to v2, not MVP
- Real Observe.AI integration — CPS and call data are seeded
- Multi-tenant CPS weighting — assume single-tenant defaults
- Agent login / Devin's full app — preview pane only
- Historical data beyond 7 days

These are explicit in the PRD as deferred. Calling them out here so Claude Code does not over-scope.
