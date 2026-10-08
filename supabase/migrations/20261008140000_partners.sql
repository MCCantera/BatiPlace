-- Partenaires : marchands qui offrent un rabais exclusif aux abonnés
-- Bâtiplace Illimité et LOKA. mc les ajoute dans Supabase (Table Editor).
-- Le code promo, s'il y en a un, n'est remis qu'aux abonnés Bâtiplace actifs.

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  offer text not null check (char_length(offer) between 2 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  category text not null default '' check (char_length(category) <= 60),
  city text not null default '' check (char_length(city) <= 80),
  address text not null default '' check (char_length(address) <= 200),
  website text not null default '' check (char_length(website) <= 300),
  logo_url text not null default '' check (char_length(logo_url) <= 500),
  promo_code text not null default '' check (char_length(promo_code) <= 60),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.partners enable row level security;
create policy "Partenaires actifs visibles par tous" on public.partners
  for select to anon, authenticated using (active);

-- Tout sauf promo_code est lisible par le public.
grant select (id, name, offer, description, category, city, address, website, logo_url, active, sort_order, created_at)
  on public.partners to anon, authenticated;
grant all on public.partners to service_role;

create function public.partner_promo_code(partner uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select p.promo_code from public.partners p
  where p.id = partner and p.active and public.has_active_subscription(auth.uid());
$$;

revoke execute on function public.partner_promo_code(uuid) from public, anon;
grant execute on function public.partner_promo_code(uuid) to authenticated, service_role;
