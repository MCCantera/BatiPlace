import { LandingPage } from '@/components/landing-page';

// Targets « bois usagé », « bois de construction usagé », « bois de grange », « 2x4 usagé ».
export default function UsedLumberScreen() {
  return (
    <LandingPage
      category="bois"
      seo={{ title: 'Bois usagé et bois de construction à vendre au Québec : 2x4, poutres, bois de grange', path: '/bois-usage' }}
      content={{
        fr: {
          h1: 'Bois usagé et bois de construction au Québec',
          intro:
            'Achetez et vendez du bois usagé et du bois de construction en surplus près de chez vous sur Bâtiplace : 2x4, 2x6, contreplaqué, poutres, bois traité, bois franc et bois de grange, entre particuliers, entrepreneurs et fournisseurs, partout au Québec. Publication gratuite, zéro commission.',
          sections: [
            {
              title: 'Quel bois trouver sur Bâtiplace',
              items: [
                'Bois d’œuvre : 2x4, 2x6, 2x8, 2x10, montants et solives',
                'Panneaux : contreplaqué, OSB, MDF, mélamine',
                'Bois traité pour terrasses, clôtures et patios',
                'Poutres, madriers, bois lamellé-collé',
                'Bois franc et planchers récupérés',
                'Bois de grange et bois de récupération pour la décoration',
              ],
              body: 'Restes de chantier, démontage de terrasses, fins de lots de cours à bois ou bois récupéré de bâtiments anciens : le bois est un des matériaux qui se réutilise le mieux.',
            },
            {
              title: 'Acheter du bois usagé : ce qu’il faut vérifier',
              body: 'Demandez les dimensions réelles et la longueur des pièces, vérifiez qu’il n’y a ni pourriture, ni moisissure, ni insectes, et retirez les clous et vis avant de couper. Le bois traité ne doit jamais être brûlé : réservez-le aux usages extérieurs.',
            },
            {
              title: 'Vendre son bois en trop',
              body: 'Prenez une photo du tas avec un ruban à mesurer, indiquez le nombre de pièces, les dimensions et si c’est au lot. Les acheteurs de votre région vous écrivent dans la messagerie Bâtiplace et viennent chercher le bois sur place.',
            },
          ],
          faq: [
            ['Où acheter du bois de construction usagé près de chez moi ?', 'Sur Bâtiplace, choisissez votre ville et un rayon : les annonces de bois sont classées par distance, partout au Québec.'],
            ['Peut-on réutiliser du bois de construction usagé ?', 'Oui, pour la plupart des projets non structuraux (cabanons, bacs, coffrages, rangements). Pour une structure, faites valider l’usage par un professionnel et respectez le Code de construction.'],
            ['Combien coûte une annonce de bois sur Bâtiplace ?', 'Rien. Vos 5 annonces actives sont gratuites et Bâtiplace ne prend aucune commission sur la vente.'],
          ],
          browse: 'Voir le bois à vendre',
          post: 'Vendre mon bois',
        },
        en: {
          h1: 'Used lumber and building wood in Québec',
          intro:
            'Buy and sell used lumber and surplus building wood near you on Bâtiplace: 2x4s, 2x6s, plywood, beams, treated wood, hardwood and barn wood, between individuals, contractors and suppliers, everywhere in Québec. Free posting, zero commission.',
          sections: [
            {
              title: 'Wood you can find on Bâtiplace',
              items: [
                'Dimensional lumber: 2x4, 2x6, 2x8, 2x10, studs and joists',
                'Panels: plywood, OSB, MDF, melamine',
                'Treated wood for decks, fences and patios',
                'Beams, planks, glulam',
                'Hardwood and reclaimed flooring',
                'Barn wood and reclaimed wood for decor',
              ],
              body: 'Job site leftovers, dismantled decks, lumber yard end of lots or wood reclaimed from old buildings: wood is one of the most reusable materials.',
            },
            {
              title: 'Buying used lumber: what to check',
              body: 'Ask for actual dimensions and lengths, check for rot, mould and insects, and remove nails and screws before cutting. Never burn treated wood.',
            },
            {
              title: 'Selling your extra wood',
              body: 'Take a photo of the pile with a tape measure, give the number of pieces, sizes and whether it is sold as a lot. Buyers nearby write to you in Bâtiplace messages.',
            },
          ],
          faq: [
            ['Where can I buy used lumber near me?', 'On Bâtiplace, choose your city and a radius: wood listings are sorted by distance, everywhere in Québec.'],
            ['Can used lumber be reused?', 'Yes, for most non-structural projects. For structural use, have a professional confirm it and follow the building code.'],
            ['How much does a listing cost?', 'Nothing. Your 5 active listings are free and Bâtiplace takes no commission.'],
          ],
          browse: 'See wood for sale',
          post: 'Sell my wood',
        },
      }}
    />
  );
}
