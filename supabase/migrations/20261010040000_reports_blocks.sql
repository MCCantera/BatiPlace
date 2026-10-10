-- Signalement et blocage (exigés par Apple, règle 1.2 sur le contenu des utilisateurs).
-- mc examine les signalements dans Supabase (table reports) et retire l'annonce ou le compte sous 24 h.

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  reason text not null check (reason in ('fraude', 'inapproprie', 'interdit', 'harcelement', 'autre')),
  details text not null default '' check (char_length(details) <= 1000),
  status text not null default 'nouveau' check (status in ('nouveau', 'traite', 'rejete')),
  created_at timestamptz not null default now(),
  check (listing_id is not null or reported_user_id is not null)
);

alter table public.reports enable row level security;
create policy "Signaler un contenu" on public.reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
grant insert (listing_id, reported_user_id, conversation_id, reason, details) on public.reports to authenticated;
grant all on public.reports to service_role;

create table public.blocks (
  blocker_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

alter table public.blocks enable row level security;
create policy "Voir ses blocages" on public.blocks for select to authenticated using (blocker_id = (select auth.uid()));
create policy "Bloquer un membre" on public.blocks for insert to authenticated with check (blocker_id = (select auth.uid()));
create policy "Débloquer un membre" on public.blocks for delete to authenticated using (blocker_id = (select auth.uid()));
grant select, delete on public.blocks to authenticated;
-- search_listings (security invoker) lit cette table : les visiteurs ne voient aucune ligne (pas de politique pour anon).
grant select on public.blocks to anon;
grant insert (blocked_id) on public.blocks to authenticated;
grant all on public.blocks to service_role;

-- Vrai si l'un des deux membres a bloqué l'autre.
create function public.is_blocked_between(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks
    where (blocker_id = a and blocked_id = b) or (blocker_id = b and blocked_id = a)
  );
$$;
revoke execute on function public.is_blocked_between(uuid, uuid) from public, anon;
grant execute on function public.is_blocked_between(uuid, uuid) to authenticated, service_role;

-- Plus de nouveaux messages ni de nouvelles conversations entre membres bloqués.
alter policy "Écrire dans ses conversations" on public.messages
  with check (
    sender_id = (select auth.uid())
    and public.is_conversation_member(conversation_id)
    and not exists (
      select 1 from public.conversations c
      where c.id = conversation_id and public.is_blocked_between(c.buyer_id, c.seller_id)
    )
  );

alter policy "Contacter un vendeur" on public.conversations
  with check (
    buyer_id = (select auth.uid())
    and seller_id = (select l.seller_id from public.listings l where l.id = listing_id and l.status = 'active')
    and not public.is_blocked_between(buyer_id, seller_id)
  );

create or replace function public.search_listings(
  lat double precision,
  lng double precision,
  radius_km double precision default 100,
  q text default null,
  categories text[] default null,
  conditions public.listing_condition[] default null,
  pro_only boolean default null,
  sort text default 'pertinence',
  page_size int default 40,
  page int default 0
)
returns table (
  id uuid,
  title text,
  price_cents int,
  price_unit text,
  spec text,
  city text,
  condition public.listing_condition,
  category_id text,
  seller_id uuid,
  seller_type public.seller_type,
  created_at timestamptz,
  boost_kind text,
  boosted boolean,
  distance_km double precision,
  photo_path text
)
language sql
stable
security invoker
set search_path = ''
as $$
  with origin as (
    select extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography as g
  ),
  words as (
    select array_agg('%' || w || '%') as patterns
    from unnest(string_to_array(extensions.unaccent(lower(trim(coalesce(q, '')))), ' ')) as w
    where w <> ''
  )
  select
    l.id, l.title, l.price_cents, l.price_unit, l.spec, l.city, l.condition, l.category_id,
    l.seller_id, p.seller_type, l.created_at, l.boost_kind,
    coalesce(l.boost_until > now(), false) as boosted,
    extensions.st_distance(l.location, o.g) / 1000.0 as distance_km,
    (select ph.path from public.listing_photos ph where ph.listing_id = l.id order by ph.position limit 1) as photo_path
  from public.listings l
  join public.profiles p on p.id = l.seller_id
  cross join origin o
  cross join words w
  where l.status = 'active'
    and extensions.st_dwithin(l.location, o.g, radius_km * 1000)
    and (categories is null or l.category_id = any (categories))
    and (conditions is null or l.condition = any (conditions))
    and (pro_only is null or (p.seller_type <> 'particulier') = pro_only)
    -- Annonces des membres que l'on a bloqués : masquées.
    and not exists (select 1 from public.blocks b where b.blocker_id = (select auth.uid()) and b.blocked_id = l.seller_id)
    and (w.patterns is null
         or extensions.unaccent(lower(l.title || ' ' || l.description || ' ' || l.spec)) like all (w.patterns))
  order by
    case when sort = 'pertinence' then coalesce(l.boost_until > now(), false) end desc nulls last,
    case when sort = 'distance' then extensions.st_distance(l.location, o.g) end asc,
    case when sort = 'prix' then l.price_cents end asc,
    l.created_at desc
  limit least(page_size, 100) offset page * least(page_size, 100);
$$;
