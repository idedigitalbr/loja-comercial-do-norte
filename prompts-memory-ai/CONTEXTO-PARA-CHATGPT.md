# CONTEXTO DO PROJETO: Novo site/e-commerce da Comercial do Norte

> Cole este documento no início da conversa. Ele explica o projeto inteiro. A partir dele, considere tudo abaixo como verdade do projeto e não peça essas informações de novo. Se algo não estiver aqui, pergunte antes de inventar.

---

## 1. A empresa

A **Comercial do Norte** é uma distribuidora de **plásticos, descartáveis e embalagens** localizada em Belém/PA. Vende no **atacado e no varejo**: atende empresas (pizzarias, padarias, lanchonetes, restaurantes, escritórios, revendedores) e o consumidor final.

O site atual é o **dosplasticos.com.br** (WordPress antigo, de 2018): é só institucional, mostra categorias sem preço e sem nenhuma forma de compra ou cotação online. Este projeto substitui esse site por completo.

Selos que a empresa já usa hoje: **Menor Preço · Variedade · Tudo em um Só Lugar · Clientes Satisfeitos**.

## 2. O projeto

Criar um **novo site com cara e estrutura de e-commerce** (referências visuais: **Magazine Luiza e Mercado Livre**), mas com uma decisão importante de escopo:

### Fase 1 (agora, lançamento em 31/10/2026): CATÁLOGO + COTAÇÃO
- **Não é loja completa ainda.** Não tem checkout, não tem pagamento online, não tem cálculo de frete de venda.
- O cliente navega pelo catálogo, vê produtos com preço, monta um **carrinho de cotação**, envia (nome, WhatsApp, empresa, observação) e a **equipe de vendas é avisada** e finaliza a cotação com ele (a venda se fecha no ERP da empresa, fora do site).
- Botões dizem **"Adicionar à Cotação"** e **"Enviar Cotação"**. Nada de "Comprar", Pix ou parcelamento nesta fase.
- O lançamento coincide com um evento grande da **ACP (Associação Comercial do Pará)**.

### Fase 2 (depois): e-commerce completo
- Checkout com pagamento online, frete, conta do cliente completa e a **integração automática com o ERP** (produtos e preços sincronizados em tempo real; produto novo no ERP entra no site como "pendente" até o marketing completar foto/descrição e publicar).

### Regras do produto (valem desde a fase 1)
- Produto recém-cadastrado fica **pendente/invisível** até ter foto, descrição e dados completos; só então é publicado.
- A **equipe de marketing gerencia o site pelo painel admin** (produtos, banners, conteúdo, dados da loja) sem depender de programador.
- Preços exibidos no site são referência de cotação; qualquer preço de exemplo usado em protótipo é **ilustrativo**.

## 3. Categorias do catálogo

Categorias reais da loja hoje (do site atual), com subcategorias planejadas:

- **Artigos para Festa**: balões, decoração, velas, pratos e talheres de festa, forminhas, toalhas de mesa
- **Embalagens**: caixas de papelão, caixas para pizza, embalagens para delivery, marmitas, potes, tampas, papel acoplado
- **Descartáveis**: copos, pratos, talheres, guardanapos, papel toalha, papel higiênico, sacos de lixo
- **Doces e Bomboniere**: balas, chocolates, chicletes, pirulitos, doces em geral
- **Sacos e Sacolas**: sacolas plásticas, sacos de papel, sacos sob medida, bobinas
- **Produtos de Limpeza**: detergente, desinfetante, água sanitária, vassouras, panos, luvas, álcool
- **Frios e Laticínios**: queijos, presunto, requeijão, manteiga e afins (a linha "frios" da loja física)
- **Mercearia**: itens básicos de mercearia e revenda

Público por setor (usado na comunicação do site): pizzarias, padarias, lanchonetes, restaurantes, festas e eventos, escritórios e revendedores.

## 4. Como o site é (estrutura)

