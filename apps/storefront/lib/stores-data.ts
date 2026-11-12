import type { UserLocation } from './location';

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
    lat: -1.4757,
    lng: -48.4941,
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
    lat: -1.3658,
    lng: -48.4124,
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
    lat: -1.4757,
    lng: -48.4941,
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
    lat: -1.3658,
    lng: -48.4124,
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


export function formatCurrentUnitDisplay(store: CommercialStore): {
  title: string;
  street: string;
  full: string;
} {
  const street = store.address.includes('—')
    ? store.address.split('—')[0].trim()
    : store.address;
  const isAnanindeua =
    store.id === 'loja-cidade-nova' ||
    store.address.toLowerCase().includes('ananindeua') ||
    store.neighborhood.toLowerCase().includes('ananindeua');
  const cityUf = isAnanindeua ? 'Ananindeua-PA' : 'Belém-PA';

  let title = store.shortTitle;
  if (store.id === 'loja-cidade-nova' || title.includes('Ananindeua')) {
    title = title.replace('Ananindeua', 'Ananindeua-PA');
  } else if (!title.includes('(')) {
    title = `${title} (${cityUf})`;
  }

  return {
    title,
    street,
    full: `${title} (${street})`,
  };
}

export function storeToUserLocation(store: CommercialStore) {
  const isAnanindeua =
    store.id === 'loja-cidade-nova' ||
    store.address.toLowerCase().includes('ananindeua') ||
    store.neighborhood.toLowerCase().includes('ananindeua');
  const city = isAnanindeua ? 'Ananindeua' : 'Belém';
  const state = 'PA';

  const cleanNeighborhood =
    store.neighborhood
      .replace(/\s*\(.*?\)/g, '')
      .split('/')[0]
      .trim() || store.neighborhood;

  const shortLabel = `${cleanNeighborhood}, ${city}/${state}`;

  return {
    cep: `${store.cepPrefix}000`,
    neighborhood: cleanNeighborhood,
    city,
    state,
    formatted: store.address,
    shortLabel,
    lat: store.lat,
    lng: store.lng,
    source: 'manual' as const,
  };
}

type CoordPoint = { lat: number; lng: number };

const NEIGHBORHOOD_COORDINATES: Record<string, CoordPoint> = {
  umarizal: { lat: -1.4399, lng: -48.485 },
  nazare: { lat: -1.4525, lng: -48.481 },
  'batista campos': { lat: -1.4606, lng: -48.4892 },
  reduto: { lat: -1.4455, lng: -48.491 },
  campina: { lat: -1.4508, lng: -48.4997 },
  comercio: { lat: -1.4508, lng: -48.4997 },
  'cidade velha': { lat: -1.4567, lng: -48.5045 },
  jurunas: { lat: -1.4718, lng: -48.4937 },
  cremacao: { lat: -1.4622, lng: -48.4805 },
  condor: { lat: -1.4739, lng: -48.4847 },
  'sao bras': { lat: -1.4485, lng: -48.4694 },
  marco: { lat: -1.4368, lng: -48.4638 },
  fatima: { lat: -1.4437, lng: -48.4758 },
  canudos: { lat: -1.4565, lng: -48.4648 },
  pedreira: { lat: -1.4276, lng: -48.473 },
  telegrafo: { lat: -1.4258, lng: -48.4875 },
  'telegrafo sem fio': { lat: -1.4258, lng: -48.4875 },
  sacramenta: { lat: -1.4165, lng: -48.477 },
  barreiro: { lat: -1.419, lng: -48.487 },
  marambaia: { lat: -1.4045, lng: -48.4585 },
  'val de cans': { lat: -1.391, lng: -48.4795 },
  guama: { lat: -1.4693, lng: -48.4684 },
  'terra firme': { lat: -1.462, lng: -48.4545 },
  universitario: { lat: -1.473, lng: -48.452 },
  montese: { lat: -1.462, lng: -48.4545 },
  souza: { lat: -1.415, lng: -48.448 },
  castanheira: { lat: -1.407, lng: -48.438 },
  curio: { lat: -1.429, lng: -48.438 },
  'curio utinga': { lat: -1.429, lng: -48.438 },
  mangueirao: { lat: -1.385, lng: -48.445 },
  bengui: { lat: -1.377, lng: -48.456 },
  'parque verde': { lat: -1.371, lng: -48.445 },
  cabanagem: { lat: -1.375, lng: -48.435 },
  tapana: { lat: -1.351, lng: -48.465 },
  icoaraci: { lat: -1.301, lng: -48.479 },
  coqueiro: { lat: -1.368, lng: -48.426 },
  'cidade nova': { lat: -1.3658, lng: -48.4124 },
  aguas: { lat: -1.395, lng: -48.382 },
  'aguas lindas': { lat: -1.395, lng: -48.382 },
  guanabara: { lat: -1.398, lng: -48.414 },
  ananindeua: { lat: -1.3655, lng: -48.372 },
  marituba: { lat: -1.356, lng: -48.342 },
};

