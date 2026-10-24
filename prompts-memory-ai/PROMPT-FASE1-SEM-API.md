# Prompt pra colar no Antigravity (repo loja-je)
Pré-requisito: o arquivo CONTEXTO-IA.md deve estar na raiz do repositório (ou em docs/). O prompt manda a IA ler ele primeiro.

---

Você vai adaptar este repositório (base de e-commerce feita pro cliente Jonas & Elivaldo) para um novo cliente: a **Comercial do Norte** (distribuidora de plásticos, descartáveis e embalagens, Belém/PA), com lançamento em 31/10/2026.

**PRIMEIRO PASSO, OBRIGATÓRIO:** leia o arquivo `CONTEXTO-IA.md` na raiz do repositório, inteiro. Ele contém as decisões de produto, a estrutura da home (S0–S10), os gaps verificados do código e as regras do projeto. Trate-o como fonte da verdade. Se algo neste prompt conflitar com ele, vale o CONTEXTO-IA.md.

## Regras de trabalho (não negociar)

1. **Nunca apague código.** O que não serve pra este cliente (cursos/treinamentos, checkout com pagamento) será DESLIGADO e desacoplado (feature flag + remoção de links/rotas visíveis), nunca deletado. Código deletado é trabalho jogado fora; desligado é reversível.
2. **Backup antes de tudo:** antes de qualquer alteração, crie a branch `backup/base-original` a partir do estado atual e a tag `v0-base-jonas-elivaldo`. Trabalhe na branch `feat/comercial-norte-fase1`.
3. **Um commit por etapa**, com mensagem clara em português. Rode a suíte de testes ao fim de cada etapa que tocar em API/banco; se um teste quebrar por causa da sua mudança, corrija a mudança, não o teste (salvo quando a etapa mudar comportamento de propósito — aí atualize o teste e explique no commit).
4. Ao terminar cada etapa, marque no relatório final: feito / parcial / bloqueado (com o motivo).
5. **Escopo desta rodada: SEM integração com API externa nenhuma.** Nada de ERP, nada de sync. Catálogo via admin/seed. Pagamento continua desligado.
6. Não invente marca real, depoimento real nem dado de cliente. Use placeholders marcados como exemplo.

## Etapas

### Etapa 0 — Backup e inventário
- Crie branch de backup + tag (regra 2) e a branch de trabalho.
- Liste o que será desligado: módulo de trainings (rotas públicas `/treinamento/*`, páginas de serviços de salão, certificação), checkout/pagamento (rotas e botões), qualquer conteúdo institucional do salão.

### Etapa 1 — Desligar e desacoplar (feature flags)
- Crie flags de ambiente seguindo o padrão já usado no projeto (ex.: `FEATURE_TRAININGS=false`, `FEATURE_CHECKOUT=false`), lidas pela API e expostas ao front via `GET /api/v1/site/config` (ou mecanismo equivalente já existente).
- Com as flags desligadas: rotas públicas de cursos/serviços somem do router e do menu do storefront; itens de menu somem do admin; botões/fluxo de pagamento somem da loja; endpoints de checkout retornam 404/410 quando a flag está desligada. As tabelas, módulos e testes continuam existindo e passando.
- Remova do ar todo o conteúdo do salão (textos, páginas institucionais de estética), substituindo por estrutura neutra que a Etapa 5 vai preencher.

### Etapa 2 — Hierarquia de categorias
- Adicione `parentId` (auto-relação) em `Category`, nos moldes de `BrandHierarchy` que já existe no schema. Migration nova, sem editar migrations antigas.
- API: filtro por categoria pai inclui produtos das filhas (mesmo comportamento que o filtro de marca já tem).
- Admin: formulário de categoria com seletor de "categoria pai"; listagem indentada por nível.
- Contratos (`@commerce/contracts`) atualizados.

