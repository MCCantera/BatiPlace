import { LandingPage } from '@/components/landing-page';

// Targets « outils usagés », « outils d'occasion ».
export default function UsedToolsScreen() {
  return (
    <LandingPage
      seo={{ title: 'Outils usagés et d’occasion au Québec : achat et vente entre particuliers et pros', path: '/outils-usages' }}
      content={{
        fr: {
          h1: 'Outils usagés et d’occasion au Québec',
          intro:
            'Achetez et vendez des outils usagés et d’occasion près de chez vous sur Bâtiplace : outils électriques, outils à main, outillage de chantier et équipements, entre particuliers, entrepreneurs et fournisseurs, partout au Québec. Publication gratuite, zéro commission.',
          sections: [
            {
              title: 'Quels outils d’occasion trouver sur Bâtiplace',
              body: 'Des outils de qualité professionnelle à une fraction du prix neuf, souvent vendus par des entrepreneurs qui renouvellent leur équipement.',
              items: [
                'Outils électriques : perceuses, perforateurs, scies circulaires, scies à onglet, meuleuses, visseuses à percussion',
                'Outils à batterie : Milwaukee, DeWalt, Makita, Ryobi, Bosch et autres marques',
                'Outils à main : niveaux, serre-joints, coffres à outils, outils de finition',
                'Équipements de chantier : compresseurs, génératrices, échafauds, échelles, bétonnières',
              ],
            },
            {
              title: 'Vendre ses outils usagés',
              body: 'Publiez votre annonce gratuitement en quelques minutes avec photos, prix et ville. Les acheteurs de votre région la trouvent avec la recherche par distance et vous écrivent dans la messagerie Bâtiplace, sans que vous ayez à partager votre numéro.',
            },
            {
              title: 'Acheter des outils d’occasion en confiance',
              body: 'Voyez l’outil en personne avant de payer, testez-le sur place et vérifiez le profil et les évaluations du vendeur. Les entrepreneurs avec une licence RBQ vérifiée sont identifiés.',
            },
          ],
          faq: [
            ['Combien coûte la vente d’outils usagés sur Bâtiplace ?', 'Rien. Vos 5 annonces actives sont gratuites et Bâtiplace ne prend aucune commission sur la vente.'],
            ['Où trouver des outils d’occasion près de chez moi ?', 'Sur Bâtiplace, indiquez votre ville ou votre position : les annonces sont classées par distance, de Montréal à Québec, Laval, Gatineau, Sherbrooke et partout en région.'],
            ['Puis-je vendre des outils à batterie sans les batteries ?', 'Oui, précisez-le simplement dans la description de l’annonce.'],
          ],
          browse: 'Voir les outils à vendre',
          post: 'Vendre mes outils',
        },
        en: {
          h1: 'Used tools in Québec',
          intro:
            'Buy and sell used tools near you on Bâtiplace: power tools, hand tools, job site equipment, between individuals, contractors and suppliers, everywhere in Québec. Free posting, zero commission.',
          sections: [
            {
              title: 'Used tools you can find on Bâtiplace',
              body: 'Professional-grade tools for a fraction of the new price, often sold by contractors upgrading their gear.',
              items: [
                'Power tools: drills, rotary hammers, circular saws, miter saws, grinders, impact drivers',
                'Cordless tools: Milwaukee, DeWalt, Makita, Ryobi, Bosch and more',
                'Hand tools: levels, clamps, tool boxes, finishing tools',
                'Job site equipment: compressors, generators, scaffolding, ladders, cement mixers',
              ],
            },
            {
              title: 'Selling your used tools',
              body: 'Post a free listing in minutes with photos, price and city. Buyers in your area find it with distance search and write to you in Bâtiplace messages, without you sharing your phone number.',
            },
            {
              title: 'Buying used tools with confidence',
              body: 'See the tool in person before paying, test it on the spot and check the seller’s profile and ratings. Contractors with a verified RBQ licence are marked.',
            },
          ],
          faq: [
            ['How much does it cost to sell used tools on Bâtiplace?', 'Nothing. Your 5 active listings are free and Bâtiplace takes no commission.'],
            ['Where can I find used tools near me?', 'On Bâtiplace, enter your city or use your location: listings are sorted by distance, everywhere in Québec.'],
            ['Can I sell cordless tools without batteries?', 'Yes, just say so in the listing description.'],
          ],
          browse: 'See tools for sale',
          post: 'Sell my tools',
        },
      }}
    />
  );
}
