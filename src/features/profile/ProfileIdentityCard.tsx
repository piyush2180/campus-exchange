import { User, Mail, Save, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileIdentityCardProps {
  displayName: string;
  setDisplayName: (val: string) => void;
  userEmail: string;
  saving: boolean;
  handleSave: () => void;
  handleLogout: () => void;
}

export function ProfileIdentityCard({
  displayName,
  setDisplayName,
  userEmail,
  saving,
  handleSave,
  handleLogout,
}: ProfileIdentityCardProps) {
  return (
    <div className="surface-card p-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
          <User className="h-7 w-7" />
        </span>
        <div>
          <p className="text-lg font-semibold">{displayName}</p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            {userEmail}
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
  );
}
