import type { Seo } from './seo-shared';

export * from './seo-shared';

/** Native screens have no <head>: search engines only see the web site. */
export function useSeo(_seo: Seo) {}
