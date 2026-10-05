-- Bâtiplace : schéma initial
-- Annonces géolocalisées, profils vendeurs, favoris, messagerie, évaluations,
-- abonnement (2 annonces actives gratuites, illimité avec l'abonnement).

create extension if not exists postgis with schema extensions;
create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.seller_type as enum ('particulier', 'entrepreneur', 'fournisseur', 'entreprise');
create type public.listing_condition as enum ('neuf', 'usage', 'surplus');
create type public.listing_status as enum ('active', 'vendue', 'retiree');

-- ---------------------------------------------------------------------------
-- Catégories
-- ---------------------------------------------------------------------------
create table public.categories (
  id text primary key,
  name text not null,
  position int not null
);

insert into public.categories (id, name, position) values
  ('materiaux', 'Matériaux', 1),
  ('surplus', 'Surplus de chantier', 2),
  ('outils', 'Outils', 3),
  ('equipements', 'Équipements', 4),
  ('machinerie', 'Machinerie', 5),
  ('plomberie', 'Plomberie', 6),
  ('electricite', 'Électricité', 7),
  ('portes-fenetres', 'Portes et fenêtres', 8),
  ('bois', 'Bois', 9),
  ('revetements', 'Revêtements', 10);

-- ---------------------------------------------------------------------------
-- Profils (un par compte, créé automatiquement)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  seller_type public.seller_type not null default 'particulier',
  city text check (char_length(city) <= 80),
  rbq_license text check (char_length(rbq_license) <= 20),
  rbq_verified boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Abonnements (écrits uniquement par le webhook RevenueCat, rôle service)
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  is_active boolean not null default false,
  store text,
  product_id text,
  expires_at timestamptz,
  updated_at timestamptz not null default now()
);

create function public.has_active_subscription(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = uid
      and s.is_active
      and (s.expires_at is null or s.expires_at > now())
  );
$$;

-- ---------------------------------------------------------------------------
-- Annonces
-- ---------------------------------------------------------------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text not null default '' check (char_length(description) <= 4000),
  category_id text not null references public.categories (id),
  condition public.listing_condition not null,
  price_cents int not null check (price_cents >= 0),
  price_unit text not null default '' check (char_length(price_unit) <= 20),
  quantity text not null default '1' check (char_length(quantity) <= 40),
  spec text not null default '' check (char_length(spec) <= 80),
  city text not null check (char_length(city) <= 80),
  location extensions.geography(point, 4326) not null,
  status public.listing_status not null default 'active',
  boost_kind text,
  boost_until timestamptz,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_location_idx on public.listings using gist (location);
create index listings_active_idx on public.listings (status, created_at desc);
create index listings_seller_idx on public.listings (seller_id);

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  path text not null,
  position int not null default 0
);
create index listing_photos_listing_idx on public.listing_photos (listing_id, position);

-- Forfait gratuit : 2 annonces actives. Illimité avec l'abonnement.
create function public.enforce_listing_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active'
     and (tg_op = 'INSERT' or old.status <> 'active')
     and not public.has_active_subscription(new.seller_id)
     and (select count(*) from public.listings l
          where l.seller_id = new.seller_id and l.status = 'active' and l.id <> new.id) >= 2
  then
    raise exception 'LIMITE_GRATUITE'
      using hint = 'Le forfait gratuit permet 2 annonces actives. Abonnez-vous à Bâtiplace Illimité pour publier sans limite.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger listings_enforce_limit
  before insert or update on public.listings
  for each row execute function public.enforce_listing_limit();

create function public.increment_listing_view(listing uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.listings set views = views + 1 where id = listing and status = 'active';
$$;

-- ---------------------------------------------------------------------------
-- Favoris
-- ---------------------------------------------------------------------------
create table public.favorites (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ---------------------------------------------------------------------------
-- Messagerie
-- ---------------------------------------------------------------------------
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);
create index conversations_buyer_idx on public.conversations (buyer_id, last_message_at desc);
create index conversations_seller_idx on public.conversations (seller_id, last_message_at desc);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);

create function public.is_conversation_member(conv uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = conv and auth.uid() in (c.buyer_id, c.seller_id)
  );
$$;

create function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.touch_conversation();

-- ---------------------------------------------------------------------------
-- Évaluations (seulement après avoir échangé avec le vendeur)
-- ---------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  author_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null default '' check (char_length(body) <= 1000),
  created_at timestamptz not null default now(),
  unique (seller_id, author_id),
  check (seller_id <> author_id)
);

create view public.seller_ratings
with (security_invoker = true)
as
  select seller_id, round(avg(rating)::numeric, 1) as average, count(*)::int as count
  from public.reviews
  group by seller_id;

