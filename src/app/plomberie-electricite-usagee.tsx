import { LandingPage } from '@/components/landing-page';

// Targets « matériel de plomberie usagé », « matériel électrique usagé », « surplus électrique ».
export default function PlumbingElectricalScreen() {
  return (
    <LandingPage
      category="plomberie"
      seo={{ title: 'Matériel de plomberie et d’électricité usagé ou en surplus au Québec', path: '/plomberie-electricite-usagee' }}
      content={{
        fr: {
          h1: 'Plomberie et électricité : matériel usagé et surplus au Québec',
          intro:
            'Achetez et vendez du matériel de plomberie et d’électricité neuf en surplus ou usagé près de chez vous sur Bâtiplace : robinetterie, lavabos, toilettes, chauffe-eau, tuyaux PEX et cuivre, fils, panneaux, luminaires et appareils, entre particuliers, plombiers, électriciens et fournisseurs, partout au Québec. Publication gratuite, zéro commission.',
          sections: [
            {
              title: 'Plomberie',
              body: 'Des surplus de plombiers, des appareils retirés lors d’une rénovation de salle de bain ou de cuisine, et des pièces neuves commandées en trop.',
              items: [
                'Robinets, douches, bains, lavabos, éviers et toilettes',
                'Tuyaux PEX, cuivre, ABS, raccords et valves',
                'Chauffe-eau, pompes, adoucisseurs',
              ],
            },
            {
              title: 'Électricité',
              body: 'Rouleaux de fil entamés, boîtes de prises, luminaires jamais installés : le matériel électrique en surplus est souvent neuf.',
              items: [
                'Fils et câbles, conduits, boîtes électriques',
                'Panneaux, disjoncteurs, prises et interrupteurs',
                'Luminaires, encastrés, ventilateurs de plafond',
                'Plinthes électriques et thermostats',
              ],
            },
            {
              title: 'Sécurité : ce qu’il faut savoir',
              body: 'Achetez du matériel portant une certification reconnue (CSA, cUL ou ULC). Au Québec, la plupart des travaux électriques doivent être faits par un maître électricien membre de la CMEQ, et les travaux de plomberie importants par un entrepreneur licencié RBQ. Un professionnel peut utiliser le matériel que vous avez acheté : demandez-lui avant.',
            },
          ],
          faq: [
            ['Peut-on acheter du matériel électrique usagé ?', 'Oui, s’il est certifié (CSA, cUL ou ULC) et en bon état. Évitez les disjoncteurs et panneaux d’origine inconnue et faites installer par un électricien membre de la CMEQ.'],
            ['Où trouver des surplus de plomberie près de chez moi ?', 'Sur Bâtiplace, choisissez votre ville et un rayon : les annonces sont classées par distance, partout au Québec.'],
            ['Est-ce gratuit de publier sur Bâtiplace ?', 'Oui. Vos 5 annonces actives sont gratuites et aucune commission n’est prise sur la vente.'],
          ],
          browse: 'Voir la plomberie à vendre',
          post: 'Vendre mon matériel',
        },
        en: {
          h1: 'Plumbing and electrical: used and surplus supplies in Québec',
          intro:
            'Buy and sell surplus new or used plumbing and electrical supplies near you on Bâtiplace: faucets, sinks, toilets, water heaters, PEX and copper pipe, wire, panels, light fixtures, between individuals, plumbers, electricians and suppliers, everywhere in Québec. Free posting, zero commission.',
          sections: [
            {
              title: 'Plumbing',
              body: 'Plumbers’ surplus, fixtures removed during a bathroom or kitchen renovation, and new parts ordered in excess.',
              items: ['Faucets, showers, tubs, sinks and toilets', 'PEX, copper and ABS pipe, fittings and valves', 'Water heaters, pumps, softeners'],
            },
            {
              title: 'Electrical',
              body: 'Partial rolls of wire, boxes of outlets, light fixtures never installed: surplus electrical supplies are often new.',
              items: ['Wire and cable, conduit, electrical boxes', 'Panels, breakers, outlets and switches', 'Light fixtures, pot lights, ceiling fans', 'Baseboard heaters and thermostats'],
            },
            {
              title: 'Safety: what to know',
              body: 'Buy supplies with a recognized certification (CSA, cUL or ULC). In Québec most electrical work must be done by a CMEQ master electrician, and major plumbing work by an RBQ-licensed contractor.',
            },
          ],
          faq: [
            ['Can I buy used electrical supplies?', 'Yes, if certified (CSA, cUL or ULC) and in good condition. Avoid breakers and panels of unknown origin and have a CMEQ electrician install them.'],
            ['Where can I find plumbing surplus near me?', 'On Bâtiplace, choose your city and a radius: listings are sorted by distance, everywhere in Québec.'],
            ['Is it free to post on Bâtiplace?', 'Yes. Your 5 active listings are free and there is no commission.'],
          ],
          browse: 'See plumbing for sale',
          post: 'Sell my supplies',
        },
      }}
    />
  );
}
