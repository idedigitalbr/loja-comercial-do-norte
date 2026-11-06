// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildFormattedAddress,
  buildShortLabel,
  cleanCep,
  formatCep,
  getReferenceCepForNeighborhood,
  getStoredLocation,
  LOCATION_STORAGE_KEY,
  lookupLocationByAddress,
  lookupLocationByCep,
  normalizeBrasilApi,
  normalizeViaCep,
  QUICK_LOCATIONS,
  saveStoredLocation,
  type UserLocation,
} from './location';

describe('location helpers', () => {
  beforeEach(() => {
    // Limpa localStorage e cookie mockados
    window.localStorage.clear();
    document.cookie = `${LOCATION_STORAGE_KEY}=; path=/; max-age=0`;
    vi.restoreAllMocks();
  });

  it('cleanCep limpa caracteres não numéricos e limita a 8 dígitos', () => {
    expect(cleanCep('66020-600')).toBe('66020600');
    expect(cleanCep('66.020-600')).toBe('66020600');
    expect(cleanCep('  66020600  ')).toBe('66020600');
    expect(cleanCep('abc-66020600xyz123')).toBe('66020600');
    expect(cleanCep('123')).toBe('123');
  });

  it('formatCep formata corretamente no padrão 00000-000', () => {
    expect(formatCep('66020600')).toBe('66020-600');
    expect(formatCep('66020')).toBe('66020');
    expect(formatCep('66020-600')).toBe('66020-600');
    expect(formatCep('')).toBe('');
  });

  it('buildShortLabel cria rótulos amigáveis para o cabeçalho', () => {
    expect(buildShortLabel({ city: 'Belém', state: 'PA', neighborhood: 'Jurunas' })).toBe('Jurunas, Belém/PA');
    expect(buildShortLabel({ city: 'Ananindeua', state: 'PA' })).toBe('Região de Ananindeua/PA');
    expect(buildShortLabel({ city: 'Belém', state: 'PA', neighborhood: '' })).toBe('Região de Belém/PA');
  });

  it('buildFormattedAddress monta o endereço completo', () => {
    const formatted = buildFormattedAddress({
      street: 'Av. Bernardo Sayão',
      neighborhood: 'Jurunas',
      city: 'Belém',
      state: 'PA',
      cep: '66030120',
    });
    expect(formatted).toBe('Av. Bernardo Sayão, Jurunas, Belém - PA, CEP 66030-120');
  });

  it('normalizeViaCep converte resposta da API do governo para UserLocation', () => {
    const viaData = {
      cep: '66020-600',
      logradouro: 'Rua Siqueira Mendes',
      bairro: 'Cidade Velha',
      localidade: 'Belém',
      uf: 'PA',
    };
    const norm = normalizeViaCep(viaData);
    expect(norm.cep).toBe('66020-600');
    expect(norm.city).toBe('Belém');
    expect(norm.state).toBe('PA');
    expect(norm.neighborhood).toBe('Cidade Velha');
    expect(norm.shortLabel).toBe('Cidade Velha, Belém/PA');
  });

  it('normalizeBrasilApi converte resposta do BrasilAPI para UserLocation', () => {
    const brasilData = {
      cep: '66020600',
      state: 'PA',
      city: 'Belém',
      neighborhood: 'Cidade Velha',
      street: 'Rua Siqueira Mendes',
    };
    const norm = normalizeBrasilApi(brasilData);
    expect(norm.cep).toBe('66020-600');
    expect(norm.city).toBe('Belém');
    expect(norm.state).toBe('PA');
    expect(norm.street).toBe('Rua Siqueira Mendes');
    expect(norm.shortLabel).toBe('Cidade Velha, Belém/PA');
  });

  it('salva e recupera a localização no cache/localStorage', () => {
    const sampleLoc: UserLocation = {
      cep: '66030-120',
      street: 'Av. Bernardo Sayão',
      neighborhood: 'Jurunas',
      city: 'Belém',
      state: 'PA',
      formatted: 'Av. Bernardo Sayão, Jurunas, Belém - PA',
      shortLabel: 'Jurunas, Belém/PA',
    };

    saveStoredLocation(sampleLoc);
    const retrieved = getStoredLocation();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.cep).toBe('66030-120');
    expect(retrieved?.city).toBe('Belém');
    expect(retrieved?.shortLabel).toBe('Jurunas, Belém/PA');
  });

  it('lookupLocationByCep consulta via api/fallback e retorna endereço', async () => {
    vi.spyOn(global, 'fetch').mockImplementationOnce(async () => {
      return {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            cep: '66020-600',
            city: 'Belém',
            state: 'PA',
            neighborhood: 'Cidade Velha',
            street: 'Rua Siqueira Mendes',
            shortLabel: 'Cidade Velha, Belém/PA',
            formatted: 'Rua Siqueira Mendes, Cidade Velha, Belém - PA, CEP 66020-600',
          },
        }),
      } as unknown as Response;
    });

    const result = await lookupLocationByCep('66020600');
    expect(result.cep).toBe('66020-600');
    expect(result.city).toBe('Belém');
    expect(result.state).toBe('PA');
  });

  it('lookupLocationByAddress valida campos obrigatórios', async () => {
    await expect(lookupLocationByAddress({ uf: '', city: 'Belém', street: 'Bernardo' })).rejects.toThrow(
      'Selecione um Estado (UF) válido.'
    );
    await expect(lookupLocationByAddress({ uf: 'PA', city: 'B', street: 'Bernardo' })).rejects.toThrow(
      'Informe o nome da cidade (mínimo 3 letras).'
    );
    await expect(lookupLocationByAddress({ uf: 'PA', city: 'Belém', street: 'Be' })).rejects.toThrow(
      'Informe o nome da rua ou avenida (mínimo 3 letras).'
    );
  });

  it('getReferenceCepForNeighborhood retorna CEP correto por bairro sem forçar Cidade Velha', () => {
    expect(getReferenceCepForNeighborhood('Pedreira')).toBe('66080-650');
    expect(getReferenceCepForNeighborhood('Sacramenta')).toBe('66080-650');
    expect(getReferenceCepForNeighborhood('São Brás')).toBe('66093-005');
    expect(getReferenceCepForNeighborhood('Jurunas')).toBe('66030-120');
    expect(getReferenceCepForNeighborhood('Guamá')).toBe('66065-360');
    expect(getReferenceCepForNeighborhood('Cidade Nova', 'Ananindeua')).toBe('67133-013');
    expect(getReferenceCepForNeighborhood('Cidade Velha')).toBe('66020-600');
    expect(getReferenceCepForNeighborhood('Bairro Inexistente')).toBe('');
  });

  it('QUICK_LOCATIONS inclui Pedreira com coordenadas e CEP corretos', () => {
    const pedreira = QUICK_LOCATIONS.find((loc) => loc.neighborhood === 'Pedreira');
    expect(pedreira).toBeDefined();
    expect(pedreira?.cep).toBe('66080-650');
    expect(pedreira?.street).toBe('Travessa Mauriti');
    expect(pedreira?.lat).toBeCloseTo(-1.4276, 2);
    expect(pedreira?.lng).toBeCloseTo(-48.473, 2);
  });
});
