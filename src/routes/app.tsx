import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useApp } from "@/hooks/useApp";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { state } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.loading && !state.user) {
      navigate({ to: "/login" });
    }
  }, [state.loading, state.user, navigate]);

  if (state.loading || !state.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container-page py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  );
}
