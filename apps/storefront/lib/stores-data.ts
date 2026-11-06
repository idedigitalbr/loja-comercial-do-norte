export type CommercialStore = {
  id: string;
  name: string;
  shortTitle: string;
  neighborhood: string;
  address: string;
  phone: string;
  whatsappDigits: string;
  hours: string;
  lat: number;
  lng: number;
  cepPrefix: string;
  isHeadquarter?: boolean;
};

export const COMMERCIAL_STORES: CommercialStore[] = [
  {
    id: 'loja-jurunas',
    name: 'Comercial do Norte — Jurunas (Bernardo Sayão)',
    shortTitle: 'Bernardo Sayão (Jurunas)',
    neighborhood: 'Jurunas / Bernardo Sayão',
    address: 'Av. Bernardo Sayão, 2450 — Jurunas, Belém - PA',
    phone: '(91) 98344-0880',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 07h30 às 18h00 | Sáb: 07h30 às 14h00',
    lat: -1.4754,
    lng: -48.4641,
    cepPrefix: '66030',
  },
  {
    id: 'loja-sao-bras',
    name: 'Comercial do Norte — Matriz São Brás',
    shortTitle: 'Unidade São Brás (Matriz)',
    neighborhood: 'São Brás (Matriz)',
    address: 'Av. Rômulo Maiorana, 115 (antiga 25) — São Brás, Belém - PA',
    phone: '(91) 4042-0513',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 06h30 às 18h00 | Sáb: 06h30 às 12h30',
    lat: -1.4450,
    lng: -48.4684,
    cepPrefix: '66093',
    isHeadquarter: true,
  },
  {
    id: 'loja-pedreira-mauriti',
    name: 'Comercial do Norte — Filial Mauriti Pedreira',
    shortTitle: 'Unidade Mauriti (Pedreira)',
    neighborhood: 'Pedreira (Mauriti)',
    address: 'Tv. Mauriti, 1124 — Pedreira, Belém - PA',
    phone: '(91) 98344-0880',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 07h00 às 18h00 | Sáb: 07h00 às 12h30',
    lat: -1.4276,
    lng: -48.4730,
    cepPrefix: '66080',
  },
  {
    id: 'loja-guama',
    name: 'Comercial do Norte — Filial Guamá',
    shortTitle: 'Unidade Guamá',
    neighborhood: 'Guamá',
    address: 'Av. José Bonifácio, 2545 — Guamá, Belém - PA',
    phone: '(91) 98344-0880',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 07h00 às 19h00 | Sáb: 07h00 às 19h00',
    lat: -1.4693,
    lng: -48.4684,
    cepPrefix: '66065',
  },
  {
    id: 'loja-cidade-nova',
    name: 'Comercial do Norte — Filial Cidade Nova',
    shortTitle: 'Unidade Cidade Nova (Ananindeua)',
    neighborhood: 'Cidade Nova (Ananindeua)',
    address: 'Tv. WE-59, 138 — Cidade Nova, Ananindeua - PA',
    phone: '(91) 98344-0880',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 07h00 às 19h00 | Sáb: 07h00 às 13h00',
    lat: -1.3565,
    lng: -48.3888,
    cepPrefix: '67133',
  },
  {
    id: 'loja-atacado-delivery',
    name: 'Comercial do Norte — Vendas Online & Delivery',
    shortTitle: 'Vendas Online & Delivery (Central)',
    neighborhood: 'Atendimento Central & Logística',
    address: 'Tv. das Mercês, 158 — São Brás, Belém - PA',
    phone: '(91) 98344-0880',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 08h15 às 18h00 | Sáb: 07h30 às 12h00',
    lat: -1.4455,
    lng: -48.4674,
    cepPrefix: '66090',
  },
];

export const DEFAULT_STORE = COMMERCIAL_STORES[0];

export type NeighborhoodShortcut = {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  state: string;
  storeId: string;
  storeTitle: string;
  cep: string;
  street: string;
  lat: number;
  lng: number;
};

