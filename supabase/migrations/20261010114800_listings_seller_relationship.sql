-- La jointure listings -> profiles était ambiguë pour l'API (PGRST201) : favorites relie aussi
-- annonces et profils. Cette relation calculée impose le vendeur pour `seller:profiles(...)`,
-- sans changer le code de l'app déjà compilée.
create function public.profiles(public.listings)
returns setof public.profiles
rows 1
language sql
stable
security invoker
set search_path = ''
as $$
  select * from public.profiles p where p.id = $1.seller_id;
$$;
grant execute on function public.profiles(public.listings) to anon, authenticated;
notify pgrst, 'reload schema';
