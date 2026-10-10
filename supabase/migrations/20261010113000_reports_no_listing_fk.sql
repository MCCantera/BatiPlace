-- Les clés étrangères reports -> listings et reports -> conversations rendaient ambiguë
-- la jointure listings -> profiles de l'API (erreur PGRST201 : fiche d'annonce introuvable).
-- Les signalements gardent l'identifiant de l'annonce, sans contrainte.
alter table public.reports drop constraint reports_listing_id_fkey, drop constraint reports_conversation_id_fkey;
notify pgrst, 'reload schema';
