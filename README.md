# Comercial do Norte — E-commerce & Catálogo de Distribuidora

Plataforma de catálogo virtual e e-commerce para distribuidora de produtos profissionais e cosméticos (**Comercial do Norte**).

## Arquitetura do Projeto

Monorepo estruturado com **Turborepo** e **pnpm workspaces**:

- `apps/storefront`: Loja virtual e catálogo público em React 19 + Vite.
- `apps/admin`: Painel administrativo em React 19 + Vite para gestão de catálogo, pedidos e banners.
- `apps/api`: Backend REST em NestJS 11 + Express + Prisma ORM + MySQL 8.
- `packages/contracts`: Contratos TypeScript e esquemas Zod compartilhados.
- `packages/ui`: Componentes de interface compartilhados.
- `packages/api-client`: Cliente HTTP tipado para consumo da API.

## Execução Local

1. Configure o banco MySQL e o arquivo `.env` a partir de `.env.example`.
2. Instale as dependências:
   ```bash
   pnpm install
   ```
3. Execute o bootstrap local (migrations e seed):
   ```bash
   pnpm bootstrap:local
   ```
4. Inicie os servidores em desenvolvimento:
   ```bash
   pnpm dev
   ```
   - Storefront: [http://localhost:5173/](http://localhost:5173/)
   - Admin: [http://localhost:5174/admin/](http://localhost:5174/admin/)
   - API: [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)

## Documentação Técnica

- `ANALISE-TECNICA-REUSO.md`: Relatório completo de engenharia, arquitetura e viabilidade técnica.
