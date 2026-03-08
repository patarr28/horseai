# Festival Whisperer — Agent Context Guide

> **Purpose**: This document gives future AI agents all the context needed to work on this project effectively.

## Project Overview

**Festival Whisperer** is a Cheltenham Festival horse racing advice app — a sleek, dark-mode professional betting terminal built with Next.js App Router, Tailwind CSS, and TypeScript.

- **Design Language**: Neon green = strong/positive ("Banker"), orange = "Value", red = risk ("Drifting")
- **Architecture**: Data-first, server-side API routes feed client components
- **Dev Port**: Usually `localhost:3001`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Webpack) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Database | Supabase (Postgres + Auth) |
| AI | Google Gemini via `@google/genai` |
| Racing Data | The Racing API (REST + MCP) |
| MCP SDK | `@modelcontextprotocol/sdk` (StreamableHTTP) |
| PWA | `next-pwa` |

---

## Environment Variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL     — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anonymous key
RACING_API_USER              — The Racing API username (header auth)
RACING_API_PASS              — The Racing API password (header auth)
GEMINI_API_KEY               — Google Gemini API key
```

---

## Directory Structure

```
festival-whisperer/
├── app/
│   ├── page.tsx              # Home dashboard
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles & design tokens
│   ├── account/              # User account page
│   ├── auth/                 # Auth callback handling
│   ├── bets/                 # Bet tracking page
│   ├── chat/                 # AI chat interface
│   ├── horses/               # Horse detail pages (dynamic [id])
│   ├── insights/             # AI insights page
│   ├── login/                # Login page
│   ├── races/                # Race listing & detail pages
│   └── api/
│       ├── racing/           # GET — Fetches racecards from The Racing API
│       ├── horse-verdict/    # POST — Gemini AI verdict for a horse
│       ├── nap-of-the-day/   # GET — Gemini's best bet of the day
│       ├── race-preview/     # POST — AI race preview generator
│       ├── chat/             # POST — AI chat endpoint
│       ├── odds/             # Odds data
│       └── analyze-slip/     # Bet slip analysis
├── components/
│   ├── RaceCard.tsx          # Race card component
│   ├── HorseRow.tsx          # Horse listing row
│   ├── AIVerdict.tsx         # AI horse verdict panel
│   ├── AIRacePreview.tsx     # AI race preview component
│   ├── BottomNav.tsx         # Mobile bottom navigation
│   ├── ConfidenceGauge.tsx   # Visual confidence meter
│   ├── ConsultantInsights.tsx # Expert analysis panel
│   ├── GeminiBestBet.tsx     # Gemini best bet widget
│   ├── SignalBadge.tsx       # Signal type badges (BANKER, VALUE, etc.)
│   └── SmartAccaBuilder.tsx  # Accumulator bet builder
├── lib/
│   ├── mcpClient.ts          # MCP client for The Racing API (54+ tools)
│   ├── gemini.ts             # Gemini AI utility functions
│   ├── supabase.ts           # Supabase client init
│   ├── kellyCriterion.ts     # Kelly Criterion staking calculator
│   ├── value-engine.ts       # Value bet detection engine
│   ├── useLiveOdds.ts        # Live odds hook
│   ├── haptics.ts            # Haptic feedback utility
│   ├── mock-data.ts          # Mock/fallback data
│   └── types/                # TypeScript type definitions
├── supabase/
│   └── schema.sql            # Database schema (profiles, bets, leaderboard)
└── next.config.ts            # Next config (PWA + serverExternalPackages)
```

---

## The Racing API — Complete Guide

### Two Access Methods

#### 1. Direct REST API (currently used for free racecards)
```typescript
const authString = Buffer.from(`${RACING_API_USER}:${RACING_API_PASS}`).toString('base64');
const response = await fetch('https://api.theracingapi.com/v1/racecards/free', {
  headers: { 'Authorization': `Basic ${authString}` }
});
```

#### 2. MCP Client (for 54+ advanced tools)
```typescript
import { callRacingTool } from '@/lib/mcpClient';

// The MCP client uses StreamableHTTPClientTransport
// Auth is via X-RacingAPI-Username / X-RacingAPI-Password headers
const result = await callRacingTool('search_horse', { name: 'Constitution Hill' });

