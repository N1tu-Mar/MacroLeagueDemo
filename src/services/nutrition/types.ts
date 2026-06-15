// Shared types for the natural-language meal estimate flow.
// These mirror the response shape of the `estimate-meal` edge function.

export type NutritionSourceKey = 'usda_fdc' | 'manual' | 'user_estimate';

/** A bundle of macros for a specific amount of food. */
export interface MacroBundle {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  saturatedFatG: number | null;
  transFatG: number | null;
  unsaturatedFatG: number | null;
  fiberG: number | null;
  sodiumMg: number | null;
}

/** One candidate match the user can confirm/edit before logging. */
export interface MealEstimateCandidate {
  source: 'usda_fdc';
  externalId: string;
  /** Our cached `foods.id`, if the candidate was persisted server-side. */
  foodId: string | null;
  name: string;
  brandName: string | null;
  dataType: string | null;
  servingDescription: string;
  servingGramWeight: number;
  /** Source-mapping confidence, 0-1. Estimates only — the user edits before saving. */
  confidence: number;
  /** Macros for `servingDescription`. */
  serving: MacroBundle;
  /** Macros per 100 g, so the client can re-scale on quantity edits. */
  per100g: MacroBundle;
}

export interface MealEstimateResponse {
  query: string;
  normalizedQuery: string;
  source: 'usda_fdc';
  cached: boolean;
  candidates: MealEstimateCandidate[];
}