const SORTED_NEIGHBORHOOD_KEYS = Object.keys(NEIGHBORHOOD_COORDINATES).sort(
  (a, b) => b.length - a.length,
);

function normalizeLocationKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveCoordsByCepDigits(digits: string): CoordPoint | null {
  if (digits.length < 5) return null;
  if (digits.startsWith('673') || digits.startsWith('672')) {
    return NEIGHBORHOOD_COORDINATES.marituba;
  }
  if (digits.startsWith('671')) {
    return NEIGHBORHOOD_COORDINATES['cidade nova'];
  }
  if (digits.startsWith('670')) {
    return NEIGHBORHOOD_COORDINATES.ananindeua;
  }
  if (digits.startsWith('6605')) {
    return NEIGHBORHOOD_COORDINATES.umarizal;
  }
  if (digits.startsWith('6604')) {
    return NEIGHBORHOOD_COORDINATES.cremacao;
  }
  if (digits.startsWith('6603')) {
    return NEIGHBORHOOD_COORDINATES.jurunas;
  }
  if (digits.startsWith('6602')) {
    return NEIGHBORHOOD_COORDINATES['cidade velha'];
  }
  if (digits.startsWith('6601')) {
    return NEIGHBORHOOD_COORDINATES.campina;
  }
  if (digits.startsWith('6606') || digits.startsWith('6607')) {
    return NEIGHBORHOOD_COORDINATES.guama;
  }
  if (digits.startsWith('6608')) {
    return NEIGHBORHOOD_COORDINATES.pedreira;
  }
  if (digits.startsWith('6609')) {
    return NEIGHBORHOOD_COORDINATES['sao bras'];
  }
  if (digits.startsWith('6611') || digits.startsWith('6612')) {
    return NEIGHBORHOOD_COORDINATES.telegrafo;
  }
  if (digits.startsWith('666')) {
    return NEIGHBORHOOD_COORDINATES.marambaia;
  }
  if (digits.startsWith('668')) {
    return NEIGHBORHOOD_COORDINATES.icoaraci;
  }
  if (digits.startsWith('66')) {
    return NEIGHBORHOOD_COORDINATES.nazare;
  }
  return null;
}

export type ResolvedLocationAnchor = {
  lat: number;
  lng: number;
  precision: 'gps' | 'address' | 'neighborhood' | 'cep';
  label: string;
};

