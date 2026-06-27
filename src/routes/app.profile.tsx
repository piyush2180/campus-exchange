import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useApp } from "@/hooks/useApp";
import { toast } from "sonner";
import { updateProfileDisplayName } from "@/services/profile.service";
import { profileUpdateSchema } from "@/schemas";
import { ProfileIdentityCard } from "@/features/profile/ProfileIdentityCard";
import { ProfileStatsGrid } from "@/features/profile/ProfileStatsGrid";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — Campus Exchange" }] }),
  component: Profile,
});

function Profile() {
  const { state, logout, refresh } = useApp();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (state.profile) setDisplayName(state.profile.display_name);
  }, [state.profile]);

  if (!state.profile || !state.user) return null;

  const handleSave = async () => {
    const validation = profileUpdateSchema.safeParse({ displayName });
    if (!validation.success) {
      toast.error(validation.error.errors[0]?.message || "Invalid display name");
      return;
    }

    setSaving(true);
    const { error } = await updateProfileDisplayName(state.user.id, displayName.trim());
    setSaving(false);

    if (error) {
      toast.error("Couldn't update profile", { description: error.message });
    } else {
      await refresh();
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

      <ProfileIdentityCard
        displayName={displayName}
        setDisplayName={setDisplayName}
        userEmail={state.user.email}
        saving={saving}
        handleSave={handleSave}
        handleLogout={handleLogout}
      />

      <ProfileStatsGrid
        totalSteps={state.profile.total_steps}
        coins={state.profile.coins}
        stepsToday={state.profile.steps_today}
      />
    </div>
  );
}
