# Deploy na Hostinger Web Business

## Gate antes do primeiro deploy

- Node.js 22 disponível no hPanel.
- Startup command: `node apps/api/dist/main.js`.
- `PORT` fornecida pela aplicação/Hostinger.
- MySQL disponível e `DATABASE_URL` configurada.
- HTTPS ativo para domínio principal e admin.
- Variáveis secretas configuradas no ambiente, nunca na URL ou no Git.
- Pasta persistente gravável para `storage/uploads`.
- Cron Job do hPanel configurado a cada 5 minutos em UTC+0.
- Limites de processos, memória e conexões MySQL registrados antes do go-live.

## Pacote

Executar `pnpm build`. O pacote contém `apps/api/dist`, `apps/api/public`, `prisma`, `package.json`, `pnpm-lock.yaml` e dependências de produção. Não copiar `.env`, exports WooCommerce, testes, uploads locais ou dumps.

Na ativação de uma versão nova, executar uma única vez `pnpm prisma migrate deploy` antes de iniciar `node apps/api/dist/main.js`.

## Smoke test

```bash
node scripts/verify-deployment.mjs https://jonaselivaldohair.com.br
```

## Cron

O endpoint `POST /internal/cron/process` usa `Authorization: Bearer <CRON_SECRET>`. O segredo deve existir apenas nas variáveis do hPanel.
