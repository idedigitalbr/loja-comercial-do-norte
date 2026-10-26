export type UserLocation = {
  cep: string;
  street?: string;
  neighborhood?: string;
  city: string;
  state: string;
  formatted: string;
  shortLabel: string;
};

export const DEFAULT_LOCATION: UserLocation = {
  cep: '66020-600',
  street: 'Rua Siqueira Mendes',
  neighborhood: 'Cidade Velha',
  city: 'Belém',
  state: 'PA',
  formatted: 'Cidade Velha, Belém - PA (66020-600)',
  shortLabel: 'Região de Belém/PA',
};

export const BRAZIL_STATES: Array<{ uf: string; name: string }> = [
  { uf: 'PA', name: 'Pará' },
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

export const QUICK_LOCATIONS: UserLocation[] = [
  {
    cep: '66020-600',
    street: 'Rua Siqueira Mendes',
    neighborhood: 'Cidade Velha',
    city: 'Belém',
    state: 'PA',
    formatted: 'Cidade Velha, Belém - PA',
    shortLabel: 'Belém (Centro/Cidade Velha)',
  },
  {
    cep: '66030-120',
    street: 'Avenida Bernardo Sayão',
    neighborhood: 'Jurunas',
    city: 'Belém',
    state: 'PA',
    formatted: 'Avenida Bernardo Sayão, Jurunas, Belém - PA',
    shortLabel: 'Belém (Jurunas / Bernardo Sayão)',
  },
  {
    cep: '67000-000',
    street: '',
    neighborhood: 'Centro',
    city: 'Ananindeua',
    state: 'PA',
    formatted: 'Centro, Ananindeua - PA',
    shortLabel: 'Ananindeua/PA',
  },
  {
    cep: '67200-000',
    street: '',
    neighborhood: 'Centro',
    city: 'Marituba',
    state: 'PA',
    formatted: 'Centro, Marituba - PA',
    shortLabel: 'Marituba/PA',
  },
];

export const LOCATION_STORAGE_KEY = 'cn_user_location';

/**
 * Remove qualquer caractere não numérico e limita a 8 dígitos
 */
export function cleanCep(value: string): string {
  return value.replace(/\D/g, '').slice(0, 8);
}

/**
 * Formata CEP no padrão 00000-000
 */
export function formatCep(value: string): string {
  const digits = cleanCep(value);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
}

/**
 * Monta o rótulo curto para exibição no cabeçalho (ex: "Belém/PA" ou "Jurunas, Belém/PA")
 */
export function buildShortLabel(loc: { city: string; state: string; neighborhood?: string }): string {
  if (loc.neighborhood && loc.neighborhood.trim()) {
    return `${loc.neighborhood}, ${loc.city}/${loc.state}`;
  }
  return `Região de ${loc.city}/${loc.state}`;
}

/**
 * Monta o texto formatado completo
 */
export function buildFormattedAddress(loc: {
  street?: string;
  neighborhood?: string;
  city: string;
  state: string;
  cep: string;
}): string {
  const parts: string[] = [];
  if (loc.street?.trim()) parts.push(loc.street.trim());
  if (loc.neighborhood?.trim()) parts.push(loc.neighborhood.trim());
  parts.push(`${loc.city} - ${loc.state}`);
  if (loc.cep) parts.push(`CEP ${formatCep(loc.cep)}`);
  return parts.join(', ');
}

/**
 * Recupera localização salva no localStorage ou cookies
 */
export function getStoredLocation(): UserLocation | null {
  if (typeof window === 'undefined') return null;

  try {
    const rawLocal = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed && parsed.city && parsed.state) {
        return parsed as UserLocation;
      }
    }
  } catch {
    // Falha silenciosa de JSON ou localStorage bloqueado
  }

  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${LOCATION_STORAGE_KEY}=([^;]*)`));
    if (match && match[1]) {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      if (parsed && parsed.city && parsed.state) {
        return parsed as UserLocation;
      }
    }
  } catch {
    // Falha silenciosa de cookie
  }

  return null;
}

/**
 * Grava a localização no localStorage e cookie (válido por 1 ano)
 */
export function saveStoredLocation(loc: UserLocation): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // Ignora se localStorage estiver desabilitado
  }

  try {
    const serialized = encodeURIComponent(JSON.stringify(loc));
    // 365 dias em segundos
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCATION_STORAGE_KEY}=${serialized}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch {
    // Ignora se cookie estiver desabilitado
  }

  // Notifica quaisquer listeners na página
  try {
    window.dispatchEvent(new CustomEvent('cn-location-changed', { detail: loc }));
  } catch {
    // Navegador antigo
  }
}

/**
 * Normaliza um endereço do ViaCEP para UserLocation
 */
export function normalizeViaCep(data: {
  cep: string;
  logradouro?: string;
  bairro?: string;
  localidade: string;
  uf: string;
}): UserLocation {
  const cep = formatCep(data.cep);
  const city = data.localidade || 'Belém';
  const state = (data.uf || 'PA').toUpperCase();
  const street = data.logradouro || '';
  const neighborhood = data.bairro || '';

  return {
    cep,
    street,
    neighborhood,
    city,
    state,
    formatted: buildFormattedAddress({ street, neighborhood, city, state, cep }),
    shortLabel: buildShortLabel({ city, state, neighborhood }),
  };
}

/**
 * Normaliza resposta do BrasilAPI para UserLocation
 */
export function normalizeBrasilApi(data: {
  cep: string;
  state: string;
  city: string;
  neighborhood?: string;
  street?: string;
}): UserLocation {
  const cep = formatCep(data.cep);
  const city = data.city || 'Belém';
  const state = (data.state || 'PA').toUpperCase();
  const street = data.street || '';
  const neighborhood = data.neighborhood || '';

  return {
    cep,
    street,
    neighborhood,
    city,
    state,
    formatted: buildFormattedAddress({ street, neighborhood, city, state, cep }),
    shortLabel: buildShortLabel({ city, state, neighborhood }),
  };
}

/**
 * Busca dados de localização a partir do CEP (com fallback automático)
 */
export async function lookupLocationByCep(cepInput: string): Promise<UserLocation> {
  const clean = cleanCep(cepInput);
  if (clean.length !== 8) {
    throw new Error('Informe um CEP válido com 8 dígitos.');
  }

  // 1. Tentar primeiro via rota interna do Next.js se disponível
  try {
    const res = await fetch(`/api/location?cep=${clean}`, {
      headers: { accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.data) {
        return data.data as UserLocation;
      }
    }
  } catch {
    // Fallback para fetch direto de APIs públicas
  }

  // 2. Fallback direto BrasilAPI
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return normalizeBrasilApi(data);
    }
  } catch {
    // Tenta ViaCEP
  }

  // 3. Fallback direto ViaCEP
  const viaRes = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  if (!viaRes.ok) {
    throw new Error('Não foi possível consultar o CEP no momento.');
  }
  const viaData = await viaRes.json();
  if (viaData.erro) {
    throw new Error('CEP não encontrado. Verifique o número digitado ou busque pelo endereço.');
  }
  return normalizeViaCep(viaData);
}

/**
 * Busca CEPs a partir do endereço (UF, Cidade, Logradouro) via ViaCEP
 */
export async function lookupLocationByAddress(params: {
  uf: string;
  city: string;
  street: string;
}): Promise<UserLocation[]> {
  const uf = params.uf.trim().toUpperCase();
  const city = params.city.trim();
  const street = params.street.trim();

  if (!uf || uf.length !== 2) {
    throw new Error('Selecione um Estado (UF) válido.');
  }
  if (!city || city.length < 3) {
    throw new Error('Informe o nome da cidade (mínimo 3 letras).');
  }
  if (!street || street.length < 3) {
    throw new Error('Informe o nome da rua ou avenida (mínimo 3 letras).');
  }

  // 1. Tentar rota interna
  try {
    const query = new URLSearchParams({ uf, city, street }).toString();
    const res = await fetch(`/api/location?${query}`, {
      headers: { accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.results)) {
        return data.results as UserLocation[];
      }
    }
  } catch {
    // Fallback direto
  }

  // 2. Fallback direto ViaCEP
  const url = `https://viacep.com.br/ws/${uf}/${encodeURIComponent(city)}/${encodeURIComponent(street)}/json/`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Não foi possível buscar endereços no momento.');
  }
  const list = await res.json();
  if (!Array.isArray(list) || list.length === 0) {
    return [];
  }

  return list.slice(0, 15).map(normalizeViaCep);
}
