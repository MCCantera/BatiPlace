import { LandingPage } from '@/components/landing-page';

// Targets « portes et fenêtres usagées », « fenêtres usagées à vendre », « porte d'entrée usagée ».
export default function UsedDoorsWindowsScreen() {
  return (
    <LandingPage
      category="portes-fenetres"
      seo={{ title: 'Portes et fenêtres usagées à vendre au Québec : neuves en surplus ou d’occasion', path: '/portes-fenetres-usagees' }}
      content={{
        fr: {
          h1: 'Portes et fenêtres usagées au Québec',
          intro:
            'Achetez et vendez des portes et fenêtres usagées ou neuves en surplus près de chez vous sur Bâtiplace : fenêtres à battant, coulissantes, portes d’entrée, portes patio, portes intérieures et portes de garage, entre particuliers, entrepreneurs et fournisseurs, partout au Québec. Publication gratuite, zéro commission.',
          sections: [
            {
              title: 'Pourquoi tant de portes et fenêtres neuves en surplus',
              body: 'Les portes et fenêtres sont faites sur mesure : une erreur de mesure, un changement de projet ou une commande annulée, et le fournisseur ne peut pas les reprendre. Elles se retrouvent à vendre, souvent neuves, bien en dessous du prix d’origine.',
              items: [
                'Fenêtres à battant, à guillotine, coulissantes et fixes',
                'Portes d’entrée en acier ou en fibre de verre',
                'Portes patio et portes-fenêtres',
                'Portes intérieures, portes coulissantes de grange',
                'Portes de garage et ouvre-portes',
                'Quincaillerie, poignées, serrures et moustiquaires',
              ],
            },
            {
              title: 'Avant d’acheter une fenêtre usagée',
              body: 'Mesurez l’ouverture brute de votre mur, pas seulement l’ancienne fenêtre. Demandez au vendeur les dimensions exactes du cadre, le sens d’ouverture, le type de verre (double ou triple) et si le thermos est embué. Une homologation ENERGY STAR est un bon signe pour le climat du Québec.',
            },
            {
              title: 'Vendre ses portes et fenêtres',
              body: 'Indiquez les dimensions du cadre, le modèle, la couleur, le sens d’ouverture et l’état. Ajoutez une photo de l’étiquette du fabricant. Les acheteurs de votre région vous écrivent dans la messagerie Bâtiplace.',
            },
          ],
          faq: [
            ['Où trouver des fenêtres usagées près de chez moi ?', 'Sur Bâtiplace, choisissez votre ville et un rayon : les portes et fenêtres à vendre sont classées par distance, partout au Québec.'],
            ['Peut-on installer une fenêtre usagée dans une maison ?', 'Oui, si ses dimensions conviennent à l’ouverture et qu’elle est en bon état. Pour une ouverture modifiée ou un mur porteur, faites appel à un entrepreneur licencié RBQ.'],
            ['Est-ce gratuit de vendre une porte ou une fenêtre sur Bâtiplace ?', 'Oui. Vos 5 annonces actives sont gratuites et aucune commission n’est prise sur la vente.'],
          ],
          browse: 'Voir les portes et fenêtres',
          post: 'Vendre mes portes et fenêtres',
        },
        en: {
          h1: 'Used doors and windows in Québec',
          intro:
            'Buy and sell used or surplus new doors and windows near you on Bâtiplace: casement, sliding, entry doors, patio doors, interior and garage doors, between individuals, contractors and suppliers, everywhere in Québec. Free posting, zero commission.',
          sections: [
            {
              title: 'Why so many new doors and windows end up as surplus',
              body: 'Doors and windows are made to measure: one measuring mistake, a change of plans or a cancelled order, and the supplier cannot take them back. They end up for sale, often new, well below the original price.',
              items: [
                'Casement, double-hung, sliding and fixed windows',
                'Steel or fibreglass entry doors',
                'Patio doors and French doors',
                'Interior doors, sliding barn doors',
                'Garage doors and openers',
                'Hardware, handles, locks and screens',
              ],
            },
            {
              title: 'Before buying a used window',
              body: 'Measure the rough opening in your wall, not just the old window. Ask for the exact frame size, opening direction, glass type (double or triple) and whether the sealed unit is foggy. ENERGY STAR certification is a good sign for Québec’s climate.',
            },
            {
              title: 'Selling doors and windows',
              body: 'Give the frame size, model, colour, opening direction and condition, plus a photo of the manufacturer’s label.',
            },
          ],
          faq: [
            ['Where can I find used windows near me?', 'On Bâtiplace, choose your city and a radius: listings are sorted by distance, everywhere in Québec.'],
            ['Can I install a used window in my home?', 'Yes, if it fits the opening and is in good condition. For a modified opening or a load-bearing wall, hire an RBQ-licensed contractor.'],
            ['Is it free to sell a door or window on Bâtiplace?', 'Yes. Your 5 active listings are free and there is no commission.'],
          ],
          browse: 'See doors and windows',
          post: 'Sell my doors and windows',
        },
      }}
    />
  );
}
