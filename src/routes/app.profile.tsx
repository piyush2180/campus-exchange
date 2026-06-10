import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Mail, Coins, Footprints, Trophy, Save, LogOut } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Campus Exchange" }] }),
  component: Profile,
});

function Profile() {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state.profile) setDisplayName(state.profile.display_name);
  }, [state.profile]);

  if (!state.profile || !state.user) return null;

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Display name cannot be empty");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", state.user!.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't update profile", { description: error.message });
    } else {
      toast.success("Profile updated");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your display name and review your stats.
        </p>
      </div>

      {/* Identity card */}
      <div className="surface-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
            <User className="h-7 w-7" />
          </span>
          <div>
            <p className="text-lg font-semibold">{state.profile.display_name}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {state.user.email}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4 border-t border-border pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={40}
              placeholder="How you appear on the leaderboard"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<Footprints className="h-4 w-4" />}
          label="Total steps"
          value={state.profile.total_steps.toLocaleString()}
        />
        <StatTile
          icon={<Coins className="h-4 w-4" />}
          label="Coins"
          value={state.profile.coins.toFixed(2)}
        />
        <StatTile
          icon={<Trophy className="h-4 w-4" />}
          label="Steps today"
          value={state.profile.steps_today.toLocaleString()}
        />
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
