-- mc a finalement gardé la règle d'origine : 2 annonces actives gratuites
-- (et non 2 par mois). On remet la fonction du schéma initial. La table
-- listing_publications reste en place mais n'est plus alimentée.
create or replace function public.enforce_listing_limit()
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
