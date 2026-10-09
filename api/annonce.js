// Serves /annonce/:id with the listing's title, description, photo and schema.org data already in the HTML,
// so Google and link previews (Facebook, Messenger, texto) see the listing without running the app.
// Keep in sync with listingSeo() in src/lib/seo-shared.ts.
const { SITE_URL, rest, photoUrl, escapeHtml } = require('./_shared');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CONDITION_WORD = { neuf: 'neuf', usage: 'usagé', surplus: 'surplus de chantier' };

function setTag(html, pattern, tag) {
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n  </head>`);
}

function inject(html, l) {
  const url = `${SITE_URL}/annonce/${l.id}`;
  const category = l.category ? l.category.name : 'Construction';
  const photos = (l.listing_photos || []).sort((a, b) => a.position - b.position);
  const image = photoUrl(photos[0] && photos[0].path) || `${SITE_URL}/og-image.png`;
  const price = (l.price_cents / 100).toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
  const title = `${l.title} à ${l.city} · Bâtiplace`;
  const description = (
    `${l.title} (${CONDITION_WORD[l.condition] || l.condition}) à vendre à ${l.city} : ${price}${l.price_unit ? ' ' + l.price_unit : ''}. ` +
    (l.description || `${category} sur Bâtiplace, le marketplace de la construction au Québec.`)
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: l.title,
    description: l.description || undefined,
    category,
    image: [image],
    url,
    offers: {
      '@type': 'Offer',
      price: (l.price_cents / 100).toFixed(2),
      priceCurrency: 'CAD',
      itemCondition: l.condition === 'neuf' ? 'https://schema.org/NewCondition' : 'https://schema.org/UsedCondition',
      availability: l.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      areaServed: { '@type': 'City', name: l.city },
      url,
    },
  };

  const t = escapeHtml(title);
  const d = escapeHtml(description);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${d}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${t}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${d}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = setTag(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${escapeHtml(image)}" />`);
  html = setTag(html, /<meta property="og:type"[^>]*>/, `<meta property="og:type" content="product" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  if (l.status === 'retiree') html = setTag(html, /<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex" />');
  html = html.replace(
    '</head>',
    `    <script type="application/ld+json" id="page-jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n  </head>`,
  );
  // Readable text for crawlers that do not run JavaScript.
  html = html.replace(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript><h1>${escapeHtml(l.title)}</h1><p>${escapeHtml(price)} · ${escapeHtml(l.city)} · ${escapeHtml(category)}</p><p>${escapeHtml(l.description || '')}</p><p><a href="/">Voir toutes les annonces sur Bâtiplace</a></p></noscript>`,
  );
  return html;
}

module.exports = async (req, res) => {
  const id = String(req.query.id || '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  let html;
  try {
    const page = await fetch(`https://${host}/index.html`);
    html = await page.text();
  } catch {
    res.statusCode = 302;
    res.setHeader('Location', '/');
    return res.end();
  }
  let status = 200;
  try {
    if (!UUID.test(id)) throw Object.assign(new Error('bad id'), { notFound: true });
    const rows = await rest(
      `listings?id=eq.${id}&select=id,title,description,city,condition,status,price_cents,price_unit,category:categories(name),listing_photos(path,position)`,
    );
    if (!rows.length) throw Object.assign(new Error('not found'), { notFound: true });
    html = inject(html, rows[0]);
  } catch (e) {
    // The app still renders its own « annonce introuvable » screen; tell crawlers not to index it.
    if (e.notFound) {
      status = 404;
      html = html.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>');
    }
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  res.end(html);
};
