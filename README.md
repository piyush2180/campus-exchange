# CampusExchange

> A full-stack financial wellness and virtual trading platform powered by an intelligent, context-aware AI copilot (Pulse AI).

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-2.5_Flash-8E75B5?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)

---

## Overview

**CampusExchange** bridges daily physical wellness with virtual financial education. The application incentivizes healthy daily habits—such as step tracking, hydration, sleep, and physical workouts—by converting wellness check-in performance into virtual **wellness coins**. Users invest these coins in simulated asset indices, participate in 60-second market prediction wagers, challenge peers in head-to-head step duels, and consult **Pulse AI**, an integrated retrieval-augmented AI copilot.

### Why CampusExchange Was Built
1. **Gamified Health Literacy**: Encourages consistent physical activity by linking habit tracking directly to virtual market mechanics.
2. **Risk-Free Financial Learning**: Provides a simulated trading environment where users learn portfolio diversification, asset volatility, and wagering strategies without capital risk.
3. **Grounded AI Guidance**: Demonstrates production-grade Retrieval-Augmented Generation (RAG) by grounding AI responses in live database state and platform knowledge bases.

---

## Live Demo

🚀 **Application Preview & Live Deployment**: [https://campus-exchange-ashy.vercel.app](https://campus-exchange-ashy.vercel.app)

---

## Screenshots

| View | Screenshot |
| :--- | :--- |
| **Dashboard** | ![Dashboard Overview](./docs/screenshots/dashboard.jpg) |
| **Portfolio Management** | ![Portfolio View](./docs/screenshots/portfolio.jpg) |
| **Wellness Telemetry** | ![Wellness Tracking](./docs/screenshots/wellness.jpg) |
| **Simulated Market** | ![Trading Market](./docs/screenshots/market.jpg) |
| **Prediction Markets & Duels** | ![Prediction Bets](./docs/screenshots/bets.jpg) |
| **Campus Leaderboard** | ![Leaderboard Ranking](./docs/screenshots/leaderboard.jpg) |
| **Pulse AI Copilot** | ![Pulse AI Assistant](./docs/screenshots/pulse-ai.jpg) |
| **Weekly Health Report** | ![Weekly Report](./docs/screenshots/weekly-report.jpg) |

---

## Core Features

### 🏃 Wellness Tracking & Telemetry
* **Daily Check-Ins**: Log physical steps, sleep duration (hours), water intake (liters), workouts, mood, and reflection journals.
* **Activity Score Formula**: Dynamic health scoring calculated across weighted pillars (Steps max 40, Sleep max 20, Water max 20, Workout max 20).
* **Streak Bonuses**: Automated tracking of daily check-in consistency with milestone coin rewards.
* **History & Analytics**: Comprehensive trend charts and statistical benchmarks comparing weekly and monthly habit consistency.

### 📈 Virtual Trading & Market Simulation
* **Simulated Skill Futures**: Live trading engine supporting asset indices based on developer skills, habit futures, and productivity tickers (`CODE`, `HACK`, `FIT`, `STDY`, `SLP`).
* **Shared Real-Time Prices**: Prices live in a `market_assets` table. The `tick_market()` Postgres function advances them every 5 seconds (±2% random drift plus 40% momentum) and Supabase Realtime streams each tick, so every user sees the same price at the same moment.
* **Server-Side Trade Execution**: Buys and sells go through the `trade_asset()` function, which locks the user's rows, checks the balance at the current server price, moves coins and shares and writes the movement log in one transaction.
* **Portfolio Analytics**: Live calculation of total portfolio value, cost basis, unrealized Profit & Loss (P&L), and percentage return.

### 🎲 Prediction Markets & Duels
* **60-Second Market Bets**: Predict whether an asset index will rise or fall over 60 seconds for a 1.8x multiplier.
* **Goal Wagers**: Wager wellness coins on hitting target step milestones before midnight for a 2.0x payout.
* **Step Duels**: Head-to-head 24-hour step battles challenging peers for the combined coin pot.

### ⚡ Real-Time Sync, Asset Movement Logs & Notifications
* **Real-Time State Synchronization**: Supabase Realtime (`postgres_changes`) streams profile, holdings, bet and notification changes to every open tab and device. Subscriptions are filtered per user on the server and gated by Row Level Security.
* **Asset Movement Logs**: Every buy and sell is recorded in an `asset_movements` table (shares, execution price, coin delta, position after the trade) and shown as a live log on the Portfolio page.
* **Operational Status Updates**: Postgres triggers watch trades, bet and duel status changes (`pending` to `won` / `lost`), duel challenges and wellness check-ins, and write a status update for each one into a `notifications` table.
* **Dashboard Notifications**: A notification bell in the app header shows those updates live with an unread badge and a mark-all-read action.

### 🔒 Server-Authoritative Economy
* **No Client-Side Coin Writes**: Column-level grants revoke `INSERT` / `UPDATE` on coins, holdings, bets, wellness logs and movement logs; users can only rename themselves. Every balance change runs inside a `SECURITY DEFINER` Postgres function keyed to `auth.uid()`.
* **Bets Settled in the Database**: `place_bet()` checks the balance, fixes odds and start values and debits the stake; `resolve_due_bets()` settles due bets against the live price or step counts and pays winners.
* **Scored Check-Ins**: `submit_wellness_check_in()` validates the inputs, computes the Activity Score, streak and milestone bonus, and credits only the coin difference when a check-in is edited.

### 🧠 Pulse AI Copilot (SQL-Grounded AI Generation)
* **SQL-Grounded Context Engine**: Queries live PostgreSQL data (holdings, wellness logs, bets, asset movements) and injects it as structured JSON context into Gemini 2.5 Flash, so answers about the user's numbers come from the database.
* **Knowledge Base Matching**: Platform guides (activity score, market rules, bets, portfolio) are matched to the question by keywords and tags and added to the prompt next to the SQL data.
* **Page & Context Awareness**: Automatically interprets user queries like *"Explain this"* based on the active route and view state.
* **Universal Page Summaries (`✨ AI Summary`)**: One-click inline cards analyzing portfolio concentration, habit trends, and market volatility.
* **Navigation Automation**: Interprets natural language commands like *"Take me to my portfolio"* and executes client-side routing.
* **Rich Visual Cards & Mini-Charts**: Renders structured summary cards, step trend charts built from the user's recent `wellness_logs`, confidence badges, and activity timelines built from their `notifications` feed directly within conversation threads.
* **Report Export**: Generates and exports comprehensive Weekly Health & Financial Reports as downloadable Markdown documents.

---

## System Architecture

```mermaid
graph TD
    Client[React 19 / TanStack Start Frontend]
    Supabase[Supabase Platform]
    DB[(PostgreSQL Database)]
    Gemini[Google Gemini 2.5 Flash API]
    PulseAI[Pulse AI Engine]

    Client <-->|Row Level Security / Auth| Supabase
    Supabase -->|Realtime postgres_changes| Client
    Supabase <-->|Relational SQL Queries| DB
    Client <-->|State / Route Telemetry| PulseAI
    PulseAI <-->|SQL Data + Knowledge Context| Gemini
    PulseAI -->|Streamed Markdown / Navigation Actions| Client
```

---

## AI Pipeline Architecture

```mermaid
graph TD
    UserQuery[User Natural Language Query] --> IntentClassifier[Intent & Route Classifier]
    IntentClassifier -->|RAG Route| DualRetriever[Dual Retriever Pipeline]
    IntentClassifier -->|Greeting / OutOfDomain| InstantResponse[Instant Response Handler]
    
    DualRetriever -->|SQL Telemetry| SQLStore[(PostgreSQL Database)]
    DualRetriever -->|Keyword Match| KnowledgeStore[(Platform Knowledge Base)]
    
    SQLStore --> GroundedPromptBuilder[Grounded Prompt Builder]
    KnowledgeStore --> GroundedPromptBuilder
    
    GroundedPromptBuilder --> GeminiLLM[Gemini 2.5 Flash API]
    GeminiLLM --> StreamEngine[Token Streaming & Fallback Engine]
    StreamEngine --> RichCardParser[Rich Card & Action Parser]
    RichCardParser --> UI[Copilot Drawer / UI Overlay]
```

---

## Technology Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 / TanStack Start | Full-stack SSR/SPA architecture with type-safe routing |
| **Language** | TypeScript 5.7 | End-to-end static typing across routes, APIs, and models |
| **Database & Auth** | Supabase (PostgreSQL) | Production relational database, Row Level Security, and auth |
| **AI / LLM Integration** | Google Gemini 2.5 Flash | High-throughput streaming generative AI synthesis |
| **Styling & UI** | Tailwind CSS v4 / Shadcn UI | Custom dark-mode design system and responsive primitives |
| **Charts & Visualization** | Recharts | Interactive area charts, historical analytics, and mini-charts |
| **Validation** | Zod | Runtime schema validation for check-ins and forms |
| **Build System** | Vite 7.3 | High-performance ES modules bundler and dev server |

---

## Folder Structure

```
campus-exchange/
├── scripts/              # Build & deployment helper scripts (sync-vercel.js)
├── src/
│   ├── components/       # Global UI components (Navbar, Footer, Shadcn primitives)
│   ├── constants/        # Application constants and configuration defaults
│   ├── features/         # Feature-bound UI modules
│   │   ├── bets/         # Market, Goal, and Duel wager components
│   │   ├── copilot/      # Pulse AI panel, rich cards, mini-charts, summarizers
│   │   ├── dashboard/    # Daily telemetry stat cards and check-in forms
│   │   ├── leaderboard/  # Podium and global ranking tables
│   │   ├── market/       # Simulated asset exchange lists and pulse cards
│   │   ├── portfolio/    # Asset allocation bars and holdings tables
│   │   ├── profile/      # User profile cards and activity grids
│   │   └── wellness/     # Health history tables, benchmark charts, dashboards
│   ├── hooks/            # Custom React hooks (useApp, usePortfolio, useWellness, useMarket)
│   ├── integrations/     # Supabase client instances, middleware, and TypeScript definitions
│   ├── lib/              # Shared utilities and store helpers
│   ├── routes/           # TanStack file-based routing tree (`/app/*`, `/app/ai-architecture`)
│   ├── schemas/          # Zod validation schemas for forms and check-ins
│   ├── services/         # API services and business logic (trading, wellness, bets)
│   │   └── copilot/      # RAG retriever, intent router, prompt builder, server functions
│   └── types/            # TypeScript interface declarations
├── supabase/             # Supabase database migrations and project config
├── public/               # Static web assets
└── docs/                 # Screenshots and architectural documentation
```

---

## Installation & Local Setup

### 1. Prerequisites
Ensure you have **Node.js (v18+)** or **Bun** installed on your system.

### 2. Clone Repository
```bash
git clone https://github.com/piyush2180/campus-exchange.git
cd campus-exchange
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL="https://your-supabase-project.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
GEMINI_API_KEY="your-google-gemini-api-key"
```

### 5. Apply Database Migrations
Apply everything in `supabase/migrations` in order (for example with `supabase db push`). `20261023000000_realtime_activity.sql` creates the asset movement and notification tables with their triggers, and adds the tables to the Supabase Realtime publication. `20261023010000_server_authoritative_economy.sql` adds the shared `market_assets` table and the trade, bet and check-in functions, and revokes direct client writes to balances.

To check the migrations locally without a Supabase project, run `npm run test:db`. It applies every migration to PGlite (Postgres compiled to WASM) and tests the grants, RLS and economy functions.

### 6. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## Engineering Highlights

* **SQL-First Grounding**: Financial holdings, wallet balances, and health logs are queried directly from PostgreSQL to guarantee zero hallucination on user telemetry.
* **Resilient Stream Fallback**: Features a local grounded synthesis fallback engine so users receive immediate, accurate responses even if external LLM API rates are exceeded.
* **Server-Authoritative Economy**: Coins only move inside Postgres functions with row locks, so a modified client cannot mint coins, settle its own bets or trade at a fake price. The migrations are tested against a real Postgres engine (PGlite) covering permissions, overspend, payouts, streak bonuses and tick throttling.
* **Database-Driven Status Updates**: Notifications are written by `SECURITY DEFINER` triggers, so every trade, bet result and check-in produces a status update without extra client code.
* **Type-Safe Full-Stack Design**: Strict TypeScript contracts spanning Supabase schemas, TanStack routes, and component interfaces.

---

## Future Roadmap

- [x] Supabase Authentication & Row Level Security
- [x] Simulated Asset Index Trading Engine
- [x] Daily Wellness Tracking & Activity Score Algorithm
- [x] 60s Market Predictions & Step Duels
- [x] Pulse AI Copilot with Grounded SQL Retrieval
- [x] Universal Page AI Summaries & Navigation Actions
- [x] Real-Time Sync, Asset Movement Logs & Dashboard Notifications
- [x] Server-Authoritative Trades, Bets & Rewards
- [ ] Native Mobile App (React Native / Expo)

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/piyush2180/campus-exchange/issues).