// Result shape: { content: [{ type: 'text', text: '<JSON string>' }] }
const data = JSON.parse(result.content[0].text);
```

### MCP Server Details
- **URL**: `https://mcp.theracingapi.com/`
- **Transport**: `StreamableHTTPClientTransport` (NOT SSE — SSE returns 404)
- **Auth**: Custom headers `X-RacingAPI-Username` and `X-RacingAPI-Password`
- **Singleton**: `lib/mcpClient.ts` caches the client for the process lifetime
- **Next.js Config**: Must have `serverExternalPackages: ["@modelcontextprotocol/sdk"]` in `next.config.ts` or webpack will fail to bundle it

### Available MCP Tools (54 total)

| Category | Key Tools | Plan Required |
|---|---|---|
| **Free Racecards** | `get_racecards_free` | Free |
| **Racecard Summaries** | `get_racecard_summaries` | Basic |
| **Full Racecards** | `get_racecard_by_race_standard`, `get_racecard_by_race_pro` | Standard/Pro |
| **Big Races** | `get_big_races` | Standard |
| **Results** | `get_results_today_free`, `get_results_today`, `get_results`, `get_result_by_id` | Free/Standard |
| **Horse Search** | `search_horse` | Standard |
| **Horse Profiles** | `get_horse_profile`, `get_horse_profile_pro` | Standard/Pro |
| **Horse Results** | `get_horse_results`, `get_horse_racecard_results` | Basic/Pro |
| **Horse Times** | `get_horse_distance_times` | Basic |
| **Jockey Search** | `search_jockey` | Standard |
| **Jockey Analysis** | `get_jockey_course_analysis`, `get_jockey_distance_analysis`, `get_jockey_owner_analysis`, `get_jockey_trainer_analysis` | Standard |
| **Trainer Search** | `search_trainer` | Standard |
| **Trainer Analysis** | `get_trainer_course_analysis`, `get_trainer_distance_analysis`, `get_trainer_horse_age_analysis`, `get_trainer_jockey_analysis`, `get_trainer_owner_analysis` | Standard |
| **Owner** | `search_owner`, `get_owner_results`, `get_owner_course_analysis`, `get_owner_distance_analysis`, `get_owner_jockey_analysis`, `get_owner_trainer_analysis` | Standard/Pro |
| **Sire** | `search_sire`, `get_sire_results`, `get_sire_class_analysis`, `get_sire_distance_analysis` | Standard/Pro |
| **Dam** | `search_dam`, `get_dam_results`, `get_dam_class_analysis`, `get_dam_distance_analysis` | Standard/Pro |
| **Damsire** | `search_damsire`, `get_damsire_results`, `get_damsire_class_analysis`, `get_damsire_distance_analysis` | Standard/Pro |
| **Odds** | `get_odds` | Pro |
| **Metadata** | `get_regions`, `get_courses` | Free |
| **International** | `get_north_america_meets/entries/results`, `get_australia_meets/races/race` | Free + Add-on |

### Known Bug
`get_racecards_free` sends a `limit` parameter that the free REST API rejects (422 error). That's why `/api/racing/route.ts` uses direct REST instead of MCP for free racecards.

### Parsing MCP Results
All MCP tools return: `{ content: [{ type: 'text', text: '<stringified JSON>' }] }`
```typescript
const result = await callRacingTool('tool_name', { ...args });
const text = (result.content as any[])
  .filter(c => c.type === 'text')
  .map(c => c.text)
  .join('');
const data = JSON.parse(text);
```

---

## Supabase

- **Project**: `etnnawmtfcqralqficcv`
- **Schema**: See `supabase/schema.sql` for tables (user profiles, bets, leaderboard, racing_cache)
- **Auth**: Email/password via `@supabase/auth-helpers-nextjs`
- **Caching**: Race data is cached in `racing_cache` table with 30-minute TTL

---

## Gemini AI

- **Library**: `@google/genai`
- **Utility**: `lib/gemini.ts` — Contains prompt templates for horse verdicts, race previews, NAP of the day, and chat
- **API Routes**: `/api/horse-verdict`, `/api/nap-of-the-day`, `/api/race-preview`, `/api/chat`

---

## Design Rules

1. **Dark mode only** — Professional betting terminal aesthetic
2. **Signal colors**: Neon green = BANKER, Orange = VALUE BET, Red = DRIFTING
3. **Data-first** — Always show real data, no placeholders
4. **Mobile-first** — Bottom nav, responsive layouts
5. **PWA enabled** — Installable on mobile (disabled in dev)