### Home, nesta ordem:
1. **Header**: barra fina no topo (ofertas do dia, compre pelo WhatsApp, retire na loja), logo, **busca grande** ("buscar embalagem, descartável, marca..."), "Informe seu CEP", conta e **carrinho de cotação** com contador. Abaixo, faixa de benefícios (os 4 selos da empresa).
2. **Mega menu** "Todas as categorias": painel grande com as categorias e subcategorias + links rápidos (Ofertas do Dia, Mais Vendidos, Marcas, Blog).
3. **Carrossel principal** com 3 a 5 campanhas (oferta principal, campanha de setor, atacado, festa).
4. **Cards de acesso rápido** (padrão Mercado Livre): Retire na Loja, Cotação pelo WhatsApp, Atacado/Revenda, Entrega em Belém.
5. **Marcas em círculos** (padrão Magalu): clicar abre a página da marca com os produtos dela. (Lista oficial de marcas: ainda será passada pelo cliente.)
6. **Ofertas do Dia**: contagem regressiva, cards de produto com foto, nome, preço "de/por", selo dinâmico ("35% OFF", "Oferta Relâmpago") e botão "Adicionar à Cotação".
7. **Banner de segmento** entre as seções: ex. **"Comercial do Norte do Pizzaiolo"**, tudo para pizzaria. A ideia se repete para festa, lanchonete, escritório e revenda.
8. **Compre por categoria**: cards das categorias reais.
9. **Mais Vendidos** + fileira **"Pro seu negócio"** (atacado, caixas fechadas, preço por volume).
10. **Seção "Comercial do..."**: vitrine de clientes por setor (pizzaria, padaria etc.).
11. **Blog/Dicas** estilo "Lu Explica" da Magalu: artigos que ensinam e terminam em produtos relacionados (ex.: como escolher embalagem para delivery). Nome da seção decidido em 2026-10-21: "Explica Aí Comercial". Os cards usam vídeo como capa; clicar abre o artigo completo, que termina em CTAs pros produtos relacionados.
12. **Prova social**: avaliação do Google e depoimentos de clientes.
13. **Loja física**: foto, endereço, mapa, horários, botões de WhatsApp/ligar/rota.
14. **Faixa "Receba as ofertas"** (WhatsApp/e-mail) + **Instagram** da loja.
15. **Bloco "como funciona a cotação"** e termos mais procurados.
16. **Rodapé completo**: institucional, ajuda, minha conta, contatos, CNPJ, selos.

### Outras páginas:
- **Catálogo/categoria**: listagem com busca, filtros (categoria, subcategoria, marca), ordenação e paginação.
- **Página do produto**: foto/galeria, descrição, preço, peso e dimensões, botão "Adicionar à Cotação", **mini-carrinho lateral** ao adicionar, e **"Produtos Similares"** (mesma categoria).
- **Carrinho de cotação**: itens, quantidades, total estimado, formulário de contato e envio para a equipe de vendas.
- **Página de marca**, **páginas institucionais** (sobre, loja física) e **painel admin** para o marketing.

## 5. Identidade visual e cores

- **Cores da marca: AZUL e VERMELHO** (são as cores da logo: "comercial" em vermelho, "do norte" em azul, com o "C" azul e ponto vermelho).
- Azul é a cor principal (header, botões principais, destaques de navegação); vermelho entra nos destaques comerciais (preços, ofertas, selos, CTAs de cotação).
- Fundo claro, limpo, com muito branco, no padrão dos grandes e-commerces (Magalu/Mercado Livre): foto de produto grande, card branco com sombra leve, preço em destaque.
- Não existe uma paleta hexadecimal oficial registrada: os tons exatos seguem os da logo atual. Na dúvida, azul forte de varejo e vermelho vivo, sem gradientes roxos ou cores fora da marca.
- Fotografia: loja real, produtos reais e gente de verdade (o acervo de fotos/vídeos da loja é forte); evitar imagem genérica de banco quando houver foto própria.

## 6. Dados da loja (para usar em textos, rodapé e contato)

- **Endereço**: Av. Rômulo Maiorana, 115A, São Braz, Belém/PA, CEP 66093-635
- **Horários**: seg a sex 6h30 às 18h · sáb 6h30 às 12h30 · dom 7h às 12h30
- **Telefones**: (91) 4042-0513 · (91) 3246-4908 · **WhatsApp (91) 98344-0880**
- **E-mail**: contato@dosplasticos.com.br
- **CNPJ**: 16.965.024/0001-15
- Observação: esses dados vêm do site atual (época do nome Dosplásticos) e ainda serão confirmados com o cliente para o novo site; o domínio final (manter dosplasticos.com.br ou migrar) também está em aberto.

## 7. Tecnologia (resumo, para contexto)

- O site está sendo construído **aproveitando uma base de e-commerce que a própria equipe já desenvolveu** (loja + painel admin + API), adaptada para este projeto, em vez de começar do zero.
- Painel admin próprio para o marketing gerir catálogo, banners e conteúdo.
- A integração com o ERP entra na fase 2 (ver seção 2).

## 8. Status e pendências

- Protótipo da home: feito e em melhoria.
- **Pendente do cliente/equipe**: lista oficial de marcas; nome/personagem do blog; confirmar dados da loja e domínio; documentação da API do ERP (para a fase 2); fotos reais dos produtos.

## 9. Instruções para você (IA)

- Responda em **português brasileiro**.
- Trate este documento como a verdade do projeto: não reintroduza checkout/pagamento na fase 1, não troque as cores da marca, não invente marcas, preços reais, depoimentos ou dados da empresa. Precisou de algo que não está aqui, **pergunte**.
- Ao sugerir textos de tela, use a linguagem de cotação ("Adicionar à Cotação", "Enviar Cotação", "Pedir pelo WhatsApp"), nunca linguagem de compra direta, enquanto for fase 1.
