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
  danger: '#ff6b5c',
  ok: '#5fd09a',
  okSoft: '#183327',
};

export type Palette = typeof light;

export function useTheme(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 20, pill: 999 } as const;
export const MAX_WIDTH = 1100;
