# Jonas & Elivaldo Commerce

Implementação faseada da plataforma de e-commerce e treinamentos presenciais descrita em:

`C:/Users/Hesron/Downloads/2026-09-11-ecommerce-react-vite-nest-prisma-hostinger.md`

## Estado atual

O repositório concluiu a Fase 1 condicionada e as Tasks 1–15 da fundação do MVP. As Tasks 20, 22 e a base documental da 23 estão implementadas; as Tasks 16–19, 21, 23 e 24 permanecem em execução, com preparação idempotente de checkout, reserva concorrente de vagas, auditoria, visão operacional, resumo financeiro/export assíncrono, mapeamento WooCommerce, bootstrap Laragon, pacote Hostinger, rollback e anonimização LGPD iniciais já implementados. O monorepo, os três aplicativos, o schema Prisma, as migrations, o seed local, os contratos compartilhados, a fundação HTTP, a autenticação com sessão persistida, o pacote UI compartilhado, o catálogo inicial, a loja pública, o motor de preço/promoções, o carrinho persistido, o estoque transacional, os adaptadores de frete, a máquina de pedidos, a base de pagamentos idempotentes e os jobs MySQL acionados por Cron estão funcionais. A integração real de credenciais Mercado Pago, a conclusão do checkout, relatórios completos, a execução da migração com o export real WooCommerce, o smoke test no domínio e o deploy efetivo na Hostinger continuam pendentes.

Antes da Task 1, devem ser concluídos os gates documentados em `docs/decisions/phase-1-gates.md`.

## Documentação inicial

- `docs/decisions/phase-1-gates.md`: decisões que podem aprovar ou bloquear a arquitetura.
- `docs/acceptance/mvp.md`: escopo e critérios do MVP comercial.
- `docs/migration/woocommerce-inventory.md`: inventário necessário para a migração.
- `docs/testing/strategy.md`: estratégia de testes e ambiente de CI.

## Senhas das contas de seed

Antes de executar `pnpm db:seed`, defina `DEFAULT_ADMIN_PASSWORD` e `DEFAULT_CUSTOMER_PASSWORD` no arquivo `.env` local. O seed para antes de acessar o banco se qualquer uma estiver ausente ou vazia.
