import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Footprints, LogOut, User } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { state, logout } = useApp();
  const { location } = useRouterState();
  const navigate = useNavigate();
  const onApp = location.pathname.startsWith("/app");

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
            <Footprints className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">Campus Exchange</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {onApp ? (
            <>
              <Link
                to="/app"
                activeOptions={{ exact: true }}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                to="/app/history"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                Wellness
              </Link>
              <Link
                to="/app/market"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                Market
              </Link>
              <Link
                to="/app/portfolio"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                Portfolio
              </Link>
              <Link
                to="/app/bets"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                Bets
              </Link>
              <Link
                to="/app/leaderboard"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                Leaderboard
              </Link>
            </>
          ) : (
            <>
              <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">
                How it works
              </a>
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">
                Features
              </a>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {state.user ? (
            <>
              <Link
                to="/app/profile"
                className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 transition-colors hover:bg-muted sm:flex"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                  <User className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-medium">{state.user.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
