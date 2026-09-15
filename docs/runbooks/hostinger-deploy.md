# Deploy na Hostinger Web Business

## Gate antes do primeiro deploy

- Node.js 22 disponível no hPanel.
- Startup command: `node apps/api/dist/main.js`.
- `PORT` fornecida pela aplicação/Hostinger.
- MySQL disponível e `DATABASE_URL` configurada.
- HTTPS ativo para domínio principal e admin.
- Variáveis secretas configuradas no ambiente, nunca na URL ou no Git.
- `SETTINGS_ENCRYPTION_KEY` configurada como uma chave Base64 de exatamente 32 bytes; a aplicação recusa iniciar em produção sem ela.
- Pasta persistente gravável para `storage/uploads`.
- Cron Job do hPanel configurado a cada 5 minutos em UTC+0.
- Limites de processos, memória e conexões MySQL registrados antes do go-live.

## Pacote

Executar `pnpm build`. O pacote contém `apps/api/dist`, `apps/api/public`, `prisma`, `package.json`, `pnpm-lock.yaml` e dependências de produção. Não copiar `.env`, exports WooCommerce, testes, uploads locais ou dumps.

Na ativação de uma versão nova, executar uma única vez `pnpm prisma migrate deploy` antes de iniciar `node apps/api/dist/main.js`.

Esta versão tornou idempotente a migration histórica `20260911154500_add_woocommerce_legacy_keys`, que tinha sido criada antes da migration inicial. Em um banco que já registrou a versão antiga dessa migration, executar antes do deploy `pnpm db:repair:migrations` (a rotina altera somente o checksum do histórico do Prisma e não toca nos dados do catálogo); em bancos novos, o `migrate deploy` funciona diretamente.

## Smoke test

```bash
node scripts/verify-deployment.mjs https://jonaselivaldohair.com.br
```

## Cron

O endpoint `POST /internal/cron/process` usa `Authorization: Bearer <CRON_SECRET>`. O segredo deve existir apenas nas variáveis do hPanel.

## Integrações do painel

Depois do migrate deploy e do primeiro login ADMIN, abra `/admin/` e use Configurações:

- Mercado Pago: selecione o ambiente correto, salve public key/access token e o segredo de webhook, teste a conexão e configure no Mercado Pago a URL pública `https://<dominio>/webhooks/mercado-pago`.
- SMTP: configure host, porta, STARTTLS ou SSL/TLS, remetente e senha; use o envio de teste antes de habilitar as notificações.
- Identidade e Banners da Home: envie logo, favicon e imagens pelo painel. Os arquivos novos ficam em `storage/uploads`; atualizações não removem os arquivos anteriores.
- Templates e notificações: revise os textos em português, mantenha inglês/espanhol desabilitados até a tradução e habilite somente os eventos necessários.

Nunca coloque access token, segredo de webhook ou senha SMTP em screenshots, logs, commits ou documentação.
