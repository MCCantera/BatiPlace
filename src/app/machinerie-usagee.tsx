import { LandingPage } from '@/components/landing-page';

// Targets « machinerie de construction usagée », « équipement lourd usagé », « mini-excavatrice usagée ».
export default function UsedMachineryScreen() {
  return (
    <LandingPage
      category="machinerie"
      seo={{ title: 'Machinerie de construction usagée au Québec : mini-excavatrices, chargeuses, remorques', path: '/machinerie-usagee' }}
      content={{
        fr: {
          h1: 'Machinerie et équipement lourd usagés au Québec',
          intro:
            'Achetez et vendez de la machinerie de construction usagée près de chez vous sur Bâtiplace : mini-excavatrices, chargeuses compactes, nacelles, plaques vibrantes, remorques et équipement de chantier, entre entrepreneurs, fournisseurs et particuliers, partout au Québec. Publication gratuite, zéro commission.',
          sections: [
            {
              title: 'Quelle machinerie trouver sur Bâtiplace',
              items: [
                'Mini-excavatrices, rétrocaveuses et pelles',
                'Chargeuses compactes (type Bobcat), chariots télescopiques',
                'Nacelles, plateformes élévatrices, échafaudages',
                'Plaques vibrantes, rouleaux compacteurs, bétonnières',
                'Remorques, remorques basculantes, conteneurs',
                'Accessoires : godets, marteaux hydrauliques, fourches, tarières',
              ],
              body: 'Entrepreneurs qui renouvellent leur parc, fins de projets, petites entreprises qui ferment : une bonne partie de la machinerie change de main entre professionnels.',
            },
            {
              title: 'Acheter de la machinerie usagée : les vérifications',
              body: 'Demandez le nombre d’heures, le carnet d’entretien et le numéro de série. Faites démarrer la machine à froid et essayez toutes les fonctions hydrauliques. Avant de payer, vérifiez au Registre des droits personnels et réels mobiliers (RDPRM) qu’aucune dette n’est inscrite sur la machine.',
            },
            {
              title: 'Vendre sa machinerie',
              body: 'Publiez une annonce avec photos de tous les côtés, heures au compteur, année, modèle, accessoires inclus et prix. Avec Bâtiplace Illimité, un entrepreneur peut publier tout son parc sans limite, et sa licence RBQ vérifiée est affichée.',
            },
          ],
          faq: [
            ['Où acheter de la machinerie de construction usagée au Québec ?', 'Sur Bâtiplace, les annonces de machinerie sont classées par distance de votre ville : Montréal, Québec, Laval, Gatineau, Sherbrooke, Trois-Rivières, Saguenay et partout en région.'],
            ['Comment savoir si une machine usagée a une dette ?', 'Faites une recherche avec le numéro de série au RDPRM (rdprm.gouv.qc.ca) avant l’achat. Bâtiplace ne vérifie pas les machines : voyez-la en personne avant de payer.'],
            ['Bâtiplace prend-il une commission sur la vente d’une machine ?', 'Non, aucune commission, même sur une vente importante. Vos 5 annonces actives sont gratuites.'],
          ],
          browse: 'Voir la machinerie à vendre',
          post: 'Vendre ma machinerie',
        },
        en: {
          h1: 'Used construction machinery and heavy equipment in Québec',
          intro:
            'Buy and sell used construction machinery near you on Bâtiplace: mini excavators, skid steers, lifts, plate compactors, trailers and job site equipment, between contractors, suppliers and individuals, everywhere in Québec. Free posting, zero commission.',
          sections: [
            {
              title: 'Machinery you can find on Bâtiplace',
              items: [
                'Mini excavators, backhoes and diggers',
                'Skid steers, telehandlers',
                'Boom lifts, scissor lifts, scaffolding',
                'Plate compactors, rollers, cement mixers',
                'Trailers, dump trailers, containers',
                'Attachments: buckets, hydraulic hammers, forks, augers',
              ],
              body: 'Contractors renewing their fleet, end of projects, small businesses closing: much machinery changes hands between professionals.',
            },
            {
              title: 'Buying used machinery: what to check',
              body: 'Ask for hours, the maintenance log and the serial number. Start the machine cold and try every hydraulic function. Before paying, check the RDPRM registry for liens on the machine.',
            },
            {
              title: 'Selling your machinery',
              body: 'Post photos from every side, hours, year, model, included attachments and price. With Bâtiplace Unlimited a contractor can post their whole fleet.',
            },
          ],
          faq: [
            ['Where can I buy used construction machinery in Québec?', 'On Bâtiplace, machinery listings are sorted by distance from your city, everywhere in Québec.'],
            ['How do I know if a used machine has a lien?', 'Search the serial number on the RDPRM registry before buying. Bâtiplace does not inspect machines: see it in person before paying.'],
            ['Does Bâtiplace take a commission?', 'No commission, even on a large sale. Your 5 active listings are free.'],
          ],
          browse: 'See machinery for sale',
          post: 'Sell my machinery',
        },
      }}
    />
  );
}
