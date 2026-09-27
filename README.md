# ECHOLESS — Organizational Near-Miss Memory

> **“Don’t learn only from failures. Learn from the warnings you almost ignored.”**
>
> *ECHOLESS is an enterprise AI organizational memory agent that remembers technical warnings, management decisions, actions, and postmortem outcomes — so your next project proposal doesn't repeat the same risk pattern.*

---

## 1. Problem & Motivation

Organizations possess a dangerous cognitive blind spot: **they only document failures after a catastrophic incident occurs, and they completely forget the early warnings that were raised before the incident.**

In typical software engineering teams:
1. A senior engineer or DBA raises a technical warning during design review (*“The shared database pool will saturate if traffic exceeds 400 connections”*).
2. Schedule or budget pressure forces a compromise decision (*“We will launch on time and scale later”*).
3. Production traffic spikes, causing a cascading outage.
4. A postmortem is written and a rule is established.
5. **Twelve months later, a different team proposes a new project with the exact same architecture, and the entire organization makes the exact same mistake.**

Traditional incident management tools (PagerDuty, Jira, Confluence) are passive cemeteries of dead text. Standard LLMs produce generic boilerplate checklists with zero knowledge of your team's institutional history.

---

## 2. Solution: ECHOLESS

**ECHOLESS** acts as an organizational near-miss memory agent powered by **Hindsight long-term memory**.

When an engineer or architect enters a new project proposal, ECHOLESS queries persistent institutional memory and answers the single most important question:

> **“What did we almost miss last time?”**

### The Core Causal Memory Chain

```
CURRENT PROPOSAL
       ↓
HISTORICAL WARNING
       ↓
MANAGEMENT DECISION
       ↓
PRODUCTION ACTION
       ↓
OUTCOME / NEAR-MISS
       ↓
POSTMORTEM LESSON
       ↓
FUTURE RISK ECHO
```

---

## 3. Why Hindsight?

Hindsight (`@vectorize-io/hindsight-client`) provides persistent cognitive memory banks with three core primitives:

| Operation | Organizational Meaning in ECHOLESS |
| :--- | :--- |
| **RETAIN** | **Institutional Ingestion**: Stores historical warnings, design decisions, outage postmortems, and near-miss lessons in the organization's memory bank. |
| **RECALL** | **Temporal Retrieval**: Performs semantic and episodic search over historical experiences relevant to the incoming proposal's architecture, dependencies, and rollout plans. |
| **REFLECT** | **Causal Reasoning**: Reasons over the accumulated historical evidence, identifying recurring systemic risk patterns and synthesizing proactive guardrails. |

### Memory OFF vs. Memory ON: The Hackathon Demonstration

- **Without Memory (Memory OFF)**:
  Generic, textbook checklist advice based solely on today's proposal (*“Check CPU alerts, ensure rollback scripts exist”*).
