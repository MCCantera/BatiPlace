import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { Button, Empty, H1, Screen } from './ui';

import { useAuth } from '@/lib/auth';

export function RequireAuth({ title, reason, children }: { title: string; reason: string; children: ReactNode }) {
  const { userId } = useAuth();
  if (userId) return <>{children}</>;
  return (
    <Screen>
      <H1>{title}</H1>
      <Empty
        title="Connectez-vous pour continuer"
        body={reason}
        action={<Button label="Se connecter ou créer un compte" onPress={() => router.push('/connexion')} />}
      />
    </Screen>
  );
}
