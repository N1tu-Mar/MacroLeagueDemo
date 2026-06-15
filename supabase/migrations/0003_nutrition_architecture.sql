-- Phase 1 nutrition architecture.
--
-- This migration is purely additive so it stays backwards-compatible with the
-- existing manual logging path:
--   * `foods` gains nutrition-source / per-100g columns but keeps its original
--     not-null macro columns, so existing rows and manual inserts are unaffected.
--   * `meal_logs` gains separate fat types + provenance columns, all nullable,
--     so existing logs and the manual save path keep working unchanged.
--   * New tables (`nutrition_sources`, `food_portions`, `food_search_cache`)
--     back the on-demand USDA lookup + cache flow.
--
-- USDA FoodData Central (`usda_fdc`) is the foundational source. We do NOT bulk
-- import USDA here; the `estimate-meal` edge function queries USDA on demand and
-- caches results into `foods` + `food_search_cache`.

-- ---------------------------------------------------------------------------
-- 1. Nutrition sources (reference data: usda_fdc, manual, user_estimate, ...)
-- ---------------------------------------------------------------------------
create table public.nutrition_sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  attribution text,
  license text,
  base_url text,
  created_at timestamptz not null default now(),
  constraint nutrition_sources_key_format check (key ~ '^[a-z0-9_]{2,40}$')
);

comment on table public.nutrition_sources is
  'Reference list of where a food''s nutrition data originates. Seeded with usda_fdc as the foundational source; manual and user_estimate cover app-local foods.';

insert into public.nutrition_sources (key, name, attribution, license, base_url) values
  (
    'usda_fdc',
    'USDA FoodData Central',
    'U.S. Department of Agriculture, Agricultural Research Service, FoodData Central',
    'Public Domain (U.S. Government work)',
    'https://api.nal.usda.gov/fdc/v1'
  ),
  (
    'manual',
    'Manually entered',
    'User-entered food',
    null,
    null
  ),
  (
    'user_estimate',
    'User-confirmed estimate',
    'Estimate confirmed/edited by the user before logging',
    null,
    null
  );

-- ---------------------------------------------------------------------------
-- 2. Expand `foods` with nutrition-source provenance + per-100g nutrients.
--    All new columns are nullable so the existing not-null macro columns and
--    the manual insert path remain valid.
-- ---------------------------------------------------------------------------
alter table public.foods
  add column source_id uuid references public.nutrition_sources(id) on delete set null,
  add column external_id text,
  add column brand_name text,
  add column data_type text,
  add column serving_size numeric(8,2),
  add column serving_unit text,
  add column calories_per_100g numeric(7,1),
  add column protein_g_per_100g numeric(6,1),
  add column carbs_g_per_100g numeric(6,1),
  add column fat_g_per_100g numeric(6,1),
  add column saturated_fat_g_per_100g numeric(6,1),
  add column trans_fat_g_per_100g numeric(6,1),
  add column unsaturated_fat_g_per_100g numeric(6,1),
  add column fiber_g_per_100g numeric(6,1),
  add column sodium_mg_per_100g numeric(8,1),
  add column raw_nutrients jsonb,
  add column raw_payload jsonb,
  add column cached_at timestamptz,
  add column updated_at timestamptz not null default now();

comment on column public.foods.source_id is
  'Which nutrition_sources row this food came from. NULL is treated as a legacy/manual food.';
comment on column public.foods.external_id is
  'Provider-native identifier (e.g. USDA FDC id) so the same source food is cached once, not duplicated.';
comment on column public.foods.raw_payload is
  'Untouched provider response kept for future re-mapping without re-querying the provider.';

-- One cached row per (source, external_id). Manual foods (no external_id) are
-- excluded from the constraint so they can be created freely.
create unique index foods_source_external_id
  on public.foods (source_id, external_id)
  where external_id is not null;

create index foods_name_lower
  on public.foods (lower(name));

