import { findCity, fold, type CategoryId } from './catalog';
import type { ListingCondition } from './database.types';

/** What the search assistant understood from a sentence like « je cherche de la céramique neuve à Laval ». */
export type SmartQuery = {
  keywords: string[];
  city?: string;
  condition?: ListingCondition;
  proOnly?: boolean;
  maxPriceCents?: number;
  /** Categories to fall back on when no listing contains the keywords. */
  categories: CategoryId[];
};

// Words that carry no meaning for the search (already accent-free and lowercase).
const FILLER = new Set(
  `je j tu on nous vous il elle ils cherche cherches cherchons recherche recherches recherchons chercher rechercher
  trouver trouve acheter achete achat besoin voudrais voudrait veux veut aimerais aimerait souhaite souhaiterais
  aurais avez auriez avoir ai est quelqu quelque chose un une des de du d la le les l au aux a en pour avec sans
  et ou sur dans chez mon ma mes ton ta tes son sa ses ce cet cette ces qui que quoi bon bonne bons bonnes
  svp merci bonjour salut allo hey s il plait vendre vend vente vendeur peu pas cher cheres chers chere prix
  autour pres proche vers region coin secteur environ moins max maximum budget dollars dollar piasses
  neuf neuve neufs neuves usage usagee usages usagees occasion seconde main surplus entrepreneur entrepreneurs
  pro pros professionnel professionnels particulier particuliers louer location rive sud nord`.split(/\s+/),
);

// Common words mapped to a category, used when keywords alone find nothing.
const CATEGORY_WORDS: Record<string, CategoryId> = {
  bois: 'bois', planche: 'bois', madrier: 'bois', contreplaque: 'bois', osb: 'bois', '2x4': 'bois', '2x6': 'bois', '2x8': 'bois',
  '2x10': 'bois', epinette: 'bois', pin: 'bois', cedre: 'bois', erable: 'bois', chene: 'bois', poutre: 'bois', solive: 'bois',
  ceramique: 'revetements', tuile: 'revetements', porcelaine: 'revetements', plancher: 'revetements', vinyle: 'revetements',
  bardeau: 'revetements', revetement: 'revetements', parement: 'revetements', stratifie: 'revetements', moquette: 'revetements',
  gypse: 'materiaux', isolant: 'materiaux', isolation: 'materiaux', laine: 'materiaux', ciment: 'materiaux', beton: 'materiaux',
  brique: 'materiaux', pierre: 'materiaux', bloc: 'materiaux', sable: 'materiaux', gravier: 'materiaux', mortier: 'materiaux',
  membrane: 'materiaux', peinture: 'materiaux', vis: 'materiaux', clou: 'materiaux',
  scie: 'outils', perceuse: 'outils', visseuse: 'outils', marteau: 'outils', niveau: 'outils', meuleuse: 'outils', sableuse: 'outils',
  cloueuse: 'outils', outil: 'outils', ponceuse: 'outils', toupie: 'outils',
  echafaud: 'equipements', echafaudage: 'equipements', echelle: 'equipements', compresseur: 'equipements', generatrice: 'equipements',
  betonniere: 'equipements', remorque: 'equipements',
  pelle: 'machinerie', excavatrice: 'machinerie', mini: 'machinerie', chargeuse: 'machinerie', nacelle: 'machinerie',
  chariot: 'machinerie', bobcat: 'machinerie', tracteur: 'machinerie',
  toilette: 'plomberie', lavabo: 'plomberie', evier: 'plomberie', robinet: 'plomberie', douche: 'plomberie', bain: 'plomberie',
  baignoire: 'plomberie', tuyau: 'plomberie', pex: 'plomberie', chauffe: 'plomberie', plomberie: 'plomberie',
  fil: 'electricite', filage: 'electricite', disjoncteur: 'electricite', panneau: 'electricite', luminaire: 'electricite',
  prise: 'electricite', interrupteur: 'electricite', electrique: 'electricite', electricite: 'electricite',
  porte: 'portes-fenetres', fenetre: 'portes-fenetres', vitre: 'portes-fenetres', moustiquaire: 'portes-fenetres',
  thermos: 'portes-fenetres', cadrage: 'portes-fenetres', moulure: 'portes-fenetres',
};

// « planches » → « planche », « tuyaux » → « tuyau », so a search matches singular and plural.
const stem = (w: string) => (w.length > 3 && /[sx]$/.test(w) && !/(ss|is|os|us)$/.test(w) ? w.slice(0, -1) : w);

const CITY_LEAD = new Set(['a', 'au', 'aux', 'de', 'pres', 'proche', 'vers', 'dans', 'en', 'sur', 'autour', 'secteur', 'region']);

export function parseSmartQuery(text: string): SmartQuery {
  const result: SmartQuery = { keywords: [], categories: [] };
  let s = fold(text.replace(/[’']/g, ' '));

  const price = s.match(/(?:moins de|max(?:imum)?|budget(?: de)?|pas plus de|sous)\s*(\d+(?:[ .,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:\$|dollars?|piasses)?\s*(?:max(?:imum)?|ou moins)/);
  if (price) {
    const n = parseFloat((price[1] ?? price[2]).replace(/\s/g, '').replace(',', '.'));
    if (Number.isFinite(n) && n > 0) result.maxPriceCents = Math.round(n * 100);
    s = s.replace(price[0], ' ');
  }

  if (/\b(neuf|neuve|neufs|neuves)\b/.test(s)) result.condition = 'neuf';
  else if (/\b(usage|usagee|usages|usagees|occasion|seconde main)\b/.test(s)) result.condition = 'usage';
  else if (/\bsurplus\b/.test(s)) result.condition = 'surplus';

  if (/\b(entrepreneurs?|pros?|professionnels?|fournisseurs?)\b/.test(s)) result.proOnly = true;
  else if (/\bparticuliers?\b/.test(s)) result.proOnly = false;

  const words = s.split(' ').filter(Boolean);
  // City: the longest run of 1 to 5 words after « à », « près de »… that names a Québec municipality.
  for (let i = 0; i < words.length && !result.city; i++) {
    if (!CITY_LEAD.has(words[i])) continue;
    let start = i + 1;
    while (start < words.length && CITY_LEAD.has(words[start])) start++;
    for (let len = Math.min(5, words.length - start); len >= 1; len--) {
      const city = findCity(words.slice(start, start + len).join(' '));
      if (city) {
        result.city = city;
        words.splice(start, len);
        break;
      }
    }
  }

  // Without « à » : a city name of two words or more anywhere (« porte patio Trois-Rivières »), or the last word.
  for (let len = 5; len >= 1 && !result.city; len--) {
    for (let i = 0; i + len <= words.length; i++) {
      if (len === 1 && i !== words.length - 1) continue;
      const city = findCity(words.slice(i, i + len).join(' '));
      if (city && (len > 1 || words.length > 1)) {
        result.city = city;
        words.splice(i, len);
        break;
      }
    }
  }

  for (const w of words) {
    if (FILLER.has(w) || /^\d+$/.test(w) || w.length < 2) continue;
    const k = stem(w);
    if (!result.keywords.includes(k)) result.keywords.push(k);
    const cat = CATEGORY_WORDS[k] ?? CATEGORY_WORDS[w];
    if (cat && !result.categories.includes(cat)) result.categories.push(cat);
  }
  return result;
}
