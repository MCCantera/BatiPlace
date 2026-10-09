// Explore (home) screen, favorites, listing card, city field, shared UI and sign-in gate.
const en: Record<string, string> = {
  // Explore
  Pertinence: 'Relevance',
  'Plus proches': 'Nearest',
  'Plus récentes': 'Newest',
  'Prix croissant': 'Price: low to high',
  'Impossible de charger les annonces. Vérifiez votre connexion.': 'Couldn’t load listings. Check your connection.',
  'Le surplus des uns,': 'One crew’s surplus,',
  'le chantier des autres.': 'another crew’s job site.',
  'Achetez et vendez matériaux, outils et équipements neufs ou usagés, entre voisins, particuliers et professionnels, partout au Québec. Publication gratuite, zéro commission.':
    'Buy and sell new or used materials, tools and equipment between neighbours, individuals and professionals, anywhere in Québec. Free to post, zero commission.',
  'Rabais exclusifs chez nos partenaires': 'Exclusive discounts from our partners',
  'Vous cherchez un entrepreneur ?': 'Looking for a contractor?',
  'Trouvez un pro près de chez vous pour vos travaux.': 'Find a pro near you for your project.',
  'Ex. : je cherche de la céramique à Laval': 'E.g. I’m looking for ceramic tile in Laval',
  Rechercher: 'Search',
  'Aucune annonce ne mentionne « {words} » pour l’instant. Voici les annonces de {cats}.':
    'No listing mentions “{words}” yet. Here are listings in {cats}.',
  'Effacer la recherche': 'Clear search',
  'Tout le Québec': 'All of Québec',
  Tout: 'All',
  Particuliers: 'Individuals',
  Professionnels: 'Professionals',
  '{n} annonces': '{n} listings',
  '{n} annonce': '{n} listing',
  'Aucune annonce ne correspond': 'No matching listings',
  'Base de données pas encore branchée': 'Database not connected yet',
  'Élargissez le rayon ou retirez un filtre. Ou soyez le premier à publier ici.':
    'Widen the radius or remove a filter. Or be the first to post here.',
  'Ajoutez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_KEY dans .env.':
    'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY to .env.',
  'Publier une annonce': 'Post a listing',
  'Rechercher autour de': 'Search around',
  'Utiliser ma position': 'Use my location',
  'Grandes villes': 'Major cities',

  // Smart-search summary
  'Je cherche « {words} »': 'Looking for “{words}”',
  'Je cherche des annonces': 'Looking for listings',
  'autour de {place}': 'around {place}',
  'chez les professionnels': 'from professionals',
  'chez les particuliers': 'from individuals',
  '{price} maximum': '{price} max',

  // Listing card
  'En vedette': 'Featured',
  'Retirer des favoris': 'Remove from favorites',
  'Ajouter aux favoris': 'Add to favorites',
  Pro: 'Pro',

  // City field
  'Tapez une ville du Québec': 'Type a city in Québec',
  'Aucune ville du Québec ne correspond.': 'No Québec city matches.',
  'Choisissez une ville dans la liste.': 'Choose a city from the list.',

  // Favorites
  'Sauvegardez des annonces pour les retrouver ici, sur le Web comme dans l’application.':
    'Save listings to find them here, on the web and in the app.',
  'Aucun favori pour l’instant': 'No favorites yet',
  'Touchez le cœur d’une annonce pour la retrouver ici.': 'Tap the heart on a listing to find it here.',
  '{n} annonces sauvegardées': '{n} saved listings',
  '{n} annonce sauvegardée': '{n} saved listing',

  // Shared UI
  '{value} sur 5': '{value} out of 5',

  // Sign-in gate (RequireAuth also translates the titles and reasons its callers pass)
  'Connectez-vous pour continuer': 'Sign in to continue',
  'Se connecter ou créer un compte': 'Sign in or create an account',
  'Mon compte': 'My account',
  'Gérez vos annonces, votre profil vendeur et votre abonnement.': 'Manage your listings, seller profile and subscription.',
  'Écrivez aux vendeurs et répondez aux acheteurs, sans partager votre numéro.':
    'Message sellers and reply to buyers without sharing your phone number.',
  'La publication est gratuite. Il faut seulement un compte pour que les acheteurs puissent vous écrire.':
    'Posting is free. You just need an account so buyers can message you.',
};
export default en;
