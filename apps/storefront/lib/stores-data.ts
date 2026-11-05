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
    lat: -1.4718,
    lng: -48.4945,
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
    lat: -1.4488,
    lng: -48.4682,
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
    lat: -1.4342,
    lng: -48.4685,
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
    lat: -1.4648,
    lng: -48.4721,
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
    lat: -1.3561,
    lng: -48.4042,
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
    lat: -1.4512,
    lng: -48.4715,
    cepPrefix: '66090',
  },
];

export const DEFAULT_STORE = COMMERCIAL_STORES[0];

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
