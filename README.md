# Campus Exchange

A modern web application built with TanStack Start, React, Tailwind CSS, and Supabase.

## Tech Stack

- **Framework:** [TanStack Start](https://tanstack.com/router/latest/docs/framework/react/start/overview) (Full-stack React framework)
- **Frontend Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database & Authentication:** [Supabase](https://supabase.com/)
- **State & Routing:** [TanStack Router](https://tanstack.com/router) & [TanStack Query](https://tanstack.com/query)
- **Build Tool:** [Vite](https://vite.dev/)

---

## Getting Started

### 1. Prerequisites

Make sure you have Node.js (v18+) or [Bun](https://bun.sh/) installed.

### 2. Environment Setup

Create a `.env` file in the root directory (this file is ignored by Git to protect your secrets) and add your Supabase credentials:

```env
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_publishable_anon_key"
```

### 3. Installation

Install dependencies using your preferred package manager:

```bash
# Using npm
npm install

# Using Bun
bun install
```

### 4. Running Locally

Start the development server:

```bash
# Using npm
npm run dev

# Using Bun
bun run dev
```

The application will be available at `http://localhost:3000` (or the port specified by Vite).

---

## Project Structure

- `src/` - Application source code.
  - `routes/` - File-based routing configuration using TanStack Router.
  - `components/` - Shared UI components.
  - `lib/` - Helper libraries, utilities, and Supabase clients.
- `supabase/` - Local Supabase config and migration scripts.
- `wrangler.jsonc` - Configuration for Cloudflare deployment.
