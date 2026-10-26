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
  getStoredLocation,
  saveStoredLocation,
  type UserLocation,
} from '@/lib/location';

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
  useEffect(() => {
    const stored = getStoredLocation();
    if (stored) {
      setLocationState(stored);
    }
    setIsHydrated(true);

    function handleLocationChange(e: Event) {
      const customEvent = e as CustomEvent<UserLocation>;
      if (customEvent.detail) {
        setLocationState(customEvent.detail);
      }
    }

    window.addEventListener('cn-location-changed', handleLocationChange);
    return () => {
      window.removeEventListener('cn-location-changed', handleLocationChange);
    };
  }, []);

  const setLocation = useCallback((newLoc: UserLocation) => {
    setLocationState(newLoc);
    saveStoredLocation(newLoc);
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
