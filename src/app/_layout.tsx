import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/lib/auth';
import { FavoritesProvider } from '@/lib/favorites';
import { LocationProvider } from '@/lib/location';
import { useTheme } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function Navigator() {
  const { ready } = useAuth();
  const t = useTheme();
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);
  return (
    <Stack
      screenOptions={{
        headerTintColor: t.text,
        headerStyle: { backgroundColor: t.surface },
        headerShadowVisible: false,
        headerBackTitle: 'Retour',
        contentStyle: { backgroundColor: t.bg },
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Bâtiplace' }} />
      <Stack.Screen name="annonce/[id]" options={{ title: 'Annonce' }} />
      <Stack.Screen name="vendeur/[id]" options={{ title: 'Vendeur' }} />
      <Stack.Screen name="conversation/[id]" options={{ title: 'Conversation' }} />
      <Stack.Screen name="connexion" options={{ title: 'Connexion', presentation: 'modal' }} />
      <Stack.Screen name="abonnement" options={{ title: 'Bâtiplace Illimité', presentation: 'modal' }} />
      <Stack.Screen name="profil" options={{ title: 'Mon profil' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