export const NEIGHBORHOOD_STORE_SHORTCUTS: NeighborhoodShortcut[] = [
  {
    id: 'pedreira',
    name: 'Pedreira',
    neighborhood: 'Pedreira',
    city: 'Belém',
    state: 'PA',
    storeId: 'loja-pedreira-mauriti',
    storeTitle: 'Unidade Mauriti (Pedreira)',
    cep: '66080-650',
    street: 'Travessa Mauriti',
    lat: -1.4276,
    lng: -48.4730,
  },
  {
    id: 'sao-bras',
    name: 'São Brás',
    neighborhood: 'São Brás',
    city: 'Belém',
    state: 'PA',
    storeId: 'loja-sao-bras',
    storeTitle: 'Unidade São Brás (Matriz)',
    cep: '66093-005',
    street: 'Avenida Rômulo Maiorana',
    lat: -1.4450,
    lng: -48.4684,
  },
  {
    id: 'jurunas',
    name: 'Jurunas',
    neighborhood: 'Jurunas',
    city: 'Belém',
    state: 'PA',
    storeId: 'loja-jurunas',
    storeTitle: 'Bernardo Sayão (Jurunas)',
    cep: '66030-120',
    street: 'Avenida Bernardo Sayão',
    lat: -1.4754,
    lng: -48.4641,
  },
  {
    id: 'guama',
    name: 'Guamá',
    neighborhood: 'Guamá',
    city: 'Belém',
    state: 'PA',
    storeId: 'loja-guama',
    storeTitle: 'Unidade Guamá',
    cep: '66065-360',
    street: 'Avenida José Bonifácio',
    lat: -1.4693,
    lng: -48.4684,
  },
  {
    id: 'cidade-nova',
    name: 'Cidade Nova',
    neighborhood: 'Cidade Nova',
    city: 'Ananindeua',
    state: 'PA',
    storeId: 'loja-cidade-nova',
    storeTitle: 'Unidade Cidade Nova (Ananindeua)',
    cep: '67133-013',
    street: 'Travessa WE-59',
    lat: -1.3565,
    lng: -48.3888,
  },
];

export type StoreWithDistance = CommercialStore & {
  distanceKm: number;
  formattedDistance: string;
};

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findTopNearestStores(
  lat: number,
  lng: number,
  limit = 2
): StoreWithDistance[] {
  const mapped = COMMERCIAL_STORES.map((store) => {
    const dist = calculateDistanceKm(lat, lng, store.lat, store.lng);
    const formattedDistance =
      dist < 1
        ? `${Math.round(dist * 1000)} metros`
        : `${dist.toFixed(1).replace('.', ',')} km`;
    return {
      ...store,
      distanceKm: dist,
      formattedDistance,
    };
  });

  mapped.sort((a, b) => a.distanceKm - b.distanceKm);
  return mapped.slice(0, limit);
}

export function findStoreById(id?: string | null): CommercialStore {
  if (!id) return DEFAULT_STORE;
  return COMMERCIAL_STORES.find((s) => s.id === id) || DEFAULT_STORE;
}

export function findNearestStoreByCoords(lat: number, lng: number): CommercialStore {
  let closest = DEFAULT_STORE;
  let minDistance = Number.POSITIVE_INFINITY;
  for (const store of COMMERCIAL_STORES) {
    const dLat = store.lat - lat;
    const dLng = store.lng - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDistance) {
      minDistance = dist;
      closest = store;
    }
  }
  return closest;
}

