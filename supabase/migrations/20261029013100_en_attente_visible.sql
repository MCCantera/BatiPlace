-- Une annonce en attente de retrait reste consultable par lien (avec son badge),
-- mais sort de la recherche, ne compte pas dans la limite gratuite et n'accepte plus de nouvelles conversations.
alter policy "Annonces actives visibles par tous, les siennes toujours" on public.listings
  using (status in ('active', 'en_attente') or seller_id = (select auth.uid()));
