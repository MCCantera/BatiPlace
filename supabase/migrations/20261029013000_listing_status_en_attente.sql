-- Nouveau statut « En attente de retrait » : l'article est réservé, l'acheteur doit venir le chercher.
-- (Ajout de la valeur seul : elle ne peut pas être utilisée dans la même transaction.)
alter type public.listing_status add value if not exists 'en_attente' after 'active';
