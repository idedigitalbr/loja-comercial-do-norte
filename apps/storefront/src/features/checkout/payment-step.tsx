import { useState } from 'react';

type PixPayment = {
  status?: string;
  pixCopyPaste?: string | null;
  pixQrCodeBase64?: string | null;
  expiresAt?: string | null;
};

export function PaymentStep({ orderId, amountCents }: { orderId: string; amountCents: number }) {
  const [status, setStatus] = useState('');
  const [payment, setPayment] = useState<PixPayment | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  async function pay() {
    setStatus('');
    const response = await fetch('/api/v1/payments/pix', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `pix-${orderId}` }, body: JSON.stringify({ orderId, amountCents }) });
    if (!response.ok) {
      setStatus('Não foi possível gerar o Pix.');
      return;
    }
    const payload = await response.json() as PixPayment;
    setPayment(payload);
    setStatus(payload.status === 'APPROVED' ? 'Pagamento aprovado.' : 'Pix gerado. Aguardando pagamento.');
  }

  async function copyPixCode() {
    if (!payment?.pixCopyPaste || !navigator.clipboard) return;
    await navigator.clipboard.writeText(payment.pixCopyPaste);
    setCopyStatus('Código Pix copiado.');
  }

  return (
    <section className="form-panel checkout-panel">
      <h2>Pagamento</h2>
      {!payment ? <button className="button button--primary" onClick={() => void pay()}>Pagar com Pix</button> : null}
      {status ? <p role="status">{status}</p> : null}
      {payment?.pixQrCodeBase64 ? <img className="pix-qr-code" src={`data:image/png;base64,${payment.pixQrCodeBase64}`} alt="QR Code do Pix" /> : null}
      {payment?.pixCopyPaste ? (
        <div className="pix-copy-field">
          <label htmlFor="pix-copy-paste">Código Pix copia e cola</label>
          <textarea id="pix-copy-paste" readOnly value={payment.pixCopyPaste} />
          <button className="button button--secondary" type="button" onClick={() => void copyPixCode()}>Copiar código</button>
          {copyStatus ? <p role="status">{copyStatus}</p> : null}
        </div>
      ) : null}
      {payment ? <a href={`/pedido/${orderId}`}>Acompanhar pedido</a> : null}
    </section>
  );
}
