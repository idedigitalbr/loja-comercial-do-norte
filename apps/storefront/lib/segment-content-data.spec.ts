import { describe, expect, it } from 'vitest';
import { getSegmentContentSuggestions } from './segment-content-data';

describe('segment-content-data', () => {
  it('retorna sugestões específicas para o segmento lanchonete', () => {
    const suggestions = getSegmentContentSuggestions('lanchonete');
    expect(suggestions).toHaveLength(4);
    expect(suggestions[0].title).toBe('Embalagens kraft para o seu delivery');
    expect(suggestions[0].tags).toContain('DELIVERY');
    expect(suggestions[0].tags).toContain('LINHA KRAFT');
    expect(suggestions[1].title).toBe('Copos e tampas para açaí e café');
    expect(suggestions[1].tags).toContain('AÇAÍ & CAFÉ');
    expect(suggestions[2].title).toContain('respiro');
    expect(suggestions[3].title).toContain('cardápio de lanchonete');
  });

  it('retorna sugestões específicas para pizzaria', () => {
    const suggestions = getSegmentContentSuggestions('pizzaria');
    expect(suggestions).toHaveLength(4);
    expect(suggestions[0].title).toContain('Caixas de pizza');
    expect(suggestions[0].tags).toContain('PIZZARIAS');
    expect(suggestions[1].title).toContain('combos e calzones');
  });

  it('retorna sugestões para aliases de segmento (festas, confeitaria, acai, buffet, bar)', () => {
    const festas = getSegmentContentSuggestions('festas');
    const lojaFestas = getSegmentContentSuggestions('loja-de-festas');
    expect(festas).toEqual(lojaFestas);

    const confeitaria = getSegmentContentSuggestions('confeitaria');
    const confeitariaBolos = getSegmentContentSuggestions('confeitaria-bolos');
    expect(confeitaria).toEqual(confeitariaBolos);

    const acai = getSegmentContentSuggestions('acai');
    const sorveteriaAcai = getSegmentContentSuggestions('sorveteria-acai');
    expect(acai).toEqual(sorveteriaAcai);
  });

  it('retorna sugestões padrão para slugs desconhecidos ou vazios', () => {
    const fallback = getSegmentContentSuggestions('segmento-inexistente');
    expect(fallback).toHaveLength(4);
    expect(fallback[0].title).toBe('Embalagens kraft para o seu delivery');

    const empty = getSegmentContentSuggestions('');
    expect(empty).toHaveLength(4);
  });
});