### Etapa 3 — Fluxo de cotação (o coração da fase 1)
- Adicione o status `QUOTE_REQUESTED` ao enum de status do pedido e à máquina de estados: `QUOTE_REQUESTED → COMPLETED | CANCELLED`. Migration nova.
- Novo serviço/caminho `createQuoteFromCart`: cria o pedido em `QUOTE_REQUESTED` a partir do carrinho, **sem exigir pagamento e sem reservar estoque**, gravando dados de contato (nome, WhatsApp, empresa, observação) — cotação de visitante (sem login) deve funcionar; se o cliente estiver logado, vincule a conta.
- Storefront: o "checkout" vira tela de **enviar cotação** (formulário de contato + resumo dos itens + total estimado) e tela de sucesso com o número da cotação. Botões passam a dizer "Adicionar à Cotação" e "Enviar Cotação".
- Notificação: ao criar a cotação, dispare o evento de e-mail **pra equipe de vendas** usando a infra existente (templates + preferências com `recipientOverride`); crie o template "Nova cotação recebida" com itens, quantidades e contato do cliente. Destinatário configurável nas settings de notificação.
- Admin: listagem de pedidos filtra cotações por status; detalhe da cotação mostra contato e itens; ação de marcar como concluída/cancelada respeitando a máquina de estados.
- Testes: estenda a spec da máquina de estados e crie teste do serviço de cotação (sem reserva de estoque, sem pagamento, notificação enfileirada).

### Etapa 4 — Catálogo semente da distribuidora
- Atualize o seed: categorias reais do CONTEXTO-IA.md (Festa, Embalagens, Doces e Bomboniere, Sacos e Sacolas, Limpeza, Frios e Laticínios, Mercearia, Descartáveis) com 2–4 subcategorias cada, usando a hierarquia da Etapa 2.
- Produtos de exemplo coerentes com o mix (copos/descartáveis, embalagens, sacos, papel, limpeza): cada um com variante (SKU único, preço, peso e dimensões preenchidos), a maioria `ACTIVE` e alguns `DRAFT` pra demonstrar a fila de pendentes. Imagens: gere placeholders locais (WebP) pelo mesmo pipeline de upload/Sharp ou referencie o mecanismo de mídia existente — nada de hotlink externo.
- Marcas: NÃO invente nomes de marcas reais. Crie poucas marcas provisórias com nome obviamente genérico (ex.: "Marca Exemplo") só pra alimentar o carrossel, e registre no relatório final que a lista oficial de marcas vem do cliente e substituirá o seed.
- Settings do site preenchidos com os dados da Comercial do Norte que estão no CONTEXTO-IA.md (nome, endereço, telefones, WhatsApp, horários).

### Etapa 5 — Home nova (S0–S10) + mega menu + identidade
- Refaça a home do storefront seguindo a estrutura S0–S10 do CONTEXTO-IA.md: header novo, mega menu alimentado pela hierarquia de categorias, carrossel usando os `HomeBanner` do admin, marcas em círculos, Ofertas do Dia (produtos com `compareAtPriceCents`, tag dinâmica de desconto calculada, contagem regressiva visual), banner de segmento "Comercial do..." (pizzaiolo), categorias, Mais Vendidos, dicas estilo blog (cards estáticos de conteúdo), prova social marcada como exemplo, loja física (dados das settings), faixa de ofertas/Instagram, rodapé completo.
- Página de produto: CTA de cotação, mini-carrinho lateral ao adicionar, seção "Produtos Similares" (mesma categoria).
- Busca: troque `startsWith` por `contains` em nome e descrição na API, mantendo os filtros atuais.
- Identidade: azul e vermelho como cores primárias. Centralize as cores do tema num único lugar do CSS (variáveis), pra troca futura ser trivial. Nada de cor de salão restante.
- Layout responsivo e mobile-first, no padrão visual de Magalu/Mercado Livre descrito no CONTEXTO-IA.md.

### Etapa 6 — SEO mínimo
- Preencha `index.html` com title/description/OG reais da loja (das settings, via mecanismo simples de build ou valores fixos documentados).
- Crie endpoint público `GET /sitemap.xml` na API gerando as URLs de produtos/categorias/marcas `ACTIVE` a partir dos slugs, e um `robots.txt` apontando pra ele.

### Etapa 7 — Fechamento
- Rode a suíte completa de testes e o build de produção (`pnpm build`). Corrija o que as suas mudanças quebrarem.
- Entregue um relatório final contendo: (a) checklist das etapas 0–6 com status; (b) como rodar o projeto local do zero; (c) lista das flags criadas e onde ficam os dados ainda provisórios (marcas, depoimentos, preços do seed); (d) o que ficou pronto esperando a etapa da API do ERP (ganchos: `legacySource`/`legacyId`, molde do importador).
