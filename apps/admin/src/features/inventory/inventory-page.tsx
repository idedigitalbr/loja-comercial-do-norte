import { useState } from 'react';

export function InventoryPage() {
  const [message, setMessage] = useState('');
  return <main><h1>Estoque</h1><p>Saldo disponível e ajustes auditados.</p><button onClick={() => setMessage('Ajuste exige motivo e permissão inventory.adjust.')}>Novo ajuste</button>{message ? <p role="status">{message}</p> : null}</main>;
}
