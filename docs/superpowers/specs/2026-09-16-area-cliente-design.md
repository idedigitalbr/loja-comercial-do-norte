# Área do cliente — especificação de arquitetura

**Data:** 2026-09-16
**Status:** proposta para revisão; escopo aprovado em conversa, implementação aguardando revisão desta especificação

## Objetivo

Substituir a lista mínima atual de `/conta/pedidos` por uma área autenticada de autoatendimento, alinhada ao storefront Jonas & Elivaldo e alimentada por dados reais do cliente. O painel deve permitir acompanhar compras, manter dados pessoais, administrar endereços, consultar favoritos e proteger a sessão sem expor dados de outro usuário.

## Decisões de produto

- A entrada da conta será `/conta`, com redirecionamento de `/entrar` após autenticação.
- As áreas serão rotas independentes e compartilháveis: `/conta`, `/conta/pedidos`, `/conta/pedidos/:publicId`, `/conta/dados`, `/conta/enderecos`, `/conta/favoritos` e `/conta/seguranca`.
- O painel usará navegação lateral persistente no desktop e uma navegação compacta equivalente em telas estreitas.
- Pedidos serão exibidos com status em português, valor, data, itens, pagamento, entrega e histórico de estados; haverá atalho para comprar novamente quando os itens ainda estiverem disponíveis.
- O e-mail da conta será exibido como somente leitura. O cliente poderá editar nome e telefone; documento não será exposto por padrão, seguindo minimização de PII do mapa LGPD.
- Endereços terão criação, edição, exclusão e definição de endereço padrão. Exclusão será protegida por diálogo próprio e não usará `confirm()` do navegador.
- Favoritos deixarão de depender apenas de `localStorage` e passarão a ser persistidos por usuário; o estado local atual continuará sendo lido como compatibilidade de migração no primeiro carregamento autenticado.
- Logout, sessão expirada e falhas de rede terão mensagens inline e rota de retorno para a página solicitada após novo login.

## Arquitetura de API

Será criado um módulo de autoatendimento autenticado, separado dos endpoints administrativos de clientes. Todos os endpoints usarão `SessionGuard`, receberão o `userId` da sessão e filtrarão os registros no servidor.

### Endpoints

| Método | Rota | Responsabilidade |
|---|---|---|
| GET | `/api/v1/account` | Resumo da conta, perfil, métricas e endereço padrão |
| PATCH | `/api/v1/account/profile` | Atualiza nome e telefone com validação de DTO |
| GET | `/api/v1/account/orders` | Lista paginada de pedidos do usuário autenticado |
| GET | `/api/v1/account/orders/:publicId` | Detalhes do pedido somente se pertencer ao usuário |
| GET | `/api/v1/account/addresses` | Lista endereços do usuário |
| POST | `/api/v1/account/addresses` | Cria endereço |
| PATCH | `/api/v1/account/addresses/:publicId` | Edita endereço |
| DELETE | `/api/v1/account/addresses/:publicId` | Exclui endereço com regra de endereço padrão |
| POST | `/api/v1/account/addresses/:publicId/default` | Define endereço padrão |
| GET | `/api/v1/account/favorites` | Lista produtos favoritos com resumo de catálogo |
| POST | `/api/v1/account/favorites` | Adiciona produto favorito de forma idempotente |
| DELETE | `/api/v1/account/favorites/:productId` | Remove favorito |
| PATCH | `/api/v1/account/password` | Altera senha após validar senha atual |

Pedidos usarão paginação com `page` e `pageSize`, mantendo o total e o estado atual dos filtros. O detalhe e a lista não reutilizarão o endpoint administrativo nem o atual `GET /orders/:publicId` sem escopo de usuário. Respostas de autenticação não incluirão hash, tokens ou dados internos de pagamento.

## Persistência

Os modelos existentes `User`, `CustomerProfile`, `Address`, `Order`, `OrderItem`, `Payment` e `OrderStatusHistory` serão reutilizados. Será adicionada uma relação `CustomerFavorite` com chave única composta por usuário e produto, índice por usuário/data e exclusão em cascata da conta. A migration será aplicada sem alterar dados existentes.

## Arquitetura do storefront

### Componentes

- `AccountLayout`: cabeçalho da conta, título contextual, navegação, conteúdo e suporte pelo WhatsApp.
- `AccountNav`: links semânticos com rota ativa, contador de pedidos e ação de sair.
- `AccountSummaryCards`: métricas da conta e último pedido.
- `AccountOrderList` e `AccountOrderCard`: lista desktop/mobile com status, itens, total e ações.
- `AccountOrderTimeline`: histórico de transições traduzido e ordenado.
- `AccountProfileForm`, `AccountAddressBook`, `AccountFavoriteGrid` e `AccountSecurityForm`.
- `AccountState`: estados compartilhados de carregamento, erro, vazio, sessão expirada e confirmação de mutação.

### Contrato de navegação

- `/entrar` preservará `returnTo` quando o visitante tentar abrir uma rota protegida.
- Usuário não autenticado será levado ao login e retornará à rota original após autenticar.
- `/conta` será a visão inicial; `/conta/pedidos` continuará funcionando como deep link.
- O cabeçalho exibirá `Minha conta` para sessão ativa e manterá `Sair` como ação separada.
- Cada rota terá título de documento no formato `{Página} — Jonas & Elivaldo`.

### Estados e acessibilidade

- Carregamento inicial terá indicador próprio em região estável; conteúdo já carregado não será apagado durante atualização.
- Listas terão estados vazio, sem resultados, erro parcial, erro de sessão e retry.
- Formulários terão `noValidate`, labels associadas, mensagens inline, `aria-invalid`, `aria-describedby`, foco no primeiro erro e botões com estado ocupado sem mudança de dimensão.
- Campos de senha usarão `current-password`/`new-password` e controle acessível para revelar/ocultar o valor.
- O diálogo de exclusão terá foco preso, `Escape`, restauração de foco e ação destrutiva explicitamente nomeada.
- A tabela/lista de pedidos será bounded por paginação no servidor; em mobile, cada pedido será um cartão com os mesmos dados e ações.
- Cores não serão o único indicador de status; cada status terá texto e ícone Lucide.

## Segurança e privacidade

- O servidor será a autoridade para identidade, posse de pedido, posse de endereço e favoritos.
- Pedido inexistente ou de outro cliente não será retornado pelo endpoint de detalhe.
- Alteração de senha exigirá senha atual, limpará valores sensíveis após erro e invalidará sessões conforme o contrato de autenticação.
- Nenhum segredo, token, senha ou dado de pagamento será persistido no navegador ou incluído em URL, logs ou mensagens.
- A camada de conta não reutilizará autorização administrativa.

## Testes e verificação

- API: testes de controller/service para autenticação, escopo por usuário, paginação, validação, endereço padrão, favorito idempotente, alteração de senha e respostas 401/404/409.
- Prisma: migration e teste de unicidade/cascata dos favoritos.
- Storefront: testes de rotas protegidas, resumo, lista/detalhe de pedido, edição de perfil, CRUD de endereço, favoritos, estados vazio/erro e sessão expirada.
- Navegador: login → conta → pedidos → detalhe; logout; criação/edição de endereço; favorito; viewport estreito; teclado e diálogo aberto.
- Verificação final: typecheck, lint, testes direcionados, build, `git diff --check`, auditoria premium e smoke HTTP.

## Fora deste ciclo

- Gestão administrativa de clientes, CRM, pontos, cashback, assinatura, notificações configuráveis e exclusão automática de conta.
- Armazenamento de cartões; o painel exibirá apenas método/status retornado pelo pagamento externo.
