-- Inscrire la publication dans le même déclencheur BEFORE : un déclencheur
-- AFTER ne s'exécute qu'à la fin de l'instruction, ce qui laisserait passer
-- une insertion de plusieurs annonces d'un coup.
-- L'ancien déclencheur AFTER devient sans effet.
create or replace function public.log_listing_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  return new;
end;
$$;

create or replace function public.enforce_listing_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if not public.has_active_subscription(new.seller_id)
       and public.publications_this_month(new.seller_id) >= 2
    then
      raise exception 'LIMITE_GRATUITE'
        using hint = 'Le forfait gratuit permet 2 annonces par mois. Abonnez-vous à Bâtiplace Illimité pour publier sans limite.';
    end if;
    insert into public.listing_publications (user_id, listing_id) values (new.seller_id, new.id);
  end if;
  new.updated_at := now();
  return new;
end;
$$;
