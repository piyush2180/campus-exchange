import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Footprints,
  Coins,
  TrendingUp,
  Trophy,
  Activity,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="hero-bg relative overflow-hidden">
        <div className="container-page relative pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--brand)]" />
              Now in beta — earn coins from daily wellness &amp; steps
            </span>
            <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight md:text-7xl">
              Turn your steps into <span className="brand-gradient-text">investments</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
              Walk. Log. Invest. Build a portfolio with every wellness goal you achieve — powered by
              a playful, simulated market built for movers.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link to="/login">
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/app">View demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              No credit card required · Daily wellness check-ins &amp; activity scores
            </p>
          </div>

          {/* Hero card preview */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="surface-card overflow-hidden">
              <div className="grid grid-cols-1 divide-border md:grid-cols-3 md:divide-x">
                <PreviewStat
                  icon={<Footprints className="h-4 w-4" />}
                  label="Steps today"
                  value="8,420"
                  delta="+12%"
                />
                <PreviewStat
                  icon={<Coins className="h-4 w-4" />}
                  label="Coins earned"
                  value="84"
                  delta="+8 today"
                />
                <PreviewStat
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Portfolio"
                  value="312.40"
                  delta="+4.2%"
                  positive
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border/60 bg-surface py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-[color:var(--brand)]">How it works</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight">
              Three steps to start investing
            </h2>
            <p className="mt-3 text-muted-foreground">
              From your morning walk to a growing portfolio — without ever opening a brokerage.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Step
              n="01"
              icon={<Footprints className="h-5 w-5" />}
              title="Log daily wellness"
              text="Complete your daily check-in with steps, sleep, water, and mood."
            />
            <Step
              n="02"
              icon={<Coins className="h-5 w-5" />}
              title="Earn coins"
              text="Your Activity Score and consistency streaks award coins directly to your wallet."
            />
            <Step
              n="03"
              icon={<TrendingUp className="h-5 w-5" />}
              title="Invest in assets"
              text="Buy fictional indices that move in real time. Watch your portfolio grow."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-[color:var(--brand)]">Features</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight">
              A fintech-grade experience for movers
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Feature
              icon={<Activity className="h-5 w-5" />}
              title="Wellness & step tracking"
              text="Daily check-ins turn your activity and healthy habits into investment coins."
            />
            <Feature
              icon={<TrendingUp className="h-5 w-5" />}
              title="Gamified investing"
              text="Buy and sell playful indices like HACK, CODE, FIT — prices move every few seconds."
            />
            <Feature
              icon={<Trophy className="h-5 w-5" />}
              title="Leaderboard"
              text="See where you stand against friends and the community by total steps."
            />
            <Feature
              icon={<Coins className="h-5 w-5" />}
              title="Simple wallet"
              text="A single coin balance makes it easy to track what you've earned and spent."
            />
            <Feature
              icon={<Shield className="h-5 w-5" />}
              title="Safe by design"
              text="Simulated assets. No real money. Learn the mechanics with zero risk."
            />
            <Feature
              icon={<Sparkles className="h-5 w-5" />}
              title="Built for demo"
              text="Beautifully crafted UI ready to ship for your next project or hackathon."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="container-page">
          <div className="surface-card hero-bg relative overflow-hidden p-10 md:p-16">
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-xl">
                <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Your next step is your next investment.
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Start free in seconds. No setup, no risk — just movement.
                </p>
              </div>
              <Button size="lg" asChild>
                <Link to="/login">
                  Create your account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function PreviewStat({
  icon,
  label,
  value,
  delta,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      </div>
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          positive
            ? "bg-[color:var(--accent)] text-[color:var(--accent-foreground)]"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {delta}
      </span>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  text,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="surface-card p-7 transition-transform hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
          {icon}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{n}</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-foreground/20">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">{icon}</span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
