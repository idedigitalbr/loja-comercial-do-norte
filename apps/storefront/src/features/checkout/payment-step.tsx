import { useState } from 'react';

export function PaymentStep({ orderId, amountCents }: { orderId: string; amountCents: number }) {
  const [status, setStatus] = useState('');
  async function pay() {
    const response = await fetch('/api/v1/payments/pix', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `pix-${orderId}` }, body: JSON.stringify({ orderId, amountCents }) });
    setStatus(response.ok ? 'Pix gerado.' : 'Não foi possível gerar o Pix.');
  }
  return <section><h2>Pagamento</h2><button onClick={pay}>Pagar com Pix</button>{status ? <p role="status">{status}</p> : null}</section>;
}
