-- Forfait gratuit : 2 publications par mois civil (heure du Québec) au lieu de
-- 2 annonces actives. Chaque publication est inscrite dans un journal qui
-- survit à la suppression de l'annonce, pour qu'on ne puisse pas supprimer et
-- republier pour contourner la limite.

create table public.listing_publications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid,
  published_at timestamptz not null default now()
);
create index listing_publications_user_idx on public.listing_publications (user_id, published_at desc);

alter table public.listing_publications enable row level security;
create policy "Chacun voit ses publications" on public.listing_publications
  for select to authenticated using (user_id = (select auth.uid()));
grant select on public.listing_publications to authenticated;
grant all on public.listing_publications to service_role;

insert into public.listing_publications (user_id, listing_id, published_at)
select seller_id, id, created_at from public.listings;

-- Début du mois courant, heure de Montréal.
create function public.month_start()
returns timestamptz
language sql
stable
set search_path = ''
as $$
  select date_trunc('month', now() at time zone 'America/Montreal') at time zone 'America/Montreal';
$$;

create function public.publications_this_month(uid uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int from public.listing_publications p
  where p.user_id = uid and p.published_at >= public.month_start();
$$;

-- Pour l'app : nombre de publications de l'utilisateur connecté ce mois-ci.
create function public.my_publications_this_month()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select public.publications_this_month(auth.uid());
$$;

create or replace function public.enforce_listing_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT'
     and not public.has_active_subscription(new.seller_id)
     and public.publications_this_month(new.seller_id) >= 2
  then
    raise exception 'LIMITE_GRATUITE'
      using hint = 'Le forfait gratuit permet 2 annonces par mois. Abonnez-vous à Bâtiplace Illimité pour publier sans limite.';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create function public.log_listing_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.listing_publications (user_id, listing_id) values (new.seller_id, new.id);
  return new;
end;
$$;

create trigger listings_log_publication
  after insert on public.listings
  for each row execute function public.log_listing_publication();

revoke execute on function public.month_start() from public, anon;
revoke execute on function public.publications_this_month(uuid) from public, anon, authenticated;
revoke execute on function public.my_publications_this_month() from public, anon;
grant execute on function public.month_start() to authenticated;
grant execute on function public.my_publications_this_month() to authenticated;
revoke execute on function public.log_listing_publication() from public, anon, authenticated;
grant execute on function public.month_start(), public.publications_this_month(uuid), public.my_publications_this_month(), public.log_listing_publication() to service_role;
