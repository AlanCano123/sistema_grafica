-- Cache compartido del catálogo (CDO + Maya) entre instancias serverless.
-- Reemplaza el cache en memoria de lib/cdo-api.ts y lib/maya-api.ts, que
-- no sobrevive entre invocaciones distintas en Vercel.
create table if not exists catalog_cache (
  key text primary key,
  data jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

-- RLS activado: nadie accede salvo con la secret key (que la salta,
-- service_role bypassea RLS por diseño de Supabase). Ningún cliente del
-- navegador va a tocar esta tabla directamente.
alter table catalog_cache enable row level security;
