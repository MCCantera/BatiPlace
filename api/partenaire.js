// Serves /partenaires/:slug with the partner's name, offer and schema.org LocalBusiness already in the HTML,
// so a search for the partner's name (ex. « plomberie St-Henri ») can find this page.
// Keep in sync with partnerSeo() in src/lib/seo-shared.ts.
const { SITE_URL, rest, escapeHtml, setTag, slugify } = require('./_shared');

const COLUMNS = 'name,offer,description,category,city,address,website,phone,email,logo_url';

function inject(html, p) {
  const path = `/partenaires/${slugify(p.name)}`;
  const url = SITE_URL + path;
  const what = [p.category, p.city ? `à ${p.city}` : ''].filter(Boolean).join(' ');
  const title = `${p.name}${what ? ` : ${what}` : ''}, ${p.offer} · Bâtiplace`;
  const description = `${p.name}${what ? ` (${what})` : ''}. ${p.description} Partenaire Bâtiplace : ${p.offer} pour les abonnés.`
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
  const type = /plomb/i.test(p.category) ? 'Plumber' : /[ée]lectri/i.test(p.category) ? 'Electrician' : 'LocalBusiness';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    name: p.name,
    description: p.description || undefined,
    url,
    sameAs: p.website ? [p.website] : undefined,
    logo: p.logo_url || undefined,
    image: p.logo_url || undefined,
    telephone: p.phone || undefined,
    email: p.email || undefined,
    address: p.city
      ? { '@type': 'PostalAddress', streetAddress: p.address || undefined, addressLocality: p.city, addressRegion: 'QC', addressCountry: 'CA' }
      : undefined,
    areaServed: p.city || 'Québec',
  };

  const t = escapeHtml(title);
  const d = escapeHtml(description);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`);
  html = setTag(html, /<meta name="description"[^>]*>/, `<meta name="description" content="${d}" />`);
  html = setTag(html, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${t}" />`);
  html = setTag(html, /<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${d}" />`);
  html = setTag(html, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  if (p.logo_url) html = setTag(html, /<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${escapeHtml(p.logo_url)}" />`);
  html = setTag(html, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(
    '</head>',
    `    <script type="application/ld+json" id="page-jsonld">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>\n  </head>`,
  );
  const contact = [p.phone, p.email].filter(Boolean).map(escapeHtml).join(' · ');
  html = html.replace(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript><h1>${escapeHtml(p.name)}</h1><p>${escapeHtml(what)}</p><p>${escapeHtml(p.description)}</p>` +
      `<p>Partenaire Bâtiplace : ${escapeHtml(p.offer)} pour les abonnés Bâtiplace Illimité et LOKA.</p>` +
      (contact ? `<p>${contact}</p>` : '') +
      (p.website ? `<p><a href="${escapeHtml(p.website)}">${escapeHtml(p.website)}</a></p>` : '') +
      `<p><a href="/partenaires">Tous les partenaires Bâtiplace</a></p></noscript>`,
  );
  return html;
}

module.exports = async (req, res) => {
  const slug = String(req.query.slug || '');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  let html;
  try {
    html = await (await fetch(`https://${host}/index.html`)).text();
  } catch {
    res.statusCode = 302;
    res.setHeader('Location', '/partenaires');
    return res.end();
  }
  let status = 200;
  try {
    const partners = await rest(`partners?active=eq.true&select=${COLUMNS}`);
    const partner = partners.find((p) => slugify(p.name) === slug);
    if (partner) html = inject(html, partner);
    else {
      status = 404;
      html = html.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>');
    }
  } catch {
    // Supabase unreachable: serve the app as is, it loads the partner itself.
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  res.end(html);
};
