# Ambiente local no Laragon

1. Inicie MySQL no Laragon e crie `jonas_elivaldo_commerce` com `utf8mb4`.
2. Crie `.env` localmente com `DATABASE_URL`, `COOKIE_SECRET`, `CRON_SECRET`, `PORT=3001`, `APP_ORIGIN=http://localhost:5173`, `ADMIN_ORIGIN=http://localhost:5174` e, opcionalmente, `SETTINGS_ENCRYPTION_KEY` (em desenvolvimento há fallback derivado do `COOKIE_SECRET`). O arquivo nunca deve ser commitado; use `.env.example` apenas como modelo sem segredos.
3. Execute `pnpm install`.
4. Execute `pnpm bootstrap:local` para validar Node 22, aplicar migrations pendentes e executar o seed idempotente.
5. Execute `pnpm dev`; storefront, admin e API usam 5173, 5174 e 3001.
6. Acesse `http://localhost:5174/admin/`, entre com um usuário ADMIN e abra Configurações. O catálogo importado continua em Catálogo.
7. Verifique `GET http://localhost:3001/api/v1/health` e `GET http://localhost:3001/api/v1/site/config`.

## Configurações operacionais

- Em Mercado Pago, selecione Teste ou Produção, informe public key, access token e o segredo de assinatura. O painel nunca repopula os campos secretos; deixe-os em branco para manter os valores salvos.
- Em SMTP, informe host, porta, segurança TLS, remetente e senha. O botão de teste envia uma mensagem somente para o destinatário informado.
- Em Banners da Home, envie a imagem desktop e, se necessário, uma imagem mobile; salve como Ativo para publicar no storefront. O fallback visual estático permanece disponível quando não houver banner ativo ou a API estiver indisponível.
- O worker de notificações é executado pelo cron `POST /internal/cron/process` com `Authorization: Bearer <CRON_SECRET>` (essa rota fica fora do prefixo público `/api/v1`).

O bootstrap não executa reset, drop ou limpeza de tabelas.
