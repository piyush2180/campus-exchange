import { z } from "zod";

/**
 * Validation schema for daily wellness check-in form.
 */
export const wellnessCheckInSchema = z.object({
  steps: z
    .number({ invalid_type_error: "Please enter a valid step count" })
    .min(0, "Steps must be at least 0")
    .max(100000, "Step count seems unrealistic"),
  sleep: z
    .number({ invalid_type_error: "Please enter valid sleep hours" })
    .min(0, "Sleep hours must be at least 0")
    .max(24, "Sleep hours cannot exceed 24"),
  water: z
    .number({ invalid_type_error: "Please enter valid water intake" })
    .min(0, "Water intake must be at least 0L")
    .max(20, "Water intake cannot exceed 20L"),
  workout: z.boolean(),
  mood: z.number().min(1).max(5),
  journal: z.string().max(1000, "Journal entry is too long").optional(),
});

/**
 * Validation schema for placing a bet.
 */
export const placeBetSchema = z.object({
  stake: z.number().positive("Stake must be greater than 0"),
});

/**
 * Validation schema for profile update.
 */
export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name cannot be empty")
    .max(40, "Display name cannot exceed 40 characters"),
});
