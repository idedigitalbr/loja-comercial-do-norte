type ViaCepResponse = {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export type PostalCodeAddress = {
  street: string;
  district: string;
  city: string;
  state: string;
};

export async function lookupPostalCode(postalCode: string): Promise<PostalCodeAddress | null> {
  const digits = postalCode.replace(/\D/g, '');
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('POSTAL_CODE_LOOKUP_FAILED');

  const payload = await response.json() as ViaCepResponse;
  if (payload.erro) return null;

  return {
    street: payload.logradouro?.trim() ?? '',
    district: payload.bairro?.trim() ?? '',
    city: payload.localidade?.trim() ?? '',
    state: payload.uf?.trim().toUpperCase() ?? '',
  };
}
