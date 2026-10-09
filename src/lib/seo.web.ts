import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, type Seo } from './seo-shared';

export * from './seo-shared';

function setMeta(attr: 'name' | 'property', key: string, content: string | null) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (content == null) return el?.remove();
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (href == null) return el?.remove();
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(data: Record<string, unknown> | null | undefined) {
  let el = document.getElementById('page-jsonld');
  if (!data) return el?.remove();
  if (!el) {
    el = document.createElement('script');
    el.id = 'page-jsonld';
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Updates the tags already in index.html (or injected by api/annonce.js) instead of adding duplicates.
 * Runs on focus so switching back to a tab restores its own title.
 */
export function useSeo({ title, description, path, image, noindex, pending, jsonLd }: Seo) {
  const json = jsonLd ? JSON.stringify(jsonLd) : '';
  useFocusEffect(
    useCallback(() => {
      if (pending) return;
      const fullTitle = title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Le marketplace de la construction au Québec`;
      const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 300);
      const url = path ? SITE_URL + path : null;
      document.title = fullTitle;
      setMeta('name', 'description', desc);
      setMeta('name', 'robots', noindex ? 'noindex' : null);
      setLink('canonical', noindex ? null : url);
      setMeta('property', 'og:title', fullTitle);
      setMeta('property', 'og:description', desc);
      setMeta('property', 'og:url', url ?? SITE_URL);
      setMeta('property', 'og:image', image || `${SITE_URL}/og-image.png`);
      setJsonLd(json ? JSON.parse(json) : null);
    }, [title, description, path, image, noindex, pending, json]),
  );
}
