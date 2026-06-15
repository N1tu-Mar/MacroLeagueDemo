# MacroLeague Nutrition Architecture (Phase 1)

This document describes the first version of MacroLeague's food-nutrition
architecture: the on-demand USDA lookup, the local cache, and the
natural-language "Describe your meal" flow. It is intentionally an **estimate +
user-correction** design, not a perfect parser.

## Goals

Let a user type a free-text meal (e.g. `"grilled chicken breast with broccoli"`),
get estimated macros from a trustworthy nutrition source, and **confirm/edit**
those macros before the meal is saved to `meal_logs`. The previous manual-entry
path is preserved and untouched.

## Request flow

```
Expo app
  └─ src/services/nutrition/mealEstimateService.ts  (estimateMeal)
       └─ supabase.functions.invoke('estimate-meal')      ← user JWT
            └─ supabase/functions/estimate-meal/index.ts   (service role)
                 ├─ check food_search_cache (by normalized query)
                 ├─ on miss → USDA FoodData Central /foods/search   ← USDA_FDC_API_KEY
                 ├─ map nutrients → cache foods rows + food_search_cache
                 └─ return candidates
       ← candidates (each editable)
  └─ user taps "Use & Edit" → fields populate → user edits → SAVE MEAL
       └─ logMeal(... source: 'user_estimate', sourceFoodId, fat breakdown ...)
            └─ meal_logs row (snapshot, user_confirmed_at set)
```

The Expo client **never** calls USDA directly and never reads the cache tables
directly. Everything external goes through the edge function.

## Why USDA FoodData Central is foundational

- **Public domain.** FDC data is a U.S. Government work, so we can cache and
  redisplay it without license friction.
- **Breadth + quality.** Foundation, SR Legacy, and Survey (FNDDS) cover whole
  foods and common prepared dishes with per-100g nutrient detail, including the
  separate fat types (saturated / trans / mono / poly) the app now tracks.
- **Stable identifiers.** Each food has an `fdcId`, so we cache each source food
  exactly once (`foods.external_id` + the `foods_source_external_id` unique
  index).

## Why Open Food Facts is deferred

Open Food Facts is best for **packaged/barcoded** products (brand SKUs, scanned
labels). That is a later milestone (barcode scanning) and a different data
shape. The schema already supports it: add a `nutrition_sources` row with key
`open_food_facts` and reuse the same `foods` / `food_search_cache` tables. No
migration change is required to start using it.

## Why user-confirmed foods are cached

- **Cost + rate limits.** USDA issues per-key rate limits. Caching search
  responses (`food_search_cache`, 7-day TTL) and the mapped foods (`foods`)
  means repeat lookups for the same query skip the external API entirely.
- **Stable references.** A cached `foods` row gives each estimate a durable
  `foodId` that a meal log can point at via `meal_logs.source_food_id`.
- **History integrity.** `meal_logs` still snapshots the macro values at insert
  time (existing behavior), so re-mapping or re-caching a food never rewrites a
  user's logged history.

## Limitations of USDA for natural-language composite meals

USDA search matches **single foods**, not composite dishes. For
`"pizza with pineapples and ham"`:

- The search returns whole-food / dish candidates that match the keywords
  (e.g. a "Hawaiian pizza" entry, or "pizza, cheese"), ranked by USDA relevance.
- It does **not** decompose the sentence into pizza + pineapple + ham and sum
  them. The user picks the closest candidate and edits the macros.

Queries that map well today: single foods and simple dishes —
`"grilled chicken breast"`, `"kraft macaroni and cheese"`, `"margherita pizza"`.
Queries that stay approximate: multi-ingredient plates —
`"steak and broccoli, celery, carrots, mashed potatoes"`,
`"2 eggs and toast"` (quantities are not parsed yet).

Documented next steps for better composite handling (not built in Phase 1):

- Ingredient decomposition (split the text, search each ingredient, sum).
- OpenAI-assisted parsing inside the edge function (key stays server-side).
- A Nutritionix-style natural-language nutrition API.
- Custom campus/dining-hall foods.

## Where API keys live

- `USDA_FDC_API_KEY` is a **Supabase function secret**, read via
  `Deno.env.get('USDA_FDC_API_KEY')` inside the edge function only. It is never
  imported into `src/` and never shipped in the Expo bundle.
