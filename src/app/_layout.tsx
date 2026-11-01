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
        // Barre de navigation fondue dans le fond de l'écran, comme les grands titres d'iOS.
        headerStyle: { backgroundColor: t.bg },
        headerTitleStyle: { fontSize: 17, fontWeight: '600' },
        headerShadowVisible: false,
        headerBackTitle: tr('Retour'),
        contentStyle: { backgroundColor: t.bg },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Bâtiplace' }} />
      <Stack.Screen name="annonce/[id]" options={{ title: tr('Annonce') }} />
      <Stack.Screen name="vendeur/[id]" options={{ title: tr('Vendeur') }} />
      <Stack.Screen name="conversation/[id]" options={{ title: 'Conversation' }} />
      <Stack.Screen name="connexion" options={{ title: tr('Connexion'), presentation: 'modal', headerTitle: '' }} />
      <Stack.Screen name="abonnement" options={{ title: tr('Bâtiplace Illimité'), presentation: 'modal', headerTitle: '' }} />
      <Stack.Screen name="profil" options={{ title: tr('Mon profil') }} />
      <Stack.Screen name="partenaires" options={{ title: tr('Partenaires'), headerTitle: '' }} />
      <Stack.Screen name="partenaires/[slug]" options={{ title: tr('Partenaire') }} />
      <Stack.Screen name="entrepreneurs" options={{ title: tr('Entrepreneurs'), headerTitle: '' }} />
      <Stack.Screen name="marketplace-construction" options={{ title: 'Bâtiplace' }} />
      <Stack.Screen name="outils-usages" options={{ title: 'Bâtiplace' }} />
      <Stack.Screen name="materiaux-usages" options={{ title: 'Bâtiplace' }} />
      <Stack.Screen name="surplus-de-chantier" options={{ title: 'Bâtiplace' }} />
      <Stack.Screen name="bois-usage" options={{ title: 'Bâtiplace' }} />
      <Stack.Screen name="portes-fenetres-usagees" options={{ title: 'Bâtiplace' }} />
      <Stack.Screen name="machinerie-usagee" options={{ title: 'Bâtiplace' }} />
      <Stack.Screen name="plomberie-electricite-usagee" options={{ title: 'Bâtiplace' }} />
      <Stack.Screen name="devenir-partenaire" options={{ title: tr('Devenir partenaire'), headerTitle: '' }} />
      <Stack.Screen name="confidentialite" options={{ title: tr('Confidentialité'), headerTitle: '' }} />
      <Stack.Screen name="conditions" options={{ title: tr('Conditions d’utilisation'), headerTitle: '' }} />
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
