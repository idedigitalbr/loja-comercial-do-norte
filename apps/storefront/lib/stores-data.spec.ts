import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCATION, type UserLocation } from './location';
import {
  COMMERCIAL_STORES,
  formatCpfCnpjMask,
  formatDistanceKm,
  rankStoresByLocation,
} from './stores-data';

describe('stores-data proximity & formatting', () => {
  it('retorna lista padrão sem distâncias quando o usuário ainda não informou localização', () => {
    const result = rankStoresByLocation(DEFAULT_LOCATION);

    expect(result.anchor).toBeNull();
    expect(result.stores).toHaveLength(COMMERCIAL_STORES.length);
    expect(result.stores.every((st) => st.distanceKm === null && st.formattedKm === null)).toBe(true);
    expect(result.stores.some((st) => st.isClosest)).toBe(false);
  });

  it('ordena lojas do mais próximo ao mais longe com km para Umarizal mesmo sem lat/lng explícito', () => {
    const umarizalLoc: UserLocation = {
      cep: '66050-000',
      neighborhood: 'Umarizal',
      city: 'Belém',
      state: 'PA',
      formatted: 'Umarizal, Belém - PA',
      shortLabel: 'Umarizal, Belém/PA',
      source: 'manual',
    };

    const { anchor, stores } = rankStoresByLocation(umarizalLoc);

    expect(anchor).not.toBeNull();
    expect(anchor?.precision).toBe('neighborhood');
    expect(stores[0].isClosest).toBe(true);
    expect(stores.slice(1).every((st) => !st.isClosest)).toBe(true);
    expect(stores.every((st) => st.formattedKm?.endsWith('km'))).toBe(true);

    // Ordem estritamente crescente de distância
    for (let i = 1; i < stores.length; i += 1) {
      expect(stores[i].distanceKm!).toBeGreaterThanOrEqual(stores[i - 1].distanceKm!);
    }

    // Cidade Nova (Ananindeua) deve ficar por último a partir de Umarizal
    expect(stores[stores.length - 1].id).toBe('loja-cidade-nova');
  });

  it('coloca Cidade Nova em primeiro lugar quando o usuário está em Ananindeua', () => {
    const cidadeNovaLoc: UserLocation = {
      cep: '67133-013',
      neighborhood: 'Cidade Nova',
      city: 'Ananindeua',
      state: 'PA',
      formatted: 'Cidade Nova, Ananindeua - PA',
      shortLabel: 'Cidade Nova, Ananindeua/PA',
      source: 'manual',
    };

    const { stores } = rankStoresByLocation(cidadeNovaLoc);

    expect(stores[0].id).toBe('loja-cidade-nova');
    expect(stores[0].isClosest).toBe(true);
    expect(stores[0].formattedKm).toBe('0,1 km');
  });

  it('coloca Bernardo Sayão (Jurunas) em primeiro quando coordenadas GPS estão no Jurunas', () => {
    const jurunasGps: UserLocation = {
      cep: '66030-120',
      neighborhood: 'Jurunas',
      city: 'Belém',
      state: 'PA',
      formatted: 'Av. Bernardo Sayão, Jurunas, Belém - PA',
      shortLabel: 'Jurunas, Belém/PA',
      lat: -1.4757,
      lng: -48.4941,
      source: 'gps',
    };

    const { anchor, stores } = rankStoresByLocation(jurunasGps);

    expect(anchor?.precision).toBe('gps');
    expect(stores[0].id).toBe('loja-jurunas');
    expect(stores[0].isClosest).toBe(true);
    expect(stores[0].formattedKm).toBe('0,1 km');
  });

  it('resolve distância via prefixo de CEP quando bairro não veio preenchido', () => {
    const cepOnlyPedreira: UserLocation = {
      cep: '66080-650',
      neighborhood: '',
      city: 'Belém',
      state: 'PA',
      formatted: 'Belém - PA, CEP 66080-650',
      shortLabel: 'Região de Belém/PA',
      source: 'manual',
    };

    const { anchor, stores } = rankStoresByLocation(cepOnlyPedreira);

    expect(anchor?.precision).toBe('cep');
    expect(stores[0].id).toBe('loja-pedreira-mauriti');
  });

  it('formata distâncias em km e máscara CPF/CNPJ corretamente', () => {
    expect(formatDistanceKm(0.02)).toBe('0,1 km');
    expect(formatDistanceKm(0.84)).toBe('0,8 km');
    expect(formatDistanceKm(1.93)).toBe('1,9 km');
    expect(formatDistanceKm(11.54)).toBe('11,5 km');
    expect(formatDistanceKm(125.4)).toBe('125 km');

    expect(formatCpfCnpjMask('12345678900')).toBe('123.456.789-00');
    expect(formatCpfCnpjMask('12345678000199')).toBe('12.345.678/0001-99');
  });
});
