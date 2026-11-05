export type CommercialStore = {
  id: string;
  name: string;
  shortTitle: string;
  neighborhood: string;
  address: string;
  phone: string;
  whatsappDigits: string;
  hours: string;
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
  },
  {
    id: 'loja-sao-bras',
    name: 'Comercial do Norte — Matriz São Brás',
    shortTitle: 'Matriz São Brás',
    neighborhood: 'São Brás (Matriz)',
    address: 'Av. Rômulo Maiorana, 115 (antiga 25) — São Brás, Belém - PA',
    phone: '(91) 4042-0513',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 06h30 às 18h00 | Sáb: 06h30 às 12h30',
    isHeadquarter: true,
  },
  {
    id: 'loja-pedreira-mauriti',
    name: 'Comercial do Norte — Filial Mauriti Pedreira',
    shortTitle: 'Filial Mauriti (Pedreira)',
    neighborhood: 'Pedreira (Mauriti)',
    address: 'Tv. Mauriti, 1124 — Pedreira, Belém - PA',
    phone: '(91) 98344-0880',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 07h00 às 18h00 | Sáb: 07h00 às 12h30',
  },
  {
    id: 'loja-guama',
    name: 'Comercial do Norte — Filial Guamá',
    shortTitle: 'Filial Guamá',
    neighborhood: 'Guamá',
    address: 'Av. José Bonifácio, 2545 — Guamá, Belém - PA',
    phone: '(91) 98344-0880',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 07h00 às 19h00 | Sáb: 07h00 às 19h00',
  },
  {
    id: 'loja-cidade-nova',
    name: 'Comercial do Norte — Filial Cidade Nova',
    shortTitle: 'Filial Cidade Nova (Ananindeua)',
    neighborhood: 'Cidade Nova (Ananindeua)',
    address: 'Tv. WE-59, 138 — Cidade Nova, Ananindeua - PA',
    phone: '(91) 98344-0880',
    whatsappDigits: '5591983440880',
    hours: 'Seg a Sex: 07h00 às 19h00 | Sáb: 07h00 às 13h00',
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
  },
];

export const DEFAULT_STORE = COMMERCIAL_STORES[0];

export function findStoreById(id?: string | null): CommercialStore {
  if (!id) return DEFAULT_STORE;
  return COMMERCIAL_STORES.find((s) => s.id === id) || DEFAULT_STORE;
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '') || DEFAULT_STORE.whatsappDigits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
