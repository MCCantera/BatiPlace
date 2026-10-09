// Shared by the Vercel functions that serve HTML and the sitemap to search engines.
// The publishable key is the same public key the web app ships in its bundle (.env).
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gvzroqbummpzgvzubazq.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'sb_publishable_LCmMA9Q_3vW01vvMZUWf8Q_5yb0aYnq';
const SITE_URL = 'https://www.batiplace.ca';

async function rest(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

function photoUrl(path) {
  return path ? `${SUPABASE_URL}/storage/v1/object/public/listing-photos/${path.split('/').map(encodeURIComponent).join('/')}` : null;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = { SITE_URL, rest, photoUrl, escapeHtml };
