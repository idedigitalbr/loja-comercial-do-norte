# Páginas institucionais públicas — Especificação

## Objetivo

Recriar no novo storefront a experiência pública principal do Jonas & Elivaldo Hair Designers, substituindo a tela de login em `/` por uma Home institucional e adicionando as páginas `/sobre-nos`, `/servicos`, `/certificacao-internacional` e `/entrar`.

## Escopo aprovado

- Home institucional com hero, apresentação da marca, serviços, chamada para a loja, agendamento via WhatsApp, depoimentos e rodapé.
- Página Sobre nós com história, missão, visão, valores e equipe.
- Página Serviços com os cinco serviços destacados e CTA de agendamento.
- Página Certificação internacional com proposta de valor, validação externa e benefícios.
- Login do cliente preservado em `/entrar`.
- Cabeçalho global atualizado com a navegação institucional e acesso explícito à conta.
- Reuso do design system existente: preto quase absoluto, branco, dourado, Work Sans/Inter, bordas retas, CTA dourado e WhatsApp em pill.
- Conteúdo inicial baseado na análise pública do site original. A futura seção administrativa de Site/Home substituirá os dados estáticos sem exigir mudança da estrutura de páginas.

## Fora de escopo nesta entrega

- Persistência e edição administrativa de banners, logo, favicon, textos e seções da Home.
- Upload ou migração definitiva das imagens institucionais.
- Agenda online, checkout de serviços, CMS genérico ou editor drag-and-drop.
- Alteração das páginas da loja, carrinho, checkout e pedidos já existentes.

## Rotas

| Rota | Tela | Comportamento |
| --- | --- | --- |
| `/` | `HomePage` | Página inicial pública institucional. |
| `/entrar` | `LoginPage` | Login da conta do cliente, sem alterar o fluxo de autenticação. |
| `/sobre-nos` | `AboutPage` | História, princípios e equipe. |
| `/servicos` | `ServicesPage` | Catálogo institucional de serviços e CTA para WhatsApp. |
| `/certificacao-internacional` | `CertificationPage` | Certificação, benefícios, segurança e CTA. |

## Conteúdo e acessibilidade

- Toda página terá um único `h1`, landmarks semânticos e links com nomes claros.
- CTA de WhatsApp usará `https://wa.me/5596981001897` em nova aba com `rel="noreferrer"`.
- Imagens terão `alt` descritivo; imagens decorativas usarão `alt=""`.
- O menu mobile continuará acessível via `<details>` e o link ativo será determinado pela rota atual.
- Os dados estáticos de imagem terão fallback visual em CSS para que a página continue legível se o servidor de mídia externo estiver indisponível.

## Decisões de implementação

- Criar componentes de apresentação focados em cada página, evitando um page builder genérico.
- Centralizar textos, links e imagens institucionais em `institutional-content.ts`, que será a futura fonte de fallback do módulo de configurações.
- Reaproveitar `StorefrontShell` para cabeçalho e rodapé, sem duplicar chrome entre páginas.
- Adicionar estilos específicos com prefixo `institutional-` ao CSS existente, mantendo os estilos da loja intactos.
- Não importar scripts, widgets de acessibilidade, tradução ou rastreamento do WordPress original.

## Critérios de aceite

- `/` renderiza a Home e não renderiza mais o login.
- `/entrar` renderiza o login existente.
- As quatro páginas públicas carregam via navegação do cabeçalho e possuem CTA para WhatsApp ou loja quando aplicável.
- Home, Sobre nós, Serviços e Certificação têm layout responsivo sem overflow horizontal em 320px.
- Testes unitários cobrem rotas, headings, links principais e conteúdo essencial.
- `test`, `typecheck`, `lint` e `build` do storefront passam.