export function resolveUserLocationAnchor(
  location?: UserLocation | null,
): ResolvedLocationAnchor | null {
  if (!location) return null;

  const cepDigits = (location.cep || '').replace(/\D/g, '');
  const rawNeighborhood =
    location.neighborhood?.trim() ||
    (location.shortLabel &&
    !location.shortLabel.toLowerCase().includes('informe seu cep') &&
    !location.shortLabel.toLowerCase().startsWith('região de')
      ? location.shortLabel.split(',')[0]?.trim()
      : '');

  const isDefaultPlaceholder =
    location.source === 'default' && !rawNeighborhood && cepDigits.length < 5;
  const isGenericIp =
    location.source === 'ip' && !rawNeighborhood && cepDigits.length < 5;

  if (isDefaultPlaceholder || isGenericIp) {
    return null;
  }

  const label =
    location.shortLabel && !location.shortLabel.toLowerCase().includes('informe seu cep')
      ? location.shortLabel
      : rawNeighborhood
        ? `${rawNeighborhood}, ${location.city}/${location.state}`
        : `${location.city}/${location.state}`;

  if (
    typeof location.lat === 'number' &&
    typeof location.lng === 'number' &&
    Number.isFinite(location.lat) &&
    Number.isFinite(location.lng) &&
    (location.lat !== 0 || location.lng !== 0)
  ) {
    return {
      lat: location.lat,
      lng: location.lng,
      precision: location.source === 'gps' ? 'gps' : 'address',
      label,
    };
  }

  if (rawNeighborhood) {
    const key = normalizeLocationKey(rawNeighborhood);
    if (NEIGHBORHOOD_COORDINATES[key]) {
      return {
        ...NEIGHBORHOOD_COORDINATES[key],
        precision: 'neighborhood',
        label,
      };
    }
    const matchedKey = SORTED_NEIGHBORHOOD_KEYS.find((k) => key.includes(k));
    if (matchedKey) {
      return {
        ...NEIGHBORHOOD_COORDINATES[matchedKey],
        precision: 'neighborhood',
        label,
      };
    }
  }

  const cepCoords = resolveCoordsByCepDigits(cepDigits);
  if (cepCoords) {
    return {
      ...cepCoords,
      precision: 'cep',
      label,
    };
  }

  const cityKey = normalizeLocationKey(location.city || '');
  if (cityKey === 'belem') {
    return { ...NEIGHBORHOOD_COORDINATES.nazare, precision: 'cep', label };
  }
  if (cityKey === 'ananindeua') {
    return { ...NEIGHBORHOOD_COORDINATES['cidade nova'], precision: 'cep', label };
  }
  if (cityKey === 'marituba') {
    return { ...NEIGHBORHOOD_COORDINATES.marituba, precision: 'cep', label };
  }

  return null;
}

export function formatDistanceKm(distanceKm: number): string {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return '0,1 km';
  if (distanceKm >= 100) {
    return `${Math.round(distanceKm)} km`;
  }
  const rounded = Math.max(0.1, distanceKm);
  return `${rounded.toFixed(1).replace('.', ',')} km`;
}

export type RankedCommercialStore = CommercialStore & {
  distanceKm: number | null;
  formattedKm: string | null;
  isClosest: boolean;
  rank: number;
};

export function rankStoresByLocation(location?: UserLocation | null): {
  stores: RankedCommercialStore[];
  anchor: ResolvedLocationAnchor | null;
} {
  const anchor = resolveUserLocationAnchor(location);
  if (!anchor) {
    return {
      anchor: null,
      stores: COMMERCIAL_STORES.map((store, idx) => ({
        ...store,
        distanceKm: null,
        formattedKm: null,
        isClosest: false,
        rank: idx + 1,
      })),
    };
  }

  const withDistance = COMMERCIAL_STORES.map((store) => {
    const distanceKm = calculateDistanceKm(anchor.lat, anchor.lng, store.lat, store.lng);
    return {
      ...store,
      distanceKm,
      formattedKm: formatDistanceKm(distanceKm),
    };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    anchor,
    stores: withDistance.map((store, idx) => ({
      ...store,
      isClosest: idx === 0,
      rank: idx + 1,
    })),
  };
}

function parseHoursPair(segment: string): { startMins: number; endMins: number } | null {
  const match = segment.match(/(\d{1,2})h(\d{2})?\s*(?:às|as|-|a)\s*(\d{1,2})h(\d{2})?/i);
  if (!match) return null;
  const startMins = parseInt(match[1], 10) * 60 + parseInt(match[2] || '0', 10);
  const endMins = parseInt(match[3], 10) * 60 + parseInt(match[4] || '0', 10);
  return { startMins, endMins };
}

export function isCommercialStoreOpen(
  store: CommercialStore,
  referenceDate = new Date(),
): boolean {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Belem',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
      weekday: 'short',
    }).formatToParts(referenceDate);

    let hour = 0;
    let minute = 0;
    let weekday = '';
    for (const part of parts) {
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      if (part.type === 'minute') minute = parseInt(part.value, 10);
      if (part.type === 'weekday') weekday = part.value;
    }
    if (hour === 24) hour = 0;
    if (weekday === 'Sun') return false;

    const currentMins = hour * 60 + minute;
    const segments = store.hours.split('|');
    const targetSegment = weekday === 'Sat' ? segments[1] || segments[0] : segments[0];
    if (!targetSegment) return false;

    const parsed = parseHoursPair(targetSegment);
    if (!parsed) return false;
    return currentMins >= parsed.startMins && currentMins < parsed.endMins;
  } catch {
    return false;
  }
}

export function formatCpfCnpjMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}
