import { FormEvent, useState } from 'react';

export function PromotionForm() {
  const [code, setCode] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [simulation, setSimulation] = useState<number | null>(null);

  function simulate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSimulation(Math.max(0, 10_000 - Math.round(10_000 * percentage / 100)));
  }

  return (
    <form onSubmit={simulate}>
      <h1>Nova promoção</h1>
      <label>Código <input value={code} onChange={(event) => setCode(event.target.value)} required /></label>
      <label>Desconto (%) <input type="number" min="0" max="100" value={percentage} onChange={(event) => setPercentage(Number(event.target.value))} /></label>
      <button type="submit">Simular em R$ 100,00</button>
      {simulation !== null ? <p role="status">Total simulado: R$ {(simulation / 100).toFixed(2).replace('.', ',')}</p> : null}
    </form>
  );
}
