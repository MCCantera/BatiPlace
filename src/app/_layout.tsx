import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/lib/auth';
import { FavoritesProvider } from '@/lib/favorites';
import { I18nProvider, useI18n } from '@/lib/i18n';
import { LocationProvider } from '@/lib/location';
import { useTheme } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function Navigator() {
  const { ready } = useAuth();
  const t = useTheme();
  const { tr } = useI18n();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  return (
    <Stack
      screenOptions={{
        headerTintColor: t.text,
        headerStyle: { backgroundColor: t.surface },
        headerShadowVisible: false,
        headerBackTitle: tr('Retour'),
        contentStyle: { backgroundColor: t.bg },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Bâtiplace' }} />
      <Stack.Screen name="annonce/[id]" options={{ title: tr('Annonce') }} />
      <Stack.Screen name="vendeur/[id]" options={{ title: tr('Vendeur') }} />
      <Stack.Screen name="conversation/[id]" options={{ title: 'Conversation' }} />
      <Stack.Screen name="connexion" options={{ title: tr('Connexion'), presentation: 'modal' }} />
      <Stack.Screen name="abonnement" options={{ title: tr('Bâtiplace Illimité'), presentation: 'modal' }} />
      <Stack.Screen name="profil" options={{ title: tr('Mon profil') }} />
      <Stack.Screen name="partenaires" options={{ title: tr('Partenaires') }} />
      <Stack.Screen name="entrepreneurs" options={{ title: tr('Entrepreneurs') }} />
      <Stack.Screen name="devenir-partenaire" options={{ title: tr('Devenir partenaire') }} />
      <Stack.Screen name="confidentialite" options={{ title: tr('Confidentialité') }} />
      <Stack.Screen name="conditions" options={{ title: tr('Conditions d’utilisation') }} />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <I18nProvider>
        <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <LocationProvider>
              <FavoritesProvider>
                <StatusBar style="auto" />
                <Navigator />
              </FavoritesProvider>
            </LocationProvider>
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
