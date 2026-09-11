export function PixStatus({ copyPaste, expiresAt }: { copyPaste: string; expiresAt: string }) {
  return <section><h2>Pix</h2><p>Copie e cole o código para pagar.</p><textarea readOnly value={copyPaste} aria-label="Código Pix" /><small>Expira em {new Date(expiresAt).toLocaleString('pt-BR')}</small></section>;
}
