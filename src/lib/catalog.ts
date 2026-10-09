import type { ListingCondition, SellerType } from './database.types';
import { QUEBEC_PLACES } from './quebec-places';

/** Mirrors the `categories` table so the UI renders before the network answers. */
export const CATEGORIES = [
  { id: 'materiaux', name: 'Matériaux', icon: 'layers-outline', tint: '#f3e3c3', ink: '#7a5520' },
  { id: 'surplus', name: 'Surplus de chantier', icon: 'cube-outline', tint: '#fdecb0', ink: '#7a5a00' },
  { id: 'outils', name: 'Outils', icon: 'hammer-outline', tint: '#ffd9cc', ink: '#b23a1c' },
  { id: 'equipements', name: 'Équipements', icon: 'construct-outline', tint: '#d6e6f5', ink: '#2a5a86' },
  { id: 'machinerie', name: 'Machinerie', icon: 'car-sport-outline', tint: '#ffe3a8', ink: '#8a5a00' },
  { id: 'plomberie', name: 'Plomberie', icon: 'water-outline', tint: '#cfe9f2', ink: '#1d6a86' },
  { id: 'electricite', name: 'Électricité', icon: 'flash-outline', tint: '#e3def7', ink: '#4f3f99' },
  { id: 'portes-fenetres', name: 'Portes et fenêtres', icon: 'grid-outline', tint: '#d9ecd6', ink: '#2f6b3a' },
  { id: 'bois', name: 'Bois', icon: 'leaf-outline', tint: '#f1dcc6', ink: '#8a4e1c' },
  { id: 'revetements', name: 'Revêtements', icon: 'apps-outline', tint: '#e4e7ea', ink: '#46505c' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export function category(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export const CONDITIONS: { id: ListingCondition; label: string }[] = [
  { id: 'neuf', label: 'Neuf' },
  { id: 'usage', label: 'Usagé' },
  { id: 'surplus', label: 'Surplus de chantier' },
];

export const conditionLabel = (c: ListingCondition) => CONDITIONS.find((x) => x.id === c)?.label ?? c;

export const SELLER_TYPES: { id: SellerType; label: string }[] = [
  { id: 'particulier', label: 'Particulier' },
  { id: 'entrepreneur', label: 'Entrepreneur' },
  { id: 'fournisseur', label: 'Fournisseur' },
  { id: 'entreprise', label: 'Entreprise' },
];

export const sellerTypeLabel = (t: SellerType) => SELLER_TYPES.find((x) => x.id === t)?.label ?? t;

export const PRICE_UNITS = ['', 'le lot', '/ unité', '/ boîte', '/ pi²', '/ panneau', '/ morceau'];

/** Main Québec cities, suggested first and used for the location picker. */
const MAIN_CITIES: Record<string, { lat: number; lng: number }> = {
  Montréal: { lat: 45.5017, lng: -73.5673 },
  Laval: { lat: 45.5699, lng: -73.692 },
  Longueuil: { lat: 45.5312, lng: -73.5185 },
  Terrebonne: { lat: 45.7, lng: -73.6473 },
  Québec: { lat: 46.8139, lng: -71.208 },
  Lévis: { lat: 46.8033, lng: -71.1779 },
  Gatineau: { lat: 45.4765, lng: -75.7013 },
  Sherbrooke: { lat: 45.4042, lng: -71.8929 },
  'Trois-Rivières': { lat: 46.343, lng: -72.5477 },
  'Saint-Jérôme': { lat: 45.7804, lng: -74.0036 },
  Drummondville: { lat: 45.8838, lng: -72.4843 },
  Granby: { lat: 45.4, lng: -72.7333 },
  'Saint-Hyacinthe': { lat: 45.6307, lng: -72.957 },
  'Saint-Jean-sur-Richelieu': { lat: 45.3075, lng: -73.2625 },
  Repentigny: { lat: 45.7422, lng: -73.4502 },
  Saguenay: { lat: 48.4284, lng: -71.0685 },
  Rimouski: { lat: 48.4489, lng: -68.5236 },
  'Rouyn-Noranda': { lat: 48.2366, lng: -79.0231 },
};

export const CITY_NAMES = Object.keys(MAIN_CITIES);

/** Every Québec municipality we know, by name. */
export const CITIES: Record<string, { lat: number; lng: number }> = {
  ...Object.fromEntries(QUEBEC_PLACES.map(([name, lat, lng]) => [name, { lat, lng }])),
  ...MAIN_CITIES,
};

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    // « St-Jérôme », « Ste-Julie » : abréviations courantes au Québec.
    .replace(/\bste\b/g, 'sainte')
    .replace(/\bst\b/g, 'saint');

const CITY_INDEX = Object.keys(CITIES).map((name) => ({ name, key: fold(name), main: name in MAIN_CITIES }));

/** Exact city name for what was typed, ignoring accents, case and dashes. */
export function findCity(text: string) {
  const k = fold(text);
  return k ? CITY_INDEX.find((c) => c.key === k)?.name : undefined;
}

/** Cities matching what was typed: names starting with it first, then any word starting with it. */
export function searchCities(text: string, limit = 6) {
  const k = fold(text);
  if (!k) return [];
  const parts = k.split(' ');
  const score = (c: (typeof CITY_INDEX)[number]) => {
    if (c.key.startsWith(k)) return 0;
    const words = c.key.split(' ');
    if (parts.every((p) => words.some((w) => w.startsWith(p)))) return 1;
    return c.key.includes(k) ? 2 : -1;
  };
  return CITY_INDEX.map((c) => ({ c, s: score(c) }))
    .filter((x) => x.s >= 0)
    .sort((x, y) => x.s - y.s || Number(y.c.main) - Number(x.c.main) || x.c.name.length - y.c.name.length || x.c.name.localeCompare(y.c.name, 'fr'))
    .slice(0, limit)
    .map((x) => x.c.name);
}

export function pointWkt(lat: number, lng: number) {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

const moneyFmt = (cents: number) =>
  new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: cents % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  });

export function money(cents: number) {
  return moneyFmt(cents).format(cents / 100);
}

export function distanceLabel(km: number) {
  return km < 1 ? '< 1 km' : `${Math.round(km)} km`;
}

export function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'aujourd’hui';
  if (days === 1) return 'hier';
  if (days < 30) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString('fr-CA', { day: 'numeric', month: 'short' });
}

export const FREE_LISTING_LIMIT = 5;
export const SUBSCRIPTION_PRICE = '9,99 $';

/** Courriel de contact public (confidentialité, soutien). À remplir par mc. */
export const CONTACT_EMAIL = 'support@lokalogement.ca';
