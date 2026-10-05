import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { CITIES } from './catalog';

type Origin = { label: string; lat: number; lng: number; fromDevice: boolean };

type LocationState = {
  origin: Origin;
  radiusKm: number;
  setRadiusKm: (km: number) => void;
  setCity: (city: string) => void;
  useDeviceLocation: () => Promise<boolean>;
};

const DEFAULT: Origin = { label: 'Montréal', ...CITIES['Montréal'], fromDevice: false };
const STORE_KEY = 'batiplace.origin';

const LocationContext = createContext<LocationState | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState<Origin>(DEFAULT);
  const [radiusKm, setRadiusKm] = useState(100);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY)
      .then((raw) => raw && setOrigin(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const save = useCallback((o: Origin) => {
    setOrigin(o);
    AsyncStorage.setItem(STORE_KEY, JSON.stringify(o)).catch(() => {});
  }, []);

  const setCity = useCallback(
    (city: string) => {
      const c = CITIES[city];
      if (c) save({ label: city, ...c, fromDevice: false });
    },
    [save],
  );

  const useDeviceLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return false;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      save({ label: 'Ma position', lat: pos.coords.latitude, lng: pos.coords.longitude, fromDevice: true });
      return true;
    } catch {
      return false;
    }
  }, [save]);

  const value = useMemo(
    () => ({ origin, radiusKm, setRadiusKm, setCity, useDeviceLocation }),
    [origin, radiusKm, setCity, useDeviceLocation],
  );
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useOrigin() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useOrigin must be used inside LocationProvider');
  return ctx;
}