-- ---------------------------------------------------------------------------
-- 3. Food portions (household measures, e.g. USDA foodPortions: "1 slice" = 107g)
-- ---------------------------------------------------------------------------
create table public.food_portions (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.foods(id) on delete cascade,
  label text not null,
  amount numeric(8,2),
  unit text,
  gram_weight numeric(8,2) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  constraint food_portions_gram_weight_positive check (gram_weight > 0)
);

create index food_portions_food_id on public.food_portions (food_id);

comment on table public.food_portions is
  'Household serving sizes for a food so estimates can scale per-100g nutrients to a realistic portion.';

-- ---------------------------------------------------------------------------
-- 4. Search cache (raw provider search responses, keyed by normalized query)
-- ---------------------------------------------------------------------------
create table public.food_search_cache (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.nutrition_sources(id) on delete cascade,
  normalized_query text not null,
  raw_query text not null,
  results jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint food_search_cache_norm_length check (char_length(normalized_query) between 1 and 200)
);

create unique index food_search_cache_source_query
  on public.food_search_cache (source_id, normalized_query);

create index food_search_cache_expires_at
  on public.food_search_cache (expires_at);

comment on table public.food_search_cache is
  'Caches USDA/provider search responses by normalized query so repeat lookups skip the external API until expires_at.';

-- ---------------------------------------------------------------------------
-- 5. Extend `meal_logs` for separate fat types + estimate provenance.
--    Existing total `fat_g` is preserved; saturated/trans/unsaturated are added
--    alongside it. All new columns are nullable for backwards compatibility.
-- ---------------------------------------------------------------------------
alter table public.meal_logs
  add column source text,
  add column source_food_id uuid references public.foods(id) on delete set null,
  add column confidence numeric(4,3),
  add column saturated_fat_g numeric(6,1),
  add column trans_fat_g numeric(6,1),
  add column unsaturated_fat_g numeric(6,1),
  add column fiber_g numeric(6,1),
  add column sodium_mg numeric(8,1),
  add column user_confirmed_at timestamptz,
  add constraint meal_logs_confidence_range
    check (confidence is null or (confidence >= 0 and confidence <= 1)),
  add constraint meal_logs_saturated_fat_nonnegative
    check (saturated_fat_g is null or saturated_fat_g >= 0),
  add constraint meal_logs_trans_fat_nonnegative
    check (trans_fat_g is null or trans_fat_g >= 0),
  add constraint meal_logs_unsaturated_fat_nonnegative
    check (unsaturated_fat_g is null or unsaturated_fat_g >= 0),
  add constraint meal_logs_fiber_nonnegative
    check (fiber_g is null or fiber_g >= 0),
  add constraint meal_logs_sodium_nonnegative
    check (sodium_mg is null or sodium_mg >= 0);

comment on column public.meal_logs.source is
  'Where the logged macros came from: manual, usda_fdc, or user_estimate. NULL = legacy manual log.';
comment on column public.meal_logs.source_food_id is
  'Optional pointer to the cached foods row the estimate was derived from. Separate from food_id so the existing one_food_reference constraint is unaffected.';
comment on column public.meal_logs.confidence is
  'Estimate confidence 0-1 from the source mapping; NULL for manual entries the user typed directly.';

-- ---------------------------------------------------------------------------
-- 6. Row Level Security for the new tables.
-- ---------------------------------------------------------------------------
alter table public.nutrition_sources enable row level security;
alter table public.food_portions enable row level security;
alter table public.food_search_cache enable row level security;

-- nutrition_sources: public read-only reference data. Writes only via the
-- service role (seed / edge function), which bypasses RLS.
create policy "read nutrition sources"
  on public.nutrition_sources
  for select
  using (true);

-- food_portions: readable by everyone like foods; writes only via service role.
create policy "read food portions"
  on public.food_portions
  for select
  using (true);

-- food_search_cache: deliberately has NO client policy. Clients must go through
-- the estimate-meal edge function (service role) and never read the raw cache
-- directly, so RLS denies anon/authenticated by default.
comment on table public.food_search_cache is
  'Server-managed cache. RLS intentionally grants no client policy; only the service role (estimate-meal edge function) reads/writes it.';
