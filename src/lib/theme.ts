import { useColorScheme } from 'react-native';

const light = {
  bg: '#f5f7f2',
  surface: '#ffffff',
  surface2: '#edf1e9',
  line: '#dfe5da',
  text: '#1e2a24',
  muted: '#5d6b63',
  brand: '#0f5b55',
  brandText: '#ffffff',
  accent: '#ff6a3d',
  accentText: '#ffffff',
  accentSoft: '#ffe8de',
  /** Orange for text and links: the brand orange is too light to read as text (HIG asks 4.5:1). */
  accentInk: '#c2410c',
  danger: '#d63c2f',
  ok: '#23845a',
  okSoft: '#e0f3e8',
};

const dark: typeof light = {
  bg: '#121a17',
  surface: '#1a2420',
  surface2: '#22302a',
  line: '#2f3d36',
  text: '#eaf0ec',
  muted: '#9db0a6',
  brand: '#3fb8a9',
  brandText: '#0d1613',
  accent: '#ff7d55',
  accentText: '#1a0e09',
  accentSoft: '#3a2219',
  accentInk: '#ff8f6b',
  danger: '#ff6b5c',
  ok: '#5fd09a',
  okSoft: '#183327',
};

export type Palette = typeof light;

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

// Grille de 4 pt (Apple HIG) : tous les espacements en sont des multiples.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const;
/** Zone tactile minimale recommandée par Apple : 44 × 44 pt. */
export const TOUCH = 44;

/**
 * Échelle typographique calquée sur les styles de texte d'iOS (Large Title, Title 1…Caption).
 * Chaque style fixe taille, interligne et graisse, pour une hiérarchie constante d'un écran à l'autre.
 */
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: -0.6 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.4 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.3 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: -0.2 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const;
export const MAX_WIDTH = 1100;
