/** Page title, description and indexing hints for search engines. Only meaningful on the web (see seo.web.ts). */
export type Seo = {
  /** Page title, without the « · Bâtiplace » suffix. Omit for the home page. */
  title?: string;
  description?: string;
  /** Canonical path, e.g. `/annonce/123`. Omit to leave the canonical URL out. */
  path?: string;
  image?: string | null;
  /** Keep private or personal pages (messages, compte…) out of Google. */
  noindex?: boolean;
  /** Data still loading: leave the current tags alone (on /annonce they come pre-filled from api/annonce.js). */
  pending?: boolean;
  /** schema.org structured data for this page. */
  jsonLd?: Record<string, unknown> | null;
};

export const SITE_URL = 'https://www.batiplace.ca';
export const SITE_NAME = 'Bâtiplace';
export const DEFAULT_DESCRIPTION =
  'Le marketplace de la construction au Québec. Achetez et vendez matériaux, outils et équipements neufs ou usagés, entre voisins, particuliers et professionnels. Publication gratuite, zéro commission.';

/** URL-friendly name: « Plomberie St-Henri » → plomberie-st-henri. api/_shared.js has the same function. */
export function slugify(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

type ListingForSeo = {
  id: string;
  title: string;
  description: string;
  city: string;
  condition: 'neuf' | 'usage' | 'surplus';
  status: 'active' | 'vendue' | 'retiree';
  price_cents: number;
  price_unit: string;
};

const CONDITION_WORD = { neuf: 'neuf', usage: 'usagé', surplus: 'surplus de chantier' } as const;

/** Title, description and schema.org Product for a listing page. api/annonce.js mirrors this for the HTML Google first sees. */
export function listingSeo(l: ListingForSeo, categoryName: string, image: string | null): Seo {
  const price = (l.price_cents / 100).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
  const description =
    `${l.title} (${CONDITION_WORD[l.condition]}) à vendre à ${l.city} : ${price}${l.price_unit ? ' ' + l.price_unit : ''}. ` +
    (l.description || `${categoryName} sur Bâtiplace, le marketplace de la construction au Québec.`);
  return {
    title: `${l.title} à ${l.city}`,
    description,
    path: `/annonce/${l.id}`,
    image,
    noindex: l.status === 'retiree',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: l.title,
      description: l.description || undefined,
      category: categoryName,
      image: image ? [image] : undefined,
      url: `${SITE_URL}/annonce/${l.id}`,
      offers: {
        '@type': 'Offer',
        price: (l.price_cents / 100).toFixed(2),
        priceCurrency: 'CAD',
        itemCondition: l.condition === 'neuf' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
        availability: l.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
        areaServed: { '@type': 'City', name: l.city },
        url: `${SITE_URL}/annonce/${l.id}`,
      },
    },
  };
}

type PartnerForSeo = {
  name: string;
  offer: string;
  description: string;
  category: string;
  city: string;
  address: string;
  website: string;
  phone: string;
  email: string;
  logo_url: string;
};

/** Title, description and schema.org LocalBusiness for a partner page. api/partenaire.js mirrors this. */
export function partnerSeo(p: PartnerForSeo): Seo {
  const what = [p.category, p.city ? `à ${p.city}` : ''].filter(Boolean).join(' ');
  const path = `/partenaires/${slugify(p.name)}`;
  return {
    title: `${p.name}${what ? ` : ${what}` : ''}, ${p.offer}`,
    description: `${p.name}${what ? ` (${what})` : ''}. ${p.description} Partenaire Bâtiplace : ${p.offer} pour les abonnés.`,
    path,
    image: p.logo_url || null,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': /plomb/i.test(p.category) ? 'Plumber' : /[ée]lectri/i.test(p.category) ? 'Electrician' : 'LocalBusiness',
      name: p.name,
      description: p.description || undefined,
      url: SITE_URL + path,
      sameAs: p.website ? [p.website] : undefined,
      logo: p.logo_url || undefined,
      image: p.logo_url || undefined,
      telephone: p.phone || undefined,
      email: p.email || undefined,
      address: p.city
        ? { '@type': 'PostalAddress', streetAddress: p.address || undefined, addressLocality: p.city, addressRegion: 'QC', addressCountry: 'CA' }
        : undefined,
      areaServed: p.city || 'Québec',
    },
  };
}
