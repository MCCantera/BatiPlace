import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { Button, Empty, H1, Screen } from './ui';

import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

export function RequireAuth({ title, reason, children }: { title: string; reason: string; children: ReactNode }) {
  const { userId } = useAuth();
  const { tr } = useI18n();
  if (userId) return <>{children}</>;
  return (
    <Screen>
      <H1>{tr(title)}</H1>
      <Empty
        title={tr('Connectez-vous pour continuer')}
        body={tr(reason)}
        action={<Button label={tr('Se connecter ou créer un compte')} onPress={() => router.push('/connexion')} />}
      />
    </Screen>
  );
}
