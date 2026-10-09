// /sitemap.xml: the public pages plus every active listing and the sellers who have one, read live from Supabase.
const { SITE_URL, rest } = require('./_shared');

const STATIC_PAGES = [
  ['/', 'daily', '1.0'],
  ['/entrepreneurs', 'weekly', '0.8'],
  ['/publier', 'monthly', '0.8'],
  ['/partenaires', 'weekly', '0.6'],
  ['/abonnement', 'monthly', '0.5'],
];

module.exports = async (_req, res) => {
  const urls = STATIC_PAGES.map(([path, changefreq, priority]) => ({ loc: SITE_URL + path, changefreq, priority }));
  try {
    const listings = await rest('listings?status=eq.active&select=id,seller_id,updated_at&order=updated_at.desc&limit=45000');
    const sellers = new Map();
    for (const l of listings) {
      urls.push({ loc: `${SITE_URL}/annonce/${l.id}`, lastmod: l.updated_at, changefreq: 'weekly', priority: '0.7' });
      if (!sellers.has(l.seller_id)) sellers.set(l.seller_id, l.updated_at);
    }
    for (const [id, lastmod] of sellers) urls.push({ loc: `${SITE_URL}/vendeur/${id}`, lastmod, changefreq: 'weekly', priority: '0.4' });
  } catch {
    // Supabase unreachable: still serve the static pages.
  }
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    )
    .join('\n');
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
  res.end(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`);
};
