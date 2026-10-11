import { LandingPage } from '@/components/landing-page';

// Targets « matériel usagé », « matériaux de construction usagés », « surplus de chantier ».
export default function UsedMaterialsScreen() {
  return (
    <LandingPage
      seo={{ title: 'Matériel et matériaux de construction usagés au Québec, surplus de chantier', path: '/materiaux-usages' }}
      content={{
        fr: {
          h1: 'Matériel et matériaux de construction usagés au Québec',
          intro:
            'Achetez et vendez du matériel usagé, des matériaux de construction usagés et des surplus de chantier près de chez vous sur Bâtiplace : bois, portes et fenêtres, plomberie, électricité, revêtements, entre particuliers, entrepreneurs et fournisseurs, partout au Québec. Publication gratuite, zéro commission.',
          sections: [
            {
              title: 'Quel matériel usagé trouver sur Bâtiplace',
              body: 'Des restes de rénovation, des surplus de chantier jamais utilisés et du matériel récupéré en bon état, souvent bien en dessous du prix en magasin.',
              items: [
                'Bois de construction, contreplaqué, bois traité, poutres',
                'Portes, fenêtres, armoires et quincaillerie',
                'Plomberie et électricité : robinetterie, tuyaux, fils, luminaires',
                'Revêtements : céramique, plancher, gypse, bardeaux, isolant',
                'Surplus de chantier : boîtes neuves non ouvertes, fins de lots, retours',
              ],
            },
            {
              title: 'Donner une deuxième vie aux matériaux',
              body: 'Chaque année, des tonnes de matériaux encore bons finissent au conteneur. Les vendre sur Bâtiplace permet de récupérer de l’argent et d’éviter le gaspillage, tout en aidant un voisin ou un autre entrepreneur à faire ses travaux à moindre coût.',
            },
            {
              title: 'Vendre son matériel usagé',
              body: 'Publiez une annonce gratuite avec photos, quantité, format, prix et ville. Les acheteurs près de chez vous vous écrivent dans la messagerie Bâtiplace, puis vous vous entendez sur la remise.',
            },
          ],
          faq: [
            ['Est-ce gratuit de vendre des matériaux usagés sur Bâtiplace ?', 'Oui. Vos 5 annonces actives sont gratuites et aucune commission n’est prise sur les ventes.'],
            ['Puis-je vendre un surplus de chantier en lot ?', 'Oui. Indiquez la quantité et le prix au lot ou à l’unité dans votre annonce.'],
            ['Où trouver des matériaux de construction usagés près de chez moi ?', 'Sur Bâtiplace, les annonces sont classées par distance de votre ville, partout au Québec.'],
          ],
          browse: 'Voir les matériaux à vendre',
          post: 'Vendre mes matériaux',
        },
        en: {
          h1: 'Used building materials in Québec',
          intro:
            'Buy and sell used building materials and job site surplus near you on Bâtiplace: lumber, doors and windows, plumbing, electrical, coverings, between individuals, contractors and suppliers, everywhere in Québec. Free posting, zero commission.',
          sections: [
            {
              title: 'Used materials you can find on Bâtiplace',
              body: 'Renovation leftovers, unused job site surplus and salvaged materials in good shape, often well below store prices.',
              items: [
                'Lumber, plywood, treated wood, beams',
                'Doors, windows, cabinets and hardware',
                'Plumbing and electrical: faucets, pipes, wire, light fixtures',
                'Coverings: tile, flooring, drywall, shingles, insulation',
                'Job site surplus: unopened boxes, end-of-lot items, returns',
              ],
            },
            {
              title: 'Give materials a second life',
              body: 'Every year, tons of good materials end up in the dumpster. Selling them on Bâtiplace gets you money back and avoids waste, while helping a neighbour or another contractor build for less.',
            },
            {
              title: 'Selling your used materials',
              body: 'Post a free listing with photos, quantity, size, price and city. Buyers near you write to you in Bâtiplace messages, then you agree on the pickup.',
            },
          ],
          faq: [
            ['Is it free to sell used materials on Bâtiplace?', 'Yes. Your 5 active listings are free and no commission is taken on sales.'],
            ['Can I sell job site surplus as a lot?', 'Yes. Give the quantity and the price per lot or per unit in your listing.'],
            ['Where can I find used building materials near me?', 'On Bâtiplace, listings are sorted by distance from your city, everywhere in Québec.'],
          ],
          browse: 'See materials for sale',
          post: 'Sell my materials',
        },
      }}
    />
  );
}
