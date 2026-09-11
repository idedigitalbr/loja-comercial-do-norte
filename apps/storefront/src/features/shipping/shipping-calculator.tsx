import { useState } from 'react';

export function ShippingCalculator() {
  const [postalCode, setPostalCode] = useState('');
  const [options, setOptions] = useState<Array<{ code: string; label: string; priceCents: number }>>([]);
  async function calculate() {
    const response = await fetch('/api/v1/shipping/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ postalCode, totalCents: 0 }) });
    if (response.ok) setOptions(await response.json());
  }
  return <section><label>CEP <input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} /></label><button onClick={calculate}>Calcular frete</button><ul>{options.map((option) => <li key={option.code}>{option.label} — R$ {(option.priceCents / 100).toFixed(2)}</li>)}</ul></section>;
}
