import { supabase } from "@/integrations/supabase/client";

/**
 * Update user's display name.
 */
export async function updateProfileDisplayName(userId: string, displayName: string) {
  return await supabase.from("profiles").update({ display_name: displayName }).eq("id", userId);
}