- `SUPABASE_SERVICE_ROLE_KEY` is auto-injected into the edge runtime and used
  only server-side to write the cache / foods rows (bypassing RLS).
- The Expo app only holds the public `EXPO_PUBLIC_SUPABASE_URL` and anon key.

## Data model (migration `0003_nutrition_architecture.sql`)

All changes are additive and backwards-compatible.

| Object | Purpose |
| --- | --- |
| `nutrition_sources` | Reference list of sources. Seeded: `usda_fdc`, `manual`, `user_estimate`. |
| `foods` (expanded) | Adds `source_id`, `external_id`, `brand_name`, `data_type`, serving info, `*_per_100g` nutrients, `raw_payload` JSONB, `cached_at`. Original not-null macro columns kept = manual path unchanged. |
| `food_portions` | Household serving sizes (USDA foodPortions) for future per-portion scaling. |
| `food_search_cache` | Raw provider search responses keyed by normalized query, with `expires_at`. Server-only (no client RLS policy). |
| `meal_logs` (expanded) | Adds `source`, `source_food_id`, `confidence`, `saturated_fat_g`, `trans_fat_g`, `unsaturated_fat_g`, `fiber_g`, `sodium_mg`, `user_confirmed_at`. Existing total `fat_g` preserved. |

### RLS summary

- `nutrition_sources`, `food_portions`: public **read**, writes only via service role.
- `food_search_cache`: **no** client policy — only the edge function (service role) touches it.
- `foods`: existing read-all / insert-own policies kept; USDA rows are inserted by the service role with `created_by = null`.

## Changed / added files

- `supabase/migrations/0003_nutrition_architecture.sql` — schema (additive).
- `supabase/functions/estimate-meal/index.ts` — edge function handler.
- `supabase/functions/estimate-meal/usda.ts` — USDA search + nutrient mapping.
- `supabase/functions/_shared/cors.ts` — CORS headers.
- `supabase/config.toml` — `[functions.estimate-meal]` with `verify_jwt = true`.
- `src/services/nutrition/types.ts` — shared estimate/candidate types.
- `src/services/nutrition/mealEstimateService.ts` — client entry point (invokes the function; never calls USDA).
- `src/services/mealLogService.ts` — `logMeal` now optionally carries source + fat-type provenance (`MealEstimateMeta`).
- `src/hooks/useMealEstimate.ts` — estimate state hook.
- `src/hooks/useMealLogger.ts` — `applyEstimate()` populates editable fields and carries provenance to save.
- `src/screens/main/MealLoggerScreen.tsx` — "Manual / Describe" mode toggle and candidate UI.
- `tsconfig.json` — excludes `supabase/functions` (Deno) from the app type-check.

## Required Supabase setup (after merging the code)

These steps are done in the Supabase dashboard / CLI; they cannot be done from
the app:

1. **Apply the migration:**
   ```sh
   npx supabase db push
   ```
2. **Get a USDA FoodData Central API key** (free):
   https://fdc.nal.usda.gov/api-key-signup.html
3. **Set the key as a function secret:**
   ```sh
   npx supabase secrets set USDA_FDC_API_KEY=your_key_here
   ```
4. **Deploy the edge function:**
   ```sh
   npx supabase functions deploy estimate-meal
   ```
   `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically by
   the edge runtime — do **not** add them manually.

## Verification

- `npx tsc --noEmit` passes (the Deno function is excluded from the app config).
- Once deployed, exercise via the Describe tab with:
  `"grilled chicken breast"`, `"kraft macaroni and cheese"`, `"2 eggs and toast"`,
  `"pizza with pineapple and ham"`. Expect good single-food matches and
  approximate composite matches that the user edits before saving.

## What works vs. what remains approximate

**Works now:** on-demand USDA search, 7-day result caching, per-100g→serving
nutrient mapping incl. derived unsaturated fat, candidate confidence,
server-side key isolation, confirm-and-edit before save, separate fat-type +
fiber/sodium capture on the meal log.

**Approximate / future:** quantity parsing ("2 eggs"), composite-meal
decomposition, branded/barcode (Open Food Facts), and richer portion selection
via `food_portions`.
