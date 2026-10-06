# Bâtiplace

Le marketplace de la construction au Québec. Achetez et vendez matériaux, outils et équipements neufs ou usagés, entre voisins, particuliers et professionnels. Publication gratuite, zéro commission.

Une seule base de code pour le site Web et l'application iPhone (Android ensuite).

## Pile technique

- **Expo (React Native) + Expo Router** : application iOS, Android et site Web (`src/app`).
- **Supabase** : comptes, base Postgres + PostGIS (recherche par distance), photos (Storage), messagerie en temps réel. Schéma : `supabase/migrations`.
- **RevenueCat** : abonnement Bâtiplace Illimité (14,99 $/mois) via l'App Store et Google Play. Le webhook `supabase/functions/revenuecat-webhook` tient la table `subscriptions` à jour, ce qui débloque aussi le site Web pour le même compte.

## Règles d'affaires

- Forfait gratuit : 5 annonces actives (appliqué par la base, trigger `enforce_listing_limit`).
- Bâtiplace Illimité : annonces illimitées, 14,99 $/mois, acheté dans l'application.
- Aucune commission sur les ventes.

## Démarrer

```bash
npm install
cp .env.example .env   # remplir l'URL et la clé publique Supabase
npm run web            # site Web
npm run ios            # nécessite un build de développement (RevenueCat utilise du code natif)
```

Vérifications : `npm run typecheck` et `npm run build:web`.

## Base de données

```bash
supabase link --project-ref gvzroqbummpzgvzubazq
supabase db push
supabase functions deploy delete-account
supabase functions deploy revenuecat-webhook --no-verify-jwt
supabase secrets set REVENUECAT_WEBHOOK_SECRET=<valeur>
```

## Site Web (Vercel)

Importer le dépôt dans Vercel : la configuration est dans `vercel.json` (build `expo export`, sortie `dist`). Ajouter `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_KEY` dans les variables d'environnement si `.env` n'est pas utilisé. Chaque push sur `main` redéploie le site.

Dans Supabase > Authentication > URL Configuration, mettre l'adresse du site comme Site URL pour que les liens de confirmation de courriel pointent au bon endroit.

## Publication iOS

Avec EAS : `npx eas-cli@latest build --platform ios` puis `npx eas-cli@latest submit --platform ios`. Nécessite un compte Apple Developer et l'abonnement configuré dans App Store Connect (produit mensuel lié à l'entitlement `illimite` dans RevenueCat).
