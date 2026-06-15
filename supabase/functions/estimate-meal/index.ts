// `estimate-meal` edge function.
//
// Flow (see Databaseprompt.md section 4):
//   Expo app -> estimate-meal -> USDA FoodData Central -> Supabase cache -> app
//
// The USDA API key lives ONLY here as a function secret. The Expo client invokes
// this function with the user's JWT and never touches USDA or the cache tables.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { corsHeaders } from '../_shared/cors.ts';
import { normalizeQuery, searchUsda, type UsdaCandidate } from './usda.ts';

const CACHE_TTL_DAYS = 7;
const DEFAULT_PAGE_SIZE = 6;
const MAX_PAGE_SIZE = 10;

interface EstimateCandidate extends Omit<UsdaCandidate, 'rawPayload'> {
  foodId: string | null;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const usdaApiKey = Deno.env.get('USDA_FDC_API_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Server is missing Supabase configuration.' }, 500);
  }
  if (!usdaApiKey) {
    return json({ error: 'Server is missing USDA_FDC_API_KEY.' }, 500);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Require an authenticated caller — users may only reach USDA through this gate.
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return json({ error: 'Not authenticated.' }, 401);
  }

  let payload: { query?: unknown; pageSize?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const rawQuery = typeof payload.query === 'string' ? payload.query : '';
  const normalized = normalizeQuery(rawQuery);
  if (normalized.length < 2) {
    return json({ error: 'Please describe your meal in at least 2 characters.' }, 400);
  }

  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(payload.pageSize) || DEFAULT_PAGE_SIZE),
  );

  // Resolve the usda_fdc source row.
  const { data: source, error: sourceError } = await admin
    .from('nutrition_sources')
    .select('id')
    .eq('key', 'usda_fdc')
    .single();

  if (sourceError || !source) {
    return json({ error: 'usda_fdc nutrition source is not configured.' }, 500);
  }
  const sourceId = source.id as string;

  // 1. Cache hit?
  const { data: cached } = await admin
    .from('food_search_cache')
    .select('results, expires_at')
    .eq('source_id', sourceId)
    .eq('normalized_query', normalized)
    .maybeSingle();

  if (cached && new Date(cached.expires_at).getTime() > Date.now()) {
    return json({
      query: rawQuery,
      normalizedQuery: normalized,
      source: 'usda_fdc',
      cached: true,
      candidates: cached.results as EstimateCandidate[],
    });
  }

  // 2. Query USDA on demand.
  let usdaCandidates: UsdaCandidate[];
  try {
    usdaCandidates = await searchUsda(usdaApiKey, normalized, pageSize);
  } catch (err) {
    return json({ error: (err as Error).message }, 502);
  }

  // 3. Cache each candidate food into `foods` (once per source+external_id).
  const externalIds = usdaCandidates.map((c) => c.externalId);
  const idByExternal = new Map<string, string>();

  if (externalIds.length > 0) {
    const { data: existing } = await admin
      .from('foods')
      .select('id, external_id')
      .eq('source_id', sourceId)
      .in('external_id', externalIds);

    for (const row of existing ?? []) {
      idByExternal.set(row.external_id as string, row.id as string);
    }

    const missing = usdaCandidates.filter((c) => !idByExternal.has(c.externalId));
    if (missing.length > 0) {
      const now = new Date().toISOString();
      const rows = missing.map((c) => ({
        source_id: sourceId,
        external_id: c.externalId,
        created_by: null,
        // foods.name has a 1-120 char check; USDA descriptions can be longer.
        name: c.name.slice(0, 120),
        brand_name: c.brandName,
        data_type: c.dataType,
        serving_desc: c.servingDescription,
        serving_size: c.servingGramWeight,
        serving_unit: 'g',
        // Legacy not-null columns hold the per-serving snapshot.
        calories: c.serving.calories,
        protein_g: c.serving.proteinG,
        carbs_g: c.serving.carbsG,
        fat_g: c.serving.fatG,
        calories_per_100g: c.per100g.calories,
        protein_g_per_100g: c.per100g.proteinG,
        carbs_g_per_100g: c.per100g.carbsG,
        fat_g_per_100g: c.per100g.fatG,
        saturated_fat_g_per_100g: c.per100g.saturatedFatG,
        trans_fat_g_per_100g: c.per100g.transFatG,
        unsaturated_fat_g_per_100g: c.per100g.unsaturatedFatG,
        fiber_g_per_100g: c.per100g.fiberG,
        sodium_mg_per_100g: c.per100g.sodiumMg,
        raw_payload: c.rawPayload,
        cached_at: now,
        updated_at: now,
      }));

      const { data: inserted } = await admin
        .from('foods')
        .insert(rows)
        .select('id, external_id');

      for (const row of inserted ?? []) {
        idByExternal.set(row.external_id as string, row.id as string);
      }
    }
  }

  const candidates: EstimateCandidate[] = usdaCandidates.map((c) => ({
    source: c.source,
    externalId: c.externalId,
    foodId: idByExternal.get(c.externalId) ?? null,
    name: c.name,
    brandName: c.brandName,
    dataType: c.dataType,
    servingDescription: c.servingDescription,
    servingGramWeight: c.servingGramWeight,
    confidence: c.confidence,
    serving: c.serving,
    per100g: c.per100g,
  }));

  // 4. Write/refresh the search cache.
  const expiresAt = new Date(Date.now() + CACHE_TTL_DAYS * 86_400_000).toISOString();
  await admin
    .from('food_search_cache')
    .upsert(
      {
        source_id: sourceId,
        normalized_query: normalized,
        raw_query: rawQuery,
        results: candidates,
        expires_at: expiresAt,
      },
      { onConflict: 'source_id,normalized_query' },
    );

  return json({
    query: rawQuery,
    normalizedQuery: normalized,
    source: 'usda_fdc',
    cached: false,
    candidates,
  });
});