export function findNearestStoreByCep(cepRaw: string): CommercialStore {
  const digits = cepRaw.replace(/\D/g, '');
  if (digits.startsWith('67')) {
    return COMMERCIAL_STORES.find((s) => s.id === 'loja-cidade-nova') || DEFAULT_STORE;
  }
  if (digits.startsWith('6608')) {
    return COMMERCIAL_STORES.find((s) => s.id === 'loja-pedreira-mauriti') || DEFAULT_STORE;
  }
  if (digits.startsWith('6606') || digits.startsWith('6607')) {
    return COMMERCIAL_STORES.find((s) => s.id === 'loja-guama') || DEFAULT_STORE;
  }
  if (digits.startsWith('6609')) {
    return COMMERCIAL_STORES.find((s) => s.id === 'loja-sao-bras') || DEFAULT_STORE;
  }
  if (digits.startsWith('6602') || digits.startsWith('6603')) {
    return COMMERCIAL_STORES.find((s) => s.id === 'loja-jurunas') || DEFAULT_STORE;
  }
  return COMMERCIAL_STORES.find((s) => s.id === 'loja-sao-bras') || DEFAULT_STORE;
}

/**
 * Localiza a unidade mais próxima pelo nome do bairro digitado pelo cliente
 * ou pelo número de CEP informado.
 */
export function findNearestStoreByNeighborhoodOrCep(input: string): {
  store: CommercialStore;
  neighborhoodName: string;
  isCep: boolean;
} {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length >= 5) {
    const store = findNearestStoreByCep(digits);
    return {
      store,
      neighborhoodName: store.neighborhood,
      isCep: true,
    };
  }

  const norm = trimmed.toLowerCase();
  if (
    norm.includes('pedreira') ||
    norm.includes('sacramenta') ||
    norm.includes('telégrafo') ||
    norm.includes('telegrafo') ||
    norm.includes('marambaia') ||
    norm.includes('barreiro') ||
    norm.includes('val-de-cans') ||
    norm.includes('val de cans')
  ) {
    const store = findStoreById('loja-pedreira-mauriti');
    return { store, neighborhoodName: trimmed, isCep: false };
  }

  if (
    norm.includes('são brás') ||
    norm.includes('sao bras') ||
    norm.includes('marco') ||
    norm.includes('fátima') ||
    norm.includes('fatima') ||
    norm.includes('canudos') ||
    norm.includes('nazaré') ||
    norm.includes('nazare') ||
    norm.includes('umarizal') ||
    norm.includes('reduto') ||
    norm.includes('souza') ||
    norm.includes('curió') ||
    norm.includes('curio')
  ) {
    const store = findStoreById('loja-sao-bras');
    return { store, neighborhoodName: trimmed, isCep: false };
  }

  if (
    norm.includes('jurunas') ||
    norm.includes('cremação') ||
    norm.includes('cremacao') ||
    norm.includes('batista campos') ||
    norm.includes('cidade velha') ||
    norm.includes('campina') ||
    norm.includes('comércio') ||
    norm.includes('comercio') ||
    norm.includes('condor')
  ) {
    const store = findStoreById('loja-jurunas');
    return { store, neighborhoodName: trimmed, isCep: false };
  }

  if (
    norm.includes('guamá') ||
    norm.includes('guama') ||
    norm.includes('terra firme') ||
    norm.includes('universitário') ||
    norm.includes('montese')
  ) {
    const store = findStoreById('loja-guama');
    return { store, neighborhoodName: trimmed, isCep: false };
  }

  if (
    norm.includes('cidade nova') ||
    norm.includes('ananindeua') ||
    norm.includes('coqueiro') ||
    norm.includes('marituba') ||
    norm.includes('icoaraci') ||
    norm.includes('tenoné') ||
    norm.includes('tapanã') ||
    norm.includes('tapana') ||
    norm.includes('parque verde') ||
    norm.includes('benguí') ||
    norm.includes('bengui') ||
    norm.includes('mangueirão') ||
    norm.includes('mangueirao')
  ) {
    const store = findStoreById('loja-cidade-nova');
    return { store, neighborhoodName: trimmed, isCep: false };
  }

  return {
    store: findStoreById('loja-sao-bras'),
    neighborhoodName: trimmed,
    isCep: false,
  };
}

export function formatBrazilPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatCepMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '') || DEFAULT_STORE.whatsappDigits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
