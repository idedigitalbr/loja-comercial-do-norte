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
  clearStoredLocation,
  getStoredLocation,
  reverseGeocodeCoordinates,
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
  // Se ainda não houver localização salva, solicita permissão nativa de GPS ao entrar no site
  useEffect(() => {
    let isCancelled = false;
    const stored = getStoredLocation();

    if (stored && stored.source !== 'default' && stored.source !== 'ip') {
      setLocationState(stored);
      setIsHydrated(true);
    } else {
      setIsHydrated(true);
      // Solicita a localização do navegador (GPS de alta precisão com OpenStreetMap/Nominatim para identificar o bairro real)
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (isCancelled) return;
            try {
              const { latitude, longitude } = pos.coords;
              const fullLoc = await reverseGeocodeCoordinates(latitude, longitude);
              if (!isCancelled && fullLoc) {
                const latestStored = getStoredLocation();
                if (!latestStored || latestStored.source === 'default' || latestStored.source === 'ip') {
                  setLocationState(fullLoc);
                  saveStoredLocation(fullLoc);
                }
              }
            } catch {
              // Permanece com 'Informe seu CEP'
            }
          },
          () => {
            // Permissão negada ou ignorada: permanece com 'Informe seu CEP'
          },
          { timeout: 8000, enableHighAccuracy: true }
        );
      }
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
    if (newLoc.source === 'default') {
      setLocationState(DEFAULT_LOCATION);
      clearStoredLocation();
      return;
    }
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