-- ---------------------------------------------------------------------------
-- Recherche par distance
-- ---------------------------------------------------------------------------
create function public.search_listings(
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
    and (w.patterns is null
         or extensions.unaccent(lower(l.title || ' ' || l.description || ' ' || l.spec)) like all (w.patterns))
  order by
    case when sort = 'pertinence' then coalesce(l.boost_until > now(), false) end desc nulls last,
    case when sort = 'distance' then extensions.st_distance(l.location, o.g) end asc,
    case when sort = 'prix' then l.price_cents end asc,
    l.created_at desc
  limit least(page_size, 100) offset page * least(page_size, 100);
$$;

-- ---------------------------------------------------------------------------
-- Sécurité : RLS et droits par colonne
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;

create policy "Catégories visibles par tous" on public.categories for select using (true);

create policy "Profils visibles par tous" on public.profiles for select using (true);
create policy "Modifier son profil" on public.profiles for update
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from anon, authenticated;
grant update (display_name, seller_type, city, rbq_license, avatar_url) on public.profiles to authenticated;

create policy "Voir son abonnement" on public.subscriptions for select using (user_id = (select auth.uid()));

create policy "Annonces actives visibles par tous, les siennes toujours" on public.listings for select
  using (status = 'active' or seller_id = (select auth.uid()));
create policy "Publier ses annonces" on public.listings for insert to authenticated
  with check (seller_id = (select auth.uid()));
create policy "Modifier ses annonces" on public.listings for update to authenticated
  using (seller_id = (select auth.uid())) with check (seller_id = (select auth.uid()));
create policy "Supprimer ses annonces" on public.listings for delete to authenticated
  using (seller_id = (select auth.uid()));
-- Les boosts et les vues ne sont modifiables que côté serveur.
revoke insert, update on public.listings from anon, authenticated;
grant insert (title, description, category_id, condition, price_cents, price_unit, quantity, spec, city, location, status)
  on public.listings to authenticated;
grant update (title, description, category_id, condition, price_cents, price_unit, quantity, spec, city, location, status)
  on public.listings to authenticated;

create policy "Photos des annonces visibles" on public.listing_photos for select
  using (exists (select 1 from public.listings l where l.id = listing_id));
create policy "Ajouter des photos à ses annonces" on public.listing_photos for insert to authenticated
  with check (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = (select auth.uid())));
create policy "Retirer des photos de ses annonces" on public.listing_photos for delete to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and l.seller_id = (select auth.uid())));

create policy "Voir ses favoris" on public.favorites for select to authenticated using (user_id = (select auth.uid()));
create policy "Ajouter un favori" on public.favorites for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Retirer un favori" on public.favorites for delete to authenticated using (user_id = (select auth.uid()));

create policy "Voir ses conversations" on public.conversations for select to authenticated
  using ((select auth.uid()) in (buyer_id, seller_id));
create policy "Contacter un vendeur" on public.conversations for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and seller_id = (select l.seller_id from public.listings l where l.id = listing_id and l.status = 'active')
  );

create policy "Lire les messages de ses conversations" on public.messages for select to authenticated
  using (public.is_conversation_member(conversation_id));
create policy "Écrire dans ses conversations" on public.messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.is_conversation_member(conversation_id));
create policy "Marquer comme lu" on public.messages for update to authenticated
  using (public.is_conversation_member(conversation_id) and sender_id <> (select auth.uid()));
revoke update on public.messages from anon, authenticated;
grant update (read_at) on public.messages to authenticated;

create policy "Évaluations visibles par tous" on public.reviews for select using (true);
create policy "Évaluer un vendeur contacté" on public.reviews for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.conversations c
      where c.seller_id = reviews.seller_id and c.buyer_id = (select auth.uid())
    )
  );
create policy "Modifier son évaluation" on public.reviews for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "Supprimer son évaluation" on public.reviews for delete to authenticated
  using (author_id = (select auth.uid()));

revoke execute on function public.has_active_subscription(uuid) from anon;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.enforce_listing_limit() from anon, authenticated, public;
revoke execute on function public.touch_conversation() from anon, authenticated, public;

-- ---------------------------------------------------------------------------
-- Photos (Storage) : lecture publique, écriture dans son propre dossier
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

create policy "Téléverser ses photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Supprimer ses photos" on storage.objects for delete to authenticated
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ---------------------------------------------------------------------------
-- Temps réel pour la messagerie
-- ---------------------------------------------------------------------------
alter publication supabase_realtime add table public.messages;
