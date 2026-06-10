import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Footprints, Sparkles, TrendingUp, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/hooks/useApp";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Campus Exchange" },
      { name: "description", content: "Sign in to Campus Exchange and start investing your steps." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { state, signIn, signUp } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (state.user) navigate({ to: "/app" });
  }, [state.user, navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password, name || email.split("@")[0]);
        if (error) {
          toast.error("Sign up failed", { description: error.message });
          return;
        }
        toast.success("Account created", { description: "Welcome to Campus Exchange!" });
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error("Sign in failed", { description: error.message });
          return;
        }
      }
      navigate({ to: "/app" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside className="hero-bg relative hidden flex-col justify-between bg-surface p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Footprints className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">Campus Exchange</span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-4xl font-semibold tracking-tight">
            Every step you take, <span className="brand-gradient-text">grows your portfolio</span>.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of movers turning daily activity into a playful investing habit.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-3">
            <Perk icon={<Sparkles className="h-4 w-4" />} text="Free to start, no card needed" />
            <Perk icon={<TrendingUp className="h-4 w-4" />} text="Live, simulated market" />
            <Perk icon={<Trophy className="h-4 w-4" />} text="Compete on the leaderboard" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Campus Exchange · Simulated assets only
        </p>
      </aside>

      <main className="flex items-center justify-center bg-background p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-10 inline-flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <Footprints className="h-4 w-4" />
            </span>
            <span className="text-base font-semibold tracking-tight">Campus Exchange</span>
          </Link>

          <div className="surface-card p-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue building your portfolio."
                : "Start earning coins for every step today."}
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Display name</Label>
                  <Input
                    id="name"
                    placeholder="Alex Carter"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                {mode === "signup" && (
                  <p className="text-xs text-muted-foreground">
                    Just 6+ characters — no symbols or capitals required.
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New to Campus Exchange?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium text-foreground hover:underline"
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function Perk({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 backdrop-blur">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[color:var(--accent)] text-[color:var(--accent-foreground)]">
        {icon}
      </span>
      <span className="text-sm">{text}</span>
    </div>
  );
}
