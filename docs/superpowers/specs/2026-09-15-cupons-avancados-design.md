# Cupons avançados — desenho técnico

## Objetivo

Evoluir o cadastro de cupons do painel administrativo para oferecer as três áreas de configuração equivalentes ao WooCommerce e fazer essas regras terem efeito real no checkout, sem quebrar cupons já existentes.

## Decisões

- O cupom continua sendo a unidade de uso e terá um tipo explícito: percentual, valor fixo no carrinho ou valor fixo por produto.
- Valores monetários serão persistidos em centavos inteiros. Percentuais serão persistidos como inteiros de 0 a 100.
- Elegibilidade será avaliada no servidor com subtotal, linhas do carrinho, produto, marca, categoria, preço promocional, e-mail e identidade do cliente.
- A prévia do checkout nunca consumirá uso. O consumo será reservado atomicamente na preparação do pedido, com revalidação das regras dentro da transação.
- O limite por cliente usará o ID do usuário quando existir e o e-mail normalizado como fallback para checkout anônimo.
- Itens em promoção serão identificados por `compareAtPriceCents > priceCents`, já existente no catálogo.
- Produtos e categorias terão regras relacionais de inclusão/exclusão; padrões de e-mail serão armazenados em registros próprios e comparados sem distinção de maiúsculas/minúsculas, com `*` como curinga.
- O frete grátis zerará o frete selecionado no checkout, mas não alterará o subtotal.
- Cupons existentes receberão `FIXED_CART` e valor zero na migração, permanecendo editáveis e sem desconto implícito.

## Fluxo

1. O admin cria ou edita um cupom nas abas Geral, Restrição de uso e Limites de uso.
2. O checkout envia o código para uma cotação; a API retorna elegibilidade, desconto, frete e total sem incrementar uso.
3. Ao preparar o pedido, a API recalcula a cotação dentro da transação, valida vigência, regras e limites, cria o pedido com `discountCents` e registra a redenção.
4. A tela de promoções lista estado, tipo, valor, uso, vigência e permite editar ou desativar com feedback confirmado pelo servidor.

## Persistência

O modelo `Coupon` ganhará os campos de configuração simples. Tabelas relacionais serão adicionadas para produtos, categorias e padrões de e-mail. `CouponRedemption` passará a guardar o e-mail normalizado usado na compra para aplicar corretamente o limite por cliente anônimo. A migração terá defaults compatíveis para os dados existentes.

## UI e acessibilidade

O formulário seguirá os padrões do admin existente, com navegação por abas sem perda de dados, validação textual, valores monetários em BRL, datas `datetime-local` convertidas explicitamente para ISO e estados de carregamento/erro/sucesso. A lista continuará limitada no servidor e apresentará paginação ou estado de total conforme o contrato existente. Exclusão não será introduzida; a ação operacional será desativar o cupom.

## Testes

- Testes unitários do avaliador para cada tipo de desconto, limites, datas, produtos/categorias, e-mail curinga, itens promocionais e frete grátis.
- Testes de serviço para criação/edição normalizada e consulta das regras.
- Testes de checkout para cotação sem consumo e preparação com revalidação/registro atômico.
- Testes da tela admin para as três abas, preservação de valores, criação, edição, desativação e erro do servidor.
- Lint, typecheck, suíte completa e build dos três aplicativos.
