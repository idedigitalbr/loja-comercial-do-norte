# UX Contract — Storefront autenticado

## Escopo e locale

- Superfície: área autenticada do cliente do e-commerce Jonas & Elivaldo.
- Locale: `pt-BR`; moeda: BRL; fuso comercial: `America/Belem` até confirmação do gate de negócio.
- Fonte visual: `DESIGN.md`, tokens de `apps/storefront/src/styles.css` e ícones Lucide de `@commerce/ui`.

## Mapa de rotas

| Rota | Título | Acesso |
|---|---|---|
| `/conta` | Minha conta — Jonas & Elivaldo | sessão |
| `/conta/pedidos` | Meus pedidos — Jonas & Elivaldo | sessão |
| `/conta/pedidos/:publicId` | Detalhes do pedido — Jonas & Elivaldo | sessão + ownership |
| `/conta/dados` | Meus dados — Jonas & Elivaldo | sessão |
| `/conta/enderecos` | Meus endereços — Jonas & Elivaldo | sessão |
| `/conta/favoritos` | Meus favoritos — Jonas & Elivaldo | sessão |
| `/conta/seguranca` | Segurança — Jonas & Elivaldo | sessão |

Rotas protegidas preservam `returnTo` no login. Uma resposta 401 redireciona para `/entrar` com retorno seguro para a rota interna; uma resposta 403 mostra a barreira sem revelar dados.

## Donos canônicos

| Capacidade | Dono |
|---|---|
| Navegação da conta | `AccountLayout` + `AccountNav` |
| Formulários | campos nativos com `noValidate`, validação inline e mensagens associadas |
| Feedback | região de status da própria área, com texto persistente para ações críticas |
| Tabelas/listas | paginação/estado do serviço de conta; cartões equivalentes no mobile |
| Confirmação destrutiva | diálogo acessível da área de conta |
| Sessão | `auth-client.ts` e `SessionGuard` |
| Scrollbar | baseline global do storefront |

## Comportamento

- Login confirmado → `/conta` ou `returnTo` interno; sessão existente em `/entrar` → mesma regra.
- Carregamento inicial preserva o layout e exibe estado ocupado em região reservada.
- Erros de rede mantêm os valores digitados e oferecem `Tentar novamente`.
- Salvamento confirmado pelo servidor → mensagem `Alterações salvas` e foco no contexto alterado.
- CEP com oito dígitos → consulta o ViaCEP com debounce, preenche rua, bairro, cidade e UF quando disponíveis e informa carregamento, CEP não encontrado ou falha sem apagar os dados digitados.
- Exclusão de endereço → diálogo nomeando o endereço e a consequência; após sucesso, atualiza a lista.
- Favorito → operação idempotente, estado pendente curto e reversão/refetch em falha.
- Logout → revoga sessão, limpa o estado e retorna a `/entrar`.

## Acessibilidade

- WCAG 2.2 AA como baseline; foco visível, labels reais, `aria-invalid`, `aria-describedby` e live status.
- Navegação lateral usa links semânticos e `aria-current="page"`.
- Diálogos prendem foco, fecham com `Escape` e restauram foco ao acionador.
- Em 200% de zoom e mobile, o conteúdo refluí sem esconder ações; listas grandes permanecem paginadas.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Table Selection | Shared table/list state | UX contract | page / all-results | component + E2E |
| Select/Listbox | Native select | UX contract + platform keyboard semantics | native | keyboard + popup |
| Date | Native date/time input | UX contract + browser locale | native | locale + keyboard + E2E |
| Form | Storefront field and schema adapters | UX contract | create / edit | validation E2E |
| Scrollbar | Global storefront stylesheet | DESIGN.md | geometry exceptions | computed style |
| Toast | Inline live status region | UX contract | success / warning / info / error | live-region test |
| CRUD | Account routes and API service | UX contract | return / stay | full-flow E2E |
