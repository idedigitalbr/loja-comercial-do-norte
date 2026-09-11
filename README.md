# Jonas & Elivaldo Commerce

Implementação faseada da plataforma de e-commerce e treinamentos presenciais descrita em:

`C:/Users/Hesron/Downloads/2026-09-11-ecommerce-react-vite-nest-prisma-hostinger.md`

## Estado atual

O repositório concluiu a Fase 1 condicionada e as Tasks 1–13 da fundação, com a base de pagamentos idempotentes em andamento. O monorepo, os três aplicativos, o schema Prisma, as migrations, o seed local, os contratos compartilhados, a fundação HTTP, a autenticação com sessão persistida, o pacote UI compartilhado, o catálogo inicial, a loja pública, o motor de preço/promoções, o carrinho persistido, o estoque transacional, os adaptadores de frete e a máquina de pedidos estão funcionais.

Antes da Task 1, devem ser concluídos os gates documentados em `docs/decisions/phase-1-gates.md`.

## Documentação inicial

- `docs/decisions/phase-1-gates.md`: decisões que podem aprovar ou bloquear a arquitetura.
- `docs/acceptance/mvp.md`: escopo e critérios do MVP comercial.
- `docs/migration/woocommerce-inventory.md`: inventário necessário para a migração.
- `docs/testing/strategy.md`: estratégia de testes e ambiente de CI.
