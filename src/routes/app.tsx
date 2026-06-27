import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useApp } from "@/hooks/useApp";
import { Loader2 } from "lucide-react";
import { CopilotPanel } from "@/features/copilot/CopilotPanel";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  useEffect(() => {
    if (!state.loading && !state.user) {
      navigate({ to: "/login" });
    }
  }, [state.loading, state.user, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setIsCopilotOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (state.loading || !state.user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <Navbar
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen((prev) => !prev)}
      />
      <main className="container-page py-8 md:py-12">
        <Outlet />
      </main>
      <CopilotPanel isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
    </div>
  );
}