- **With Hindsight (Memory ON)**:
  Grounded historical evidence citing specific previous projects (*“In 2025, Project Orion's Principal DBA warned that >400 connections on this exact shared PostgreSQL cluster would cause saturation. The warning was bypassed, resulting in an 87-minute P0 outage. Your proposal specifies 450 connections without pgBouncer transaction pooling.”*).

---

## 4. Key Features

1. **Risk Check & Risk Echo (Run Risk)**:
   Evaluates incoming project proposals against historical near-misses and highlights matching causal chains.
2. **Visual Memory Chain Graph**:
   Interactive, 7-node visual pipeline connecting the current proposal through past warning, decision, action, outcome, lesson, and future risk.
3. **Interactive Historical Memory Timeline**:
   Visual chronology tracking organizational warnings, incidents, and postmortem rules from 2023 to present.
4. **What Changed? (Comparative Rigor)**:
   Strictly grounded side-by-side comparison of **PAST vs TODAY**, distinguishing what is **STILL SIMILAR** from what **CHANGED**. Never hallucinates comparison data.
5. **Why Did ECHOLESS Say This? (Evidence Panel)**:
   Trust and auditability layer classifying all insights into `HISTORICAL_FACT`, `CURRENT_INPUT`, or `AI_INTERPRETATION`.
6. **Memory Evolution Timeline**:
   Visual demonstration of cognitive accumulation across Interaction 1 (generic), Interaction 5 (context discovered), Interaction 10 (pattern recognition), and Interaction 20+ (deep institutional foresight).
7. **Save Lesson to Bank**:
   Allows teams to retain new near-miss lessons and mitigations into Hindsight with 1 click, immediately updating the bank for future proposals.
8. **Interactive Judge Demo Flow (/demo)**:
   Curated 8-step guided walkthrough designed for hackathon judges and video recording.
9. **Real-Time Voice Memory Advisor (`gemini-3.8-live`)**:
   Interactive voice architecture consultation powered by the Gemini Live API. Engineers can speak naturally to ask what their proposals almost missed, receiving low-latency 24kHz audio responses with gapless playback scheduling, real-time audio visualizer, live transcript, and speech interruption support.

---

## 5. Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 React 19 + Tailwind CSS UI                   │
│   (Overview · Analyze · Memory Browser · Learning · Demo)   │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API
┌──────────────────────────────▼──────────────────────────────┐
│                  Express Full-Stack Server                  │
│       (/api/health · /api/analyze · /api/memories/retain)   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
┌──────────────▼─────────────┐ ┌──────────────▼──────────────┐
│      Analysis Engine       │ │    Hindsight Client SDK      │
│  (Risk Echo / What Changed)│ │ (@vectorize-io/hindsight-.. │
└────────────────────────────┘ └──────────────┬──────────────┘
                                              │ Retain / Recall / Reflect
                               ┌──────────────▼──────────────┐
                               │    Hindsight Memory Cloud   │
                               │  Bank: echoless-org-memory  │
                               └─────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Framer Motion.
- **Backend**: Node.js, Express, `server.ts` entry point running Vite middlewares in development.
- **Memory Engine**: `@vectorize-io/hindsight-client` with full fallback engine for local testing.

---

## 6. Environment Setup & Configuration

### Prerequisites
- Node.js >= 18 (Node 22 recommended)
- npm or pnpm

### Environment Variables

Configure the following variables in `.env` (or via environment injection):

```bash
# GEMINI_API_KEY (Provided automatically in AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# Hindsight Cloud Configuration (Server-Side Only - Never Exposed to Browser)
HINDSIGHT_API_KEY="your-hindsight-api-key"
HINDSIGHT_BANK_ID="echoless-org-memory"
HINDSIGHT_BASE_URL="https://api.hindsight.vectorize.io"
```

> **Security Guarantee**: `HINDSIGHT_API_KEY` remains strictly on the server-side in `server.ts` and `hindsight.service.ts`. It is never prefixed with `VITE_` or exposed in client bundles.

---

## 7. Local Development & Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

3. **Check Types & Lint**:
   ```bash
   npm run typecheck
   npm run lint
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 8. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Live cluster health status, connectivity state, and memory count. |
| `POST` | `/api/setup` | Initializes or verifies memory bank configuration. |
| `POST` | `/api/seed` | Indexes the 12+ synthetic enterprise near-miss memory dataset. |
| `POST` | `/api/analyze` | Executes Risk check with `memoryMode: 'on' \| 'off'`. |
| `GET` | `/api/memories` | Lists retained organizational memories with search filters. |
| `POST` | `/api/memories/retain` | Retains raw text or architectural postmortems into Hindsight. |
| `POST` | `/api/lesson` | Retains structured Warning → Decision → Action → Outcome → Lesson chains. |

---

## 9. 8-Step Demo Walkthrough (For Judges)

Navigate to the **Demo** tab in the top navigation:

1. **Step 1 (Memory OFF)**: Click *Run Memory OFF Baseline*. Observe the generic advice lacking any organizational context.
2. **Step 2 (Memory ON)**: Click *Re-Run Hindsight Check*. Hindsight queries the bank and identifies the 2025 Project Orion precedent.
3. **Step 3 (Risk Echo)**: Review the connected 7-node memory graph showing the warning ignored before the 87-minute outage.
4. **Step 4 (Timeline)**: Inspect the chronological milestones from 2023 to present.
5. **Step 5 (What Changed?)**: Review the strict side-by-side comparison of past vs present dependencies and scale.
6. **Step 6 (Evidence)**: Examine the audit trail categorized into `HISTORICAL_FACT`, `CURRENT_INPUT`, and `AI_INTERPRETATION`.
7. **Step 7 (Save Lesson)**: Click *Retain This Lesson to Hindsight* to record a newly verified mitigation into the memory bank.
8. **Step 8 (Repeat Check)**: Run a subsequent proposal (*Phoenix Billing V2*) and observe that the newly retained lesson is immediately recalled!

---

## 10. Synthetic Enterprise Dataset

The repository includes a curated benchmark dataset of 12+ interconnected organizational near-miss scenarios:
- **Project Orion (2025)**: Shared database connection pool saturation under peak billing traffic.
- **Valkyrie Gateway (2024)**: 30-minute canary window masking upstream retry amplification.
- **Project Atlas (2024)**: Destructive down-migration script preventing safe rollback.
- **Sentinel Identity (2024)**: Strict zero-second clock leeway triggering edge JWT mass expiration.
- **Boreas Event Stream (2023)**: Missing poison-pill quarantine flooding dead-letter queues.
- **Project Aegis (2024)**: Decommissioning legacy servers before ISP DNS TTL cleared.
- **Apollo Engine (2025)**: Webhook concurrency race conditions without distributed locks.
- **Helios Platform (2023)**: Synchronous foreign-key table lock on 40M-row tables.
- **Cronos Scheduler (2024)**: Bulk worker starvation delaying P0 user notifications.
- **Zephyr Microservices (2025)**: Cold-start latency storms during automated scaling bursts.
- **Hermes Gateway (2024)**: Deprecating legacy TLS ciphers silently breaking partner feeds.
- **Selene Export (2025)**: Uncached decryption calls exhausting regional AWS KMS API quotas.

---

## 11. Known Limitations & Roadmap

- **Multi-Tenant Memory Separation**: The current release focuses on a single organizational bank (`echoless-org-memory`). Future iterations will support department-level sub-banks with permission boundaries.
- **Direct Jira/Slack Ingest**: Future enhancements will provide webhooks to ingest design review comments and Slack threads directly into Hindsight without manual entry.

---

## License

Apache-2.0
