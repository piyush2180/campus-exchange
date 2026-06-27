import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Database, Server, Cpu, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/ai-architecture")({
  head: () => ({ meta: [{ title: "AI Architecture — Pulse AI Showcase" }] }),
  component: AIArchitectureShowcase,
});

function AIArchitectureShowcase() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--brand)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--brand)] border border-[color:var(--brand)]/30">
          <Sparkles className="h-3.5 w-3.5" />
          Production Technical Architecture
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">How Pulse AI Works</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          A hybrid Retrieval-Augmented Generation (RAG) system engineered specifically for
          CampusExchange financial & wellness telemetry.
        </p>
      </div>

      {/* RAG Flow Diagram Card */}
      <div className="surface-card p-6 space-y-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Layers className="h-5 w-5 text-[color:var(--brand)]" />
          Hybrid Retrieval-Augmented Generation (RAG) Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
            <span className="text-xs font-bold text-[color:var(--brand)] uppercase tracking-wider block">
              1. Intent & Context
            </span>
            <p className="text-sm font-semibold">Intent Classification</p>
            <p className="text-xs text-muted-foreground">
              Classifies user query into SQL, Knowledge, Action, Navigation, or Small Talk
              categories, capturing active route context.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
            <span className="text-xs font-bold text-[color:var(--brand)] uppercase tracking-wider block">
              2. Dual Retrieval
            </span>
            <p className="text-sm font-semibold">SQL & Knowledge Matcher</p>
            <p className="text-xs text-muted-foreground">
              Queries structured Supabase SQL database for live holdings/logs + matches platform
              guides (Phase 2B pgvector hook).
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
            <span className="text-xs font-bold text-[color:var(--brand)] uppercase tracking-wider block">
              3. Grounding
            </span>
            <p className="text-sm font-semibold">Prompt Builder</p>
            <p className="text-xs text-muted-foreground">
              Merges user state JSON + retrieved documentation + thread memory into a
              hallucination-free grounded prompt.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
            <span className="text-xs font-bold text-[color:var(--brand)] uppercase tracking-wider block">
              4. Generation
            </span>
            <p className="text-sm font-semibold">Gemini 2.5 Flash</p>
            <p className="text-xs text-muted-foreground">
              Streams token-by-token markdown responses, source attributions, interactive cards, and
              automated route actions.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Deep-Dive Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="surface-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-base">
            <Database className="h-5 w-5 text-sky-400" />
            SQL-First Data Retrieval
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Relational financial and wellness data (holdings, balance, trades, bets, wellness logs)
            is always queried directly from PostgreSQL via Supabase Row Level Security. Relational
            data is never hallucinated or retrieved from lossy embeddings.
          </p>
        </div>

        <div className="surface-card p-6 space-y-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-base">
            <Server className="h-5 w-5 text-purple-400" />
            Phase 2B Pluggable Vector Hooks
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The retrieval interface in <code className="text-foreground">retriever.ts</code> is
            structured with modular interfaces. Adding Gemini Embeddings and pgvector semantic
            similarity in Phase 2B requires zero modifications to prompt engineering or UI code.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button asChild>
          <Link to="/app">
            Back to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
