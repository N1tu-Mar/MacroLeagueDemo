import { supabase } from '../lib/supabase';

export interface OnboardingProfileUpdate {
  username: string;
  goalCalories: number;
  goalProteinG: number;
  goalCarbsG: number;
  goalUnsaturatedFatG: number;
}

/**
 * Saves onboarding data into the profile row created by the auth trigger.
 * If the chosen username is already taken, falls back to keeping the
 * auto-generated one and still saves the macro goals.
 */
export async function updateOnboardingProfile(
  userId: string,
  update: OnboardingProfileUpdate,
): Promise<void> {
  const payload = {
    username: update.username,
    goal_calories: update.goalCalories,
    goal_protein_g: update.goalProteinG,
    goal_carbs_g: update.goalCarbsG,
    goal_unsaturated_fat_g: update.goalUnsaturatedFatG,
    goal_trans_fat_g: 0,
  };

  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);

  if (error) {
    // 23505 = unique_violation — username taken; retry without overwriting it
    if (error.code === '23505') {
      const { username: _omit, ...macrosOnly } = payload;
      const { error: retryError } = await supabase
        .from('profiles')
        .update(macrosOnly)
        .eq('id', userId);
      if (retryError) throw retryError;
    } else {
      throw error;
    }
  }
}

/** Converts a display name into a valid username slug (3-30 chars). */
export function slugifyUsername(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  const padded = slug.length >= 3 ? slug : slug.padEnd(3, '0');
  return padded.slice(0, 30);
}
