export type UserLocation = {
  cep: string;
  street?: string;
  neighborhood?: string;
  city: string;
  state: string;
  formatted: string;
  shortLabel: string;
  lat?: number;
  lng?: number;
  source?: 'manual' | 'gps' | 'ip' | 'default';
};

export const DEFAULT_LOCATION: UserLocation = {
  cep: '',
  street: '',
  neighborhood: '',
  city: 'Belém',
  state: 'PA',
  formatted: 'Região de Belém - PA',
  shortLabel: 'Informe seu CEP',
  source: 'default',
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
      if (
        parsed &&
        (parsed.city || parsed.shortLabel) &&
        parsed.source !== 'ip' &&
        parsed.source !== 'default'
      ) {
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
      if (
        parsed &&
        (parsed.city || parsed.shortLabel) &&
        parsed.source !== 'ip' &&
        parsed.source !== 'default'
      ) {
        return parsed as UserLocation;
      }
    }
  } catch {
    // Falha silenciosa de cookie
  }

  return null;
}

/**
 * Remove a localização gravada no localStorage e cookie e notifica a aplicação
 */
export function clearStoredLocation(): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch {
    // Falha silenciosa
  }

  try {
    document.cookie = `${LOCATION_STORAGE_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // Falha silenciosa
  }

  try {
    window.dispatchEvent(new CustomEvent('cn-location-changed', { detail: DEFAULT_LOCATION }));
  } catch {
    // Falha silenciosa
  }
}

/**
 * Grava a localização no localStorage e cookie (válido por 1 ano)
 */
export function saveStoredLocation(loc: UserLocation): void {
  if (typeof window === 'undefined') return;

  if (loc.source === 'default') {
    clearStoredLocation();
    return;
  }

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
  location?: {
    coordinates?: {
      latitude?: string | number | null;
      longitude?: string | number | null;
    };
  };
}): UserLocation {
  const cep = formatCep(data.cep);
  const city = data.city || 'Belém';
  const state = (data.state || 'PA').toUpperCase();
  const street = data.street || '';
  const neighborhood = data.neighborhood || '';
  const rawLat = data.location?.coordinates?.latitude;
  const rawLng = data.location?.coordinates?.longitude;
  const parsedLat = rawLat !== undefined && rawLat !== null && rawLat !== '' ? Number(rawLat) : NaN;
  const parsedLng = rawLng !== undefined && rawLng !== null && rawLng !== '' ? Number(rawLng) : NaN;
  const hasCoords =
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLng) &&
    (parsedLat !== 0 || parsedLng !== 0);

  return {
    cep,
    street,
    neighborhood,
    city,
    state,
    formatted: buildFormattedAddress({ street, neighborhood, city, state, cep }),
    shortLabel: buildShortLabel({ city, state, neighborhood }),
    ...(hasCoords ? { lat: parsedLat, lng: parsedLng } : {}),
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

/**
 * Mapeia bairros conhecidos da Grande Belém para o CEP de referência da região
 * para evitar atribuir CEP de outros bairros (ex: Cidade Velha) quando o GPS identifica o bairro real.
 */
export function getReferenceCepForNeighborhood(neighborhood: string, city = 'Belém'): string {
  const norm = (neighborhood || '').toLowerCase().trim();
  if (
    norm.includes('pedreira') ||
    norm.includes('sacramenta') ||
    norm.includes('telégrafo') ||
    norm.includes('telegrafo')
  ) {
    return '66080-650';
  }
  if (
    norm.includes('são brás') ||
    norm.includes('sao bras') ||
    norm.includes('marco') ||
    norm.includes('fátima') ||
    norm.includes('fatima')
  ) {
    return '66093-005';
  }
  if (
    norm.includes('jurunas') ||
    norm.includes('batista campos') ||
    norm.includes('cremação') ||
    norm.includes('cremacao')
  ) {
    return '66030-120';
  }
  if (
    norm.includes('guamá') ||
    norm.includes('guama') ||
    norm.includes('terra firme') ||
    norm.includes('canudos')
  ) {
    return '66065-360';
  }
  if (norm.includes('cidade nova') || (city && city.toLowerCase().includes('ananindeua'))) {
    return '67133-013';
  }
  if (
    norm.includes('cidade velha') ||
    norm.includes('reduto') ||
    norm.includes('campina') ||
    norm.includes('nazaré') ||
    norm.includes('nazare')
  ) {
    return '66020-600';
  }
  return '';
}

/**
 * Converte coordenadas GPS (latitude/longitude) em UserLocation (bairro/cidade/CEP)
 * usando APIs públicas de geocodificação reversa (BigDataCloud + OpenStreetMap Nominatim).
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<UserLocation | null> {
  // 1. Tenta OpenStreetMap Nominatim primeiro (máxima precisão de bairros/suburb, ruas e CEPs em Belém e Ananindeua)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        signal: controller.signal,
        headers: {
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'User-Agent': 'LojaComercialDoNorte/1.0',
        },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data?.address || {};
      const postcode = addr.postcode ? cleanCep(String(addr.postcode)) : '';
      const city = addr.city || addr.town || addr.municipality || 'Belém';
      const state = (
        addr['ISO3166-2-lvl4']?.replace('BR-', '') ||
        addr.state_code ||
        'PA'
      ).toUpperCase();
      const street = addr.road || '';
      const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || '';
      const fallbackCep = neighborhood
        ? getReferenceCepForNeighborhood(neighborhood, city)
        : '';
      const cep = postcode.length === 8 ? formatCep(postcode) : fallbackCep;

      return {
        cep,
        street,
        neighborhood,
        city,
        state,
        formatted: buildFormattedAddress({ street, neighborhood, city, state, cep }),
        shortLabel: buildShortLabel({ city, state, neighborhood }),
        lat,
        lng,
        source: 'gps',
      };
    }
  } catch {
    // Segue para BigDataCloud
  }

  // 2. Fallback BigDataCloud (rápido, sem chave de API)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || 'Belém';
      const stateRaw =
        typeof data.principalSubdivisionCode === 'string' &&
        data.principalSubdivisionCode.includes('-')
          ? data.principalSubdivisionCode.split('-')[1]
          : 'PA';
      const state = (stateRaw || 'PA').toUpperCase();
      const neighborhood =
        data.locality && data.locality !== city ? data.locality : '';
      const postcode = data.postcode ? cleanCep(String(data.postcode)) : '';
      const fallbackCep = neighborhood
        ? getReferenceCepForNeighborhood(neighborhood, city)
        : '';
      const cep = postcode.length === 8 ? formatCep(postcode) : fallbackCep;

      return {
        cep,
        street: '',
        neighborhood,
        city,
        state,
        formatted: buildFormattedAddress({ neighborhood, city, state, cep }),
        shortLabel: buildShortLabel({ city, state, neighborhood }),
        lat,
        lng,
        source: 'gps',
      };
    }
  } catch {
    // Ignora falha
  }

  return null;
}

/**
 * Detecta automaticamente a localização aproximada do visitante ao abrir o site (estilo Magazine Luiza),
 * sem exigir popup de permissão do navegador, usando a rota /api/location?mode=ip e fallback de IP.
 * Se o provedor não informar bairro nem CEP exato, mantém vazio para evitar inventar CEP ou bairro errado.
 */
export async function detectLocationByIp(): Promise<UserLocation | null> {
  // 1. Tenta rota interna /api/location?mode=ip (lê headers geo da CDN/Vercel ou consulta serviço IP)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('/api/location?mode=ip', {
      signal: controller.signal,
      headers: { accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.data && json.data.city) {
        return {
          ...(json.data as UserLocation),
          source: 'ip',
        };
      }
    }
  } catch {
    // Segue para fallback cliente
  }

  // 2. Fallback direto no cliente via ipwho.is (HTTPS gratuito, sem chave, retorna lat/lng/postal/city)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('https://ipwho.is/?lang=pt-BR', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && data.city) {
        const city = String(data.city || 'Belém');
        const state = String(data.region_code || 'PA').toUpperCase();
        // Na detecção automática por IP, nunca injeta CEP genérico da telecom/provedor (ex: 66020-250)
        const cep = '';
        const lat = typeof data.latitude === 'number' ? data.latitude : undefined;
        const lng = typeof data.longitude === 'number' ? data.longitude : undefined;

        return {
          cep,
          street: '',
          neighborhood: '',
          city,
          state,
          formatted: `Região de ${city} - ${state}`,
          shortLabel: `Região de ${city}/${state}`,
          lat,
          lng,
          source: 'ip',
        };
      }
    }
  } catch {
    // Ignora falha em modo offline ou teste
  }

  return null;
}
