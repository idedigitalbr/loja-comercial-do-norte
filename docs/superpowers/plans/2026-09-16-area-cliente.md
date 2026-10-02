# Plano de implementação — Área do cliente

## Ordem de execução

1. Criar contrato comportamental `UX-CONTRACT.md` para rotas protegidas, títulos, estados, formulário, navegação e feedback.
2. Escrever testes de API para escopo por usuário, perfil, endereços, favoritos, pedidos e troca de senha; escrever testes de rota e componentes do storefront.
3. Adicionar `CustomerFavorite` ao Prisma e aplicar migration idempotente no banco local.
4. Implementar módulo `account` no NestJS com DTOs, controller, serviço, paginação, ownership checks e tratamento de 401/404/409.
5. Implementar cliente tipado da conta e o `AccountLayout` compartilhado.
6. Substituir a lista mínima de pedidos por dashboard, lista, detalhe e timeline; adicionar formulários de perfil, endereços, favoritos e senha.
7. Atualizar navegação global e login para suportar `/conta`, `returnTo` e estado de sessão.
8. Executar testes red/green, typecheck, lint, build, auditoria premium, smoke API e verificação visual desktop/mobile.

## Limites

- Não reutilizar endpoints administrativos para dados do cliente.
- Não armazenar senha, token ou dados de pagamento no cliente.
- Não introduzir pagamentos, CRM, cashback ou exclusão definitiva de conta neste ciclo.
- Preservar o design system preto/branco/dourado e os componentes Lucide existentes.
