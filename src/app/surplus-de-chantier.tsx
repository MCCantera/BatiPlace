import { LandingPage } from '@/components/landing-page';

// Targets « surplus de chantier », « surplus de matériaux de construction », « vendre surplus construction ».
export default function JobSiteSurplusScreen() {
  return (
    <LandingPage
      category="surplus"
      seo={{ title: 'Surplus de chantier au Québec : vendre et acheter des surplus de matériaux de construction', path: '/surplus-de-chantier' }}
      content={{
        fr: {
          h1: 'Surplus de chantier et surplus de matériaux au Québec',
          intro:
            'Vendez vos surplus de chantier au lieu de les jeter, ou achetez des matériaux neufs en surplus à prix réduit près de chez vous sur Bâtiplace : boîtes non ouvertes, fins de lots, retours et restes de projets, entre entrepreneurs, fournisseurs et particuliers, partout au Québec. Publication gratuite, zéro commission.',
          sections: [
            {
              title: 'Ce qu’on trouve dans les surplus de chantier',
              body: 'Un chantier finit presque toujours avec du matériel en trop : on commande 10 % de plus par prudence, un client change d’idée, un fournisseur refuse un retour. Ce matériel est souvent neuf.',
              items: [
                'Gypse, isolant, pare-vapeur, membranes',
                'Céramique, plancher flottant, bois franc, boîtes de tuiles',
                'Bois d’œuvre, contreplaqué, OSB, moulures',
                'Bardeaux, revêtement extérieur, solins',
                'Quincaillerie, vis, fixations, adhésifs, peinture non ouverte',
                'Portes, fenêtres et armoires commandées en trop ou refusées',
              ],
            },
            {
              title: 'Pour les entrepreneurs : récupérer l’argent du matériel en trop',
              body: 'Plutôt que d’entreposer des surplus pendant des mois ou de payer un conteneur, publiez-les en lot sur Bâtiplace. Avec l’abonnement Bâtiplace Illimité, vous publiez autant d’annonces que vous voulez et votre licence RBQ vérifiée est affichée sur votre profil.',
            },
            {
              title: 'Pour les particuliers : rénover moins cher',
              body: 'Un surplus de chantier, c’est souvent du matériel neuf à une fraction du prix en magasin. Idéal pour un petit projet : une salle de bain, un cabanon, une remise ou une réparation où il vous faut seulement quelques boîtes.',
            },
            {
              title: 'Moins de déchets de construction',
              body: 'Le secteur de la construction, de la rénovation et de la démolition produit une grande part des matières résiduelles au Québec. Revendre un surplus, c’est éviter qu’un matériau encore bon parte à l’enfouissement.',
            },
          ],
          faq: [
            ['Comment vendre un surplus de chantier ?', 'Créez un compte gratuit, publiez une annonce avec des photos, la quantité, le format, le prix (au lot ou à l’unité) et votre ville. Les acheteurs près de chez vous vous écrivent dans la messagerie Bâtiplace.'],
            ['Combien coûte la vente de surplus sur Bâtiplace ?', 'Rien. Vos 5 annonces actives sont gratuites et Bâtiplace ne prend aucune commission. Pour publier plus, Bâtiplace Illimité coûte 9,99 $ par mois.'],
            ['Est-ce que les surplus de chantier sont neufs ?', 'Souvent, oui : boîtes non ouvertes, fins de lots ou commandes en trop. L’état (neuf, comme neuf, usagé) est indiqué sur chaque annonce.'],
            ['Où trouver des surplus de matériaux près de chez moi ?', 'Sur Bâtiplace, choisissez votre ville et un rayon (10, 25, 50 km ou plus) : les surplus sont classés par distance, de Montréal à Québec, Laval, Longueuil, Gatineau et Sherbrooke.'],
          ],
          browse: 'Voir les surplus à vendre',
          post: 'Vendre mes surplus',
        },
        en: {
          h1: 'Job site surplus and surplus building materials in Québec',
          intro:
            'Sell your job site surplus instead of throwing it away, or buy surplus new materials at a discount near you on Bâtiplace: unopened boxes, end of lots, returns and leftovers, between contractors, suppliers and individuals, everywhere in Québec. Free posting, zero commission.',
          sections: [
            {
              title: 'What you find in job site surplus',
              body: 'A job almost always ends with extra material: 10% more ordered to be safe, a client who changed their mind, a return the supplier refused. This material is often new.',
              items: [
                'Drywall, insulation, vapour barrier, membranes',
                'Tiles, floating floors, hardwood, boxes of ceramic',
                'Lumber, plywood, OSB, trim',
                'Shingles, siding, flashing',
                'Hardware, screws, fasteners, adhesives, unopened paint',
                'Doors, windows and cabinets ordered in excess or refused',
              ],
            },
            {
              title: 'For contractors: get your money back on extra material',
              body: 'Instead of storing surplus for months or paying for a dumpster, post it as a lot on Bâtiplace. With Bâtiplace Unlimited you post as many listings as you want and your verified RBQ licence shows on your profile.',
            },
            {
              title: 'For homeowners: renovate for less',
              body: 'Job site surplus is often new material for a fraction of the store price. Perfect for a small project where you only need a few boxes.',
            },
            {
              title: 'Less construction waste',
              body: 'Construction, renovation and demolition produce a large share of Québec’s waste. Reselling surplus keeps good material out of landfills.',
            },
          ],
          faq: [
            ['How do I sell job site surplus?', 'Create a free account and post a listing with photos, quantity, size, price (per lot or per unit) and your city. Buyers near you write to you in Bâtiplace messages.'],
            ['How much does it cost?', 'Nothing. Your 5 active listings are free and Bâtiplace takes no commission. To post more, Bâtiplace Unlimited is $9.99 per month.'],
            ['Is job site surplus new?', 'Often, yes: unopened boxes, end of lots or over-orders. The condition is shown on every listing.'],
            ['Where can I find surplus materials near me?', 'Choose your city and a radius: surplus listings are sorted by distance, everywhere in Québec.'],
          ],
          browse: 'See surplus for sale',
          post: 'Sell my surplus',
        },
      }}
    />
  );
}
