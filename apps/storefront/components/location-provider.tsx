'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  DEFAULT_LOCATION,
  detectLocationByIp,
  getStoredLocation,
  saveStoredLocation,
  type UserLocation,
} from '../lib/location';

type LocationContextValue = {
  location: UserLocation;
  setLocation: (loc: UserLocation) => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  isHydrated: boolean;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<UserLocation>(DEFAULT_LOCATION);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Inicializa a partir do localStorage / cookie ao montar no cliente
  // Caso o visitante ainda não tenha definido uma localização manual, detecta automaticamente pelo IP (estilo Magazine Luiza)
  useEffect(() => {
    let isCancelled = false;
    const stored = getStoredLocation();

    if (stored) {
      setLocationState(stored);
      setIsHydrated(true);
    } else {
      setIsHydrated(true);
      void detectLocationByIp().then((autoLoc) => {
        if (isCancelled || !autoLoc) return;
        // Só aplica a localização automática se o usuário não tiver salvo outra manualmente enquanto buscava
        const latestStored = getStoredLocation();
        if (!latestStored || latestStored.source === 'ip' || latestStored.source === 'default') {
          setLocationState(autoLoc);
          saveStoredLocation(autoLoc);
        }
      });
    }

    function handleLocationChange(e: Event) {
      const customEvent = e as CustomEvent<UserLocation>;
      if (customEvent.detail) {
        setLocationState(customEvent.detail);
      }
    }

    window.addEventListener('cn-location-changed', handleLocationChange);
    return () => {
      isCancelled = true;
      window.removeEventListener('cn-location-changed', handleLocationChange);
    };
  }, []);

  const setLocation = useCallback((newLoc: UserLocation) => {
    const manualLoc: UserLocation = {
      ...newLoc,
      source: newLoc.source || 'manual',
    };
    setLocationState(manualLoc);
    saveStoredLocation(manualLoc);
  }, []);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        isModalOpen,
        openModal,
        closeModal,
        isHydrated,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error('useUserLocation deve ser utilizado dentro de um <LocationProvider>');
  }
  return ctx;
}

export function useOptionalUserLocation(): LocationContextValue | null {
  return useContext(LocationContext);
}
