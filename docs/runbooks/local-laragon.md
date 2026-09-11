# Ambiente local no Laragon

1. Inicie MySQL no Laragon e crie `jonas_elivaldo_commerce` com `utf8mb4`.
2. Crie `.env` localmente com `DATABASE_URL`, `COOKIE_SECRET`, `CRON_SECRET`, `PORT=3000`, `APP_ORIGIN=http://localhost:5173` e `ADMIN_ORIGIN=http://localhost:5174`. O arquivo nunca deve ser commitado.
3. Execute `pnpm install`.
4. Execute `pnpm bootstrap:local` para validar Node 22, aplicar migrations pendentes e executar o seed idempotente.
5. Execute `pnpm dev`; storefront, admin e API usam 5173, 5174 e 3000.
6. Verifique `GET http://localhost:3000/api/v1/health`.

O bootstrap não executa reset, drop ou limpeza de tabelas.
