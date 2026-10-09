import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const icon =
  (name: IconName, active: IconName) =>
  ({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) => (
    <Ionicons name={focused ? active : name} color={color as string} size={size} />
  );

export default function TabsLayout() {
  const t = useTheme();
  const { tr } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
        tabBarLabelStyle: { fontWeight: '600' },
      }}>
      <Tabs.Screen name="index" options={{ title: tr('Explorer'), tabBarIcon: icon('search-outline', 'search') }} />
      <Tabs.Screen name="favoris" options={{ title: tr('Favoris'), tabBarIcon: icon('heart-outline', 'heart') }} />
      <Tabs.Screen name="publier" options={{ title: tr('Publier'), tabBarIcon: icon('add-circle-outline', 'add-circle') }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: icon('chatbubbles-outline', 'chatbubbles') }} />
      <Tabs.Screen name="compte" options={{ title: tr('Compte'), tabBarIcon: icon('person-outline', 'person') }} />
    </Tabs>
  );
}
