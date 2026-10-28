-- Codes partenaires : un code (ex. RENOGO) donne l'accès Illimité gratuit
-- pendant un nombre de mois. Il s'entre sur le site Web (page Abonnement) ;
-- l'app lit ensuite l'abonnement comme les autres. mc gère les codes dans
-- Supabase (Table Editor) : durée, nombre d'utilisations, date limite, actif.

create table public.promo_codes (
  code text primary key check (code = upper(code) and char_length(code) between 3 and 30),
  partner text not null default '' check (char_length(partner) <= 80),
  months int not null check (months between 1 and 24),
  max_uses int check (max_uses > 0),
  valid_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.promo_redemptions (
  code text not null references public.promo_codes (code) on update cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (code, user_id)
);

-- Aucune politique : seul redeem_promo_code() (et service_role) y touche.
alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;
grant all on public.promo_codes, public.promo_redemptions to service_role;

-- Active le code pour le compte connecté et retourne la nouvelle date de fin.
-- Erreurs : CONNEXION_REQUISE, CODE_INVALIDE, CODE_EPUISE, CODE_DEJA_UTILISE, DEJA_ABONNE.
create function public.redeem_promo_code(p_code text)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  promo public.promo_codes;
  ends timestamptz;
begin
  if uid is null then
    raise exception 'CONNEXION_REQUISE';
  end if;

  select * into promo from public.promo_codes
  where code = upper(trim(p_code)) and active and (valid_until is null or valid_until > now())
  for update;
  if not found then
    raise exception 'CODE_INVALIDE';
  end if;

  if exists (select 1 from public.promo_redemptions r where r.code = promo.code and r.user_id = uid) then
    raise exception 'CODE_DEJA_UTILISE';
  end if;

  if promo.max_uses is not null
     and (select count(*) from public.promo_redemptions r where r.code = promo.code) >= promo.max_uses then
    raise exception 'CODE_EPUISE';
  end if;

  -- Un abonnement payé (App Store / Google Play) reste géré par le webhook RevenueCat.
  if exists (
    select 1 from public.subscriptions s
    where s.user_id = uid and s.is_active and coalesce(s.store, '') <> 'promo'
      and (s.expires_at is null or s.expires_at > now())
  ) then
    raise exception 'DEJA_ABONNE';
  end if;

  ends := now() + make_interval(months => promo.months);
  insert into public.promo_redemptions (code, user_id) values (promo.code, uid);
  insert into public.subscriptions (user_id, is_active, store, product_id, expires_at, updated_at)
  values (uid, true, 'promo', promo.code, ends, now())
  on conflict (user_id) do update
    set is_active = true, store = 'promo', product_id = excluded.product_id,
        expires_at = greatest(excluded.expires_at, coalesce(public.subscriptions.expires_at, excluded.expires_at)),
        updated_at = now();
  return ends;
end;
$$;

revoke execute on function public.redeem_promo_code(text) from public, anon;
grant execute on function public.redeem_promo_code(text) to authenticated, service_role;

insert into public.promo_codes (code, partner, months, max_uses)
values ('RENOGO', 'RenoGo (renogo.ca)', 6, 100);
