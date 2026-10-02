# Auditoria e plano de paridade — Jonas & Elivaldo

Data: 01/10/2026. Referência: https://jonaselivaldohair.com.br/. Implementação: http://localhost:5173/. Objetivo: reproduzir o site original atual, incluindo conteúdo, composição, imagens e comportamento, preservando as funções comerciais já implementadas.

## Resultado

O novo site ainda não é idêntico ao original. A base institucional já contém muitos textos e imagens corretos, mas existem diferenças sistemáticas de tipografia, dimensões, recortes, espaçamento e componentes. Há também falhas funcionais e conteúdo ausente. A loja apresenta uma proposta visual diferente e o detalhe do produto está substancialmente incompleto.

Este documento contém o plano; nenhuma correção de aplicação foi realizada nesta auditoria. A especificação anterior de 13/09/2026 permitia à loja manter o visual Superdesign e previa conteúdos que não aparecem no original atual. Para a próxima implementação, o pedido atual de identidade visual passa a ser a referência, inclusive para a loja. Atualizar DESIGN.md e a especificação anterior junto com a execução para evitar orientações conflitantes.

## Cobertura e limites

Foram comparadas as sete páginas institucionais públicas, com rolagem pelas suas seções: Home, Sobre Nós, Cabelos & Penteados, Maquiagem, Manicure & Pedicure, Terapia Capilar e Certificação Internacional. Também foram comparados a loja, um produto completo, uma categoria e uma marca. Foram abertos os oito perfis profissionais no original e conferida a ausência das biografias na implementação.

As medições principais abaixo vieram da comparação desktop em viewport de 1370 × 997. Alturas totais são evidências auxiliares, sujeitas a carregamento e animações; não são uma nota de paridade. A inspeção estreita local mostrou reordenação responsiva, mas a ferramenta não aplicou dimensões iguais aos dois sites. A validação mobile comparativa permanece pendente; não considerar esta auditoria uma aprovação mobile.

Os 346 produtos não foram revisados individualmente. A completude do catálogo exige inventário integral na fase 1. Não houve compra, envio de formulário, alteração de dados ou acesso a informações privadas no original. Carrinho, checkout, conta, treinamento e administração novos não tiveram um equivalente público original confirmado. Sitemap/robots não puderam ser consultados; páginas públicas não vinculadas ao menu ainda precisam ser inventariadas.

| Página original | Rota nova | Estado observado |
| --- | --- | --- |
| `/` | `/` | Todas as seções inspecionadas; diferenças grandes de composição |
| `/sobre-nos/` | `/sobre-nos` | História presente; faixa central e perfis divergentes |
| `/cabelos-e-penteados/` | `/cabelos-e-penteados` | Conteúdo e acervo presentes; recortes e medidas divergentes |
| `/maquiagem/` | `/maquiagem` | Estrutura presente; textos, recortes e fechamento divergentes |
| `/manicure-pedicure/` | `/manicure-pedicure` | Oito soluções presentes; associação de imagens precisa correção |
| `/terapia-capilar/` | `/terapia-capilar` | Resultados e diferenciais reorganizados e incompletos |
| `/certificacao-internacional/` | `/certificacao-internacional` | Estrutura mais próxima; acabamento e carrosséis divergentes |
| `/shop/` | `/loja` | Visual, ordenação, cartões e paginação divergentes |
| `/product/acidificante-redutor-de-ph-500ml-extrato-de-acai-e-oleo-de-pracaxi/` | `/produto/acidificante-redutor-de-ph-500ml-extrato-de-acai-e-oleo-de-pracaxi` | Descrição completa, metadados, abas e relacionados ausentes |
| `/product-category/hidratacao-e-reparacao/` | `/categoria/hidratacao-e-reparacao` | Original: 74 resultados; novo: 346 sem filtro selecionado |
| `/marca/bioma-care/` | `/marca/bioma-care` | Original: 21 resultados; novo: 346 sem filtro selecionado |

Prioridades: **P0** falha funcional/arquivo/configuração; **P1** requisito essencial de paridade; **P2** acabamento, efeitos e validação complementar. Todas são necessárias para concluir a reprodução.

## 1. Base compartilhada

| ID | Prioridade | Evidência e ajuste necessário | Critério de aceite |
| --- | --- | --- | --- |
| G01 | P0 | Logo do cabeçalho e rodapé aponta para `/storage/uploads/9839d4af-a5fd-486d-a7e2-e2b53a14132e/960.webp`. O arquivo existe em `apps/api/storage/uploads`; o 404 acontecia porque as rotas estáticas e o serviço de mídia montavam o caminho a partir do diretório atual de execução. Tornar o caminho independente do cwd e oferecer fallback quando um upload persistido falhar. | Logo correto carregado das duas pastas usuais de execução e após atualização da configuração. |
| G02 | P0 | Configuração pública altera o Instagram para `instagram.com/jonaselivaldohair/` e telefone para `tel:+96981001897`. Original usa `instagram.com/jonas_elivaldo_hair_designers/` e WhatsApp `wa.me/5596981001897`. Corrigir dados canônicos e validar formato. | Destinos corretos antes e depois da hidratação; telefone internacional com DDI quando usado como ligação. |
| G03 | P1 | Faixa superior desktop aproximadamente 22 px no original contra 34 px no novo. Endereço original completo é um link de mapa; novo usa texto abreviado. Restaurar medidas, endereço e interação. | Mesmo conteúdo, altura, alinhamento e destino do mapa. |
| G04 | P1 | Cabeçalho original preto, navegação Work Sans; novo usa outros tons/fontes e controles de conta/carrinho extras. WhatsApp original retangular, texto branco, contra botão arredondado com texto escuro no novo. Reproduzir logo, menu, submenus, estado ativo, botão e comportamento fixo. Integrar conta/carrinho sem alterar a composição institucional de referência. | Comparação visual do cabeçalho em topo e após rolagem; menus e controles comerciais continuam acessíveis. |
| G05 | P1 | Fontes e pesos não correspondem por função: o original combina Work Sans, Montserrat, Roboto Slab e, em alguns blocos, Inter Tight. Títulos frequentemente cresceram de 31–42 px para 48–64 px. Criar tokens por componente, evitando uma substituição global indiscriminada. | Mesmas quebras de linha, peso, altura de linha, cor e largura em cada seção. |
| G06 | P1 | Rodapé: proporções do logo, títulos, ícones, espaçamentos, marca do desenvolvedor e gradiente inferior divergem. Original usa bandeiras gráficas; novo usa emojis. | Reproduzir os dois blocos do rodapé e a faixa inferior com assets estáveis, links corretos e dimensões correspondentes. |
| G07 | P2 | Tradução, ícones e acessibilidade usam implementações diferentes. Conferir visual e comportamento do tradutor; evitar que elementos do widget apareçam indevidamente ou causem deslocamento. | Seis idiomas e estado ativo correspondentes; navegação por teclado, contraste e foco preservados. Não é necessário copiar o plugin WordPress para reproduzir sua função. |

## 2. Home

| ID | Prioridade | Seção: diferença e ação |
| --- | --- | --- |
| H01 | P1 | Hero: original ocupa aproximadamente uma viewport; novo usa 800 px no desktop observado e posiciona título e fundo em outra altura. Ajustar sobreposição com cabeçalho, altura, largura de texto, centro focal e overlay. Os 15 assets do slideshow já estão cadastrados corretamente. |
| H02 | P1 | Texto animado: original alterna três mensagens com efeito drop-in; novo exibe apenas a frase final no conteúdo renderizado observado. Restaurar sequência, área reservada e alinhamento sem deslocar os botões. |
| H03 | P1 | Sobre Nós: original tem apresentação curta; novo repete os cinco parágrafos da história completa. Restaurar a síntese da Home, hierarquia do nome/subtítulo e composição da foto `2026/09/home.webp`. História completa permanece na página Sobre Nós. |
| H04 | P1 | Cinco serviços: calibrar altura, proporção das fotos, overlays, textos de hover e numeração. O original retorna 404 em `/servicos/`; o caminho novo `/servicos#eventos` mantém uma rota de compatibilidade que leva ao card Eventos real na Home. Preservar esse destino efetivo sem criar página de Eventos. |
| H05 | P1 | Loja/salão: chamada original tem título de 38 px; novo chega a 64 px e muda a quebra de linhas. Os nove assets já existem, mas o novo carrossel com controles/contador diverge do slideshow de fundo original. Reproduzir composição, alturas e apresentação. |
| H06 | P1 | Agendamento de cabelos e unhas: títulos originais Montserrat ~33 px, novos Work Sans ~52 px. Reproduzir colunas, recortes, textos auxiliares, espaçamentos e botões, inclusive largura e cor do texto. |
| H07 | P1 | Depoimentos: os três conteúdos estão em grande parte presentes. Ajustar título de ~54 px para a hierarquia original ~32 px, peso, mosaico de imagens, alinhamento e apresentação dos depoimentos. |
| H08 | P2 | Efeitos: original registra fade de hero com intervalo/transição de 1500 ms, loop, escala e movimento vertical; texto rotativo com intervalo 2500 ms. Slideshow da loja registra intervalo 4000 ms, transição 2500 ms e Ken Burns. Calibrar observando ciclos completos e rolagem; manter alternativa com movimento reduzido. |

Aceite: reproduzir ordem, texto, recortes e início/fim de cada seção. A Home observada tinha aproximadamente 6144 px no original e 7931 px no novo: revisar a composição inteira, não apenas reduzir sua altura total.

## 3. Sobre Nós

| ID | Prioridade | Seção: diferença e ação |
| --- | --- | --- |
| A01 | P1 | Abertura: original declara vídeo de fundo do YouTube `LHVlCGzfb4I`; novo usa foto estática JE-6. O vídeo original não ficou reproduzível na sessão. Verificar disponibilidade e usar poster coerente quando indisponível; não reproduzir uma área vazia causada por falha externa. Conferir também o ID usado no botão de vídeo da Home. |
| A02 | P1 | História: cinco parágrafos presentes. Ajustar títulos de 64 para a hierarquia original de 42 px, collage e sobreposição. A foto secundária inferior original é aproximadamente 200 × 272; novo usa dimensões próximas às da outra foto, mudando o mosaico. |
| A03 | P1 | Faixa central: original atual apresenta cinco painéis fotográficos JE-6, FOTO-305, produt-6, JE-7 e JE-8. Não foram encontrados textos visíveis de Missão/Visão/Valores nos painéis originais; novo adiciona três cartões textuais. Alinhar com a referência atual e registrar a mudança em relação à especificação antiga. |
| A04 | P1 | Equipe: oito pessoas e arranjo 2 + 3 + 3 já presentes. Ajustar largura dos destaques, enquadramento das fotos, nomes, funções, títulos e espaçamentos. |
| A05 | P1 | Perfis: os oito popups originais contêm biografias; todos os `leaders[].detail` novos estão vazios. Importar texto completo e campos de apresentação próprios do popup. Ex.: nome completo e função de Marisa diferem da versão abreviada do cartão. Reproduzir composição do modal preservando foco, Escape e retorno de foco já existentes. |

## 4. Serviços: correções comuns

Os quatro serviços já têm heros, etapas/soluções e fechamento. Os heros usam imagens correspondentes, mas a implementação aplica um modelo visual uniforme a páginas que têm diferenças reais.

| ID | Prioridade | Ajuste |
| --- | --- | --- |
| S01 | P1 | Reproduzir hero por página: original próximo de 100vh, título Work Sans ~70 px; novo 760 px e título ~86 px. Ajustar overlay, eixo focal, posição do conteúdo e comportamento em rolagem. |
| S02 | P1 | Intro: título original Montserrat ~31 px contra Work Sans ~48 px. Restituir largura, quebra, gradiente, colunas e mosaico. Fotos secundárias estão frequentemente reduzidas a ~268 × 161, cortando retratos inteiros. |
| S03 | P1 | Soluções: manter pares título/imagem e altura coerente. Original usa fotos de fundo e recortes próprios; novo usa imagens com alturas variáveis. Definir proporção e `object-position` por asset, sem impor o mesmo recorte a todas as páginas. |
| S04 | P1 | Fechamento: restaurar eyebrow, descrição específica de cada serviço, rótulo do CTA e textos dos três benefícios. O novo reutiliza textos genéricos onde o original contextualiza cabelo, maquiagem, unhas ou terapia. |
| S05 | P2 | Conferir transições de hover, zoom, entrada em viewport, carrosséis, botões e lightboxes. Validar parâmetros durante a implementação; esta auditoria não certifica igualdade temporal dos efeitos. |

### Cabelos & Penteados

- **C01 — P1:** corrigir retrato secundário: original aproximadamente 254 × 452, novo 268 × 161. Restaurar o gradiente branco/preto da introdução.
- **C02 — P1:** soluções de penteados e coloração: imagens e textos existem, mas cards originais próximos de 377 × 509 passaram a 274 × 365; ajustar títulos e composição.
- **C03 — P1:** galeria possui 41 imagens em ambos, com seis iniciais e mais 35. Original preserva retratos próximos de 291 × 517; novo usa recortes próximos de 417 × 410. Restaurar proporção, fundo creme/dourado e botão; remover o rótulo extra “41 FOTOS” se ausente na referência.
- **C04 — P2:** validar ordem integral, expansão, lightbox, próximo/anterior, Escape e retorno à posição na página.

### Maquiagem

- **M01 — P1:** restaurar a frase de introdução do original, substituída por outra sobre cuidado da pele, e demais diferenças de texto/pontuação.
- **M02 — P1:** calibrar collage: foto principal original ~455 × 569 contra nova ~363 × 482; secundária original ~254 × 318 contra nova ~268 × 161.
- **M03 — P1:** manter três soluções e três imagens de resultados já presentes, restaurando cards, retratos verticais, fundo e título da galeria.
- **M04 — P1:** restaurar fechamento específico para ocasiões, benefícios e chamada de contato.

### Manicure & Pedicure

- **N01 — P1:** ajustar quatro etapas: títulos originais ~22 px contra novos ~16 px; conferir números, espaçamento e alinhamento.
- **N02 — P1:** manter oito soluções em 3 + 3 + 2. A sequência das imagens está deslocada em relação à referência: original inicia em `image-6-1`, novo em `IMG_6718`, deixando a primeira imagem ao final. Reconciliar cada par título/asset antes de calibrar recortes.
- **N03 — P1:** eliminar alturas discrepantes entre cartões; imagens novas produzem alturas aproximadas de 352 a 626 px. Restaurar a grade, overlays e alinhamento dos títulos.
- **N04 — P1:** corrigir espaço antes de vírgula na introdução e restaurar fechamento específico. Não adicionar galeria extra: o original atual não tem uma galeria separada depois das oito soluções.

### Terapia Capilar

- **T01 — P1:** conferir os primeiros cards. A revisão do CSS/DOM do original mostra `capilar-5.jpg` em Terapia Capilar Avançada e `Gemini_Generated_Image_1zjcl…` em Tricoscopia Capilar; a implementação atual já usa essa ordem, portanto não inverter.
- **T02 — P1:** reconstruir Resultados como seção própria, com fundo dourado/creme, seis benefícios com ícones e casos de antes/depois. Novo combina resultados e diferenciais lado a lado, alterando a estrutura.
- **T03 — P1:** preservar os cinco slides e a apresentação comparativa observada. Revisão do DOM/CSS atual do original confirma cinco imagens, mas somente a primeira está legendada “ANTES” e a segunda “DEPOIS”; os outros três slides não têm essas legendas. Não inventar pares/legendas além do que aparece na referência.
- **T04 — P1:** reconstruir “Por que escolher” em bloco separado: introdução completa, quatro diferenciais e duas imagens corretas. Novo reduz a conteúdo em lista e usa fotos capilares onde o original usa fotos institucionais/aromaterapia.
- **T05 — P1:** restaurar CTA e fechamento próprios da terapia. Esta é a página de serviço com maior retrabalho estrutural.

## Execução em curso — 02/10/2026

| ID | Estado observado após implementação | Evidência e pendências |
| --- | --- | --- |
| M01 | Texto original restaurado. | Teste institucional direcionado passou. M02/M03 ainda precisam de calibração visual de collage, cards e galeria. |
| M04 | Texto de fechamento e chamada específicos restaurados. | Coberto pelo teste institucional direcionado; a conferência fina das dimensões do fechamento continua pendente. |
| N02 | Pareamento dos oito assets corrigido na ordem do CSS original. | Teste verifica os oito arquivos associados a cada posição; N01/N03 seguem pendentes. |
| N04 | Espaço de pontuação corrigido e fechamento próprio recuperado. | Implementação registrada no conteúdo de serviço; revisar dimensões junto com S04. |
| T01 | **Sem mudança de asset necessária.** | A inspeção da página e do CSS originais mostra `capilar-5.jpg` no primeiro card e `Gemini_Generated_Image_1zjcl…` no segundo; o site novo já corresponde. A observação de inversão deste item estava ao contrário. |
| T02 | Estrutura dedicada implementada. | Seção dourada, seis benefícios com ícones e carrossel com cinco slides. Teste e renderização local em 1370 px conferidos. A posição vertical ainda depende da calibração compartilhada de S01/S02. |
| T03 | Conteúdo e navegação implementados conforme o original atual. | Cinco slides em ordem; somente os dois primeiros recebem “ANTES”/“DEPOIS”. Teste e avanço do carrossel conferidos no navegador. A descrição inicial do plano superestimava as legendas. |
| T04 | Bloco de diferenciais reconstruído com carrossel institucional. | Texto integral, quatro itens, duas fotos de aromaterapia, setas e paginação conferidos em desktop e no layout local de 390 px; a navegação para o segundo slide foi exercitada. A comparação mobile lado a lado com o original continua pendente. |
| T05 | Texto e CTA próprios restaurados. | Copy/CTA verificados no teste institucional; proporções e acabamento do fechamento ainda dependem de S04 e QA de página. |
| Mobile compartilhado | Overflow horizontal encontrado e corrigido no endereço do cabeçalho. | Em 390 px, o endereço completo agora quebra linha dentro do contêiner e `scrollWidth` fica igual ao `clientWidth` (375 px CSS úteis no browser testado). |
| S01 — mobile | Hero responsivo calibrado nas quatro páginas de serviço. | Em 390 px, o hero usa 100vh; no original e local de Cabelos & Penteados, cabeçalho (~108,6 px), título (55/55 px) e CTA (~194 × 56 px) ficaram alinhados. Seta do CTA e marca oficial do WhatsApp reproduzidas. Sem overflow horizontal. Desktop segue pendente. |
| S02 — mobile | Intro responsiva calibrada nas quatro páginas de serviço. | Collage vem antes do texto e usa dimensões/recortes por serviço; alturas dos cartões de texto ficaram praticamente iguais às do original. Conferência coberta por `service-detail-responsive.spec.ts`; desktop segue pendente. |
| S05 | Parcial; fidelidade temporal de efeitos permanece pendente. | Arrow-down, WhatsApp e renderização estática foram conferidos. Ainda falta percorrer ciclos completos de entrada, hover/zoom, carrosséis e lightboxes. |

Validação acumulada: build de produção da loja aprovado (`pnpm --filter storefront build`, incluindo `tsc --noEmit`); suíte completa aprovada (12 arquivos, 108 testes); a comparação mobile foi feita lado a lado em 390 px. Ainda faltam desktop/tablet e QA de efeitos, além das páginas e tarefas restantes do plano.

## 5. Certificação Internacional

- **I01 — P1:** manter as cinco seções principais e conteúdos já presentes. Calibrar abertura dourada/preta, largura do texto, retrato, certificado, sobreposições e fonte do texto principal.
- **I02 — P1:** conferir os quatro benefícios e suas imagens de fundo, overlays, ícones e recortes. Os assets estão cadastrados; não tratá-los como ausentes apenas porque estão em CSS.
- **I03 — P1:** ajustar os quatro compromissos e a apresentação das duas fotos; retirar contador/controles que não correspondem à referência e reproduzir o comportamento observado do carrossel.
- **I04 — P1:** fechamento: título original ~38 px contra novo ~32 px; revisar textos, cards, CTA e distâncias.
- **I05 — P2:** conferir destino de validação CNBS, legibilidade do certificado e navegação por teclado. Alturas totais próximas, ~4320 e ~4315 px, não demonstram paridade interna.

## 6. Loja, categorias, marcas e produto

| ID | Prioridade | Evidência e ação | Aceite |
| --- | --- | --- | --- |
| L01 | P0 | `/categoria/:slug` e `/marca/:slug` renderizam apenas `<ShopPage />`. A categoria Hidratação e Reparação mostra 346 em vez de 74; BIOMA CARE mostra 346 em vez de 21. Aplicar slug, selecionar filtro e sincronizar navegação/consulta/paginação. | URL direta, recarga e voltar mantêm escopo correto; contagem e cartões pertencem à categoria/marca. |
| L02 | P0 | Imagens ausentes geram placeholders; logo BIOMA usa upload inválido. Inventariar mídias de produtos e marcas e restaurar arquivos reais antes de refinamento visual. | Zero imagem quebrada no inventário publicado; relatório explícito para asset que não existir no original. |
| L03 | P1 | Loja original mantém cabeçalho institucional; novo substitui menu por busca, adiciona uma segunda faixa e um bloco grande “Loja”. Reproduzir estrutura original e acomodar busca conforme referência. | Início da listagem, sidebar e cabeçalho visualmente alinhados ao original. |
| L04 | P1 | Original apresenta categoria antes de marca; novo inverte. Rail original tem logotipos, novo nomes em texto. Reconciliar taxonomia, ordem e assets; auditar registro “Nova-marca” e Gift Card para saber se são conteúdo de demonstração ou itens válidos. | Apenas registros publicados válidos, ordem e logos correspondentes. |
| L05 | P1 | Original inicia alfabeticamente em Acidificante; novo ordena por mais recentes e não oferece ordem alfabética. Ajustar padrão e opções. Há entidades HTML literais como `CURL &AMP; WAVE`. | Primeira página corresponde ao inventário original; nomes decodificados corretamente. |
| L06 | P1 | Cards originais usam botão direto de adicionar ao carrinho; novo adiciona favoritos/avaliação/marca e “VER PRODUTO”. Reproduzir foto, espaçamento, título, preço, bordas e CTA, mantendo funções adicionais em posição que não altere a referência. | Mesma grade e conteúdo visível; compra continua funcional. |
| L07 | P1 | Ambos declaram 346 produtos. Original informa 1–16, mas renderizou 12 cards e 29 páginas; novo mostra 16 e 22 páginas. Resolver a inconsistência do original em vez de copiar contagem contraditória. | Page size, cards renderizados, faixa anunciada e total de páginas matematicamente coerentes; composição de referência preservada. |
| L08 | P1 | Produto Acidificante: preço R$190 e imagem principal correspondem, mas falta breadcrumb, SKU, categorias/marca vinculadas, descrição completa, abas Descrição/Avaliações e quatro relacionados. Novo usa descrição genérica e tem conteúdo adicional de compra. | Produto de referência completo, na ordem original, com dados reais e imagem com proporção correspondente; recursos extras integrados sem substituir conteúdo. |
| L09 | P1 | Realizar inventário integral dos 346 itens: título, slug, SKU, preço, categorias, marcas, variantes, descrição, galeria, disponibilidade e relacionados. Comparação de um produto não certifica os demais. | Relatório de diferenças por item; nenhum campo obrigatório silenciosamente preenchido com texto genérico. |
| L10 | P2 | Mapear rotas antigas `/shop`, `/product` e `/product-category` para rotas novas; conferir títulos, descrição, canonical e compartilhamento por página. Novo mantém título genérico na navegação observada. | Links antigos resolvem o conteúdo correspondente; metadados refletem a página/produto real. |

## 7. Plano de execução

1. **Inventário e base funcional:** listar rotas públicas e conteúdos; reconciliar mídia/configuração, G01–G02 e L01–L02. Produzir manifest de assets, catálogo e taxonomias; resolver conteúdo de demonstração e referências quebradas. Isso precede screenshots definitivos.
2. **Shell e tokens:** executar G03–G07; estabelecer fontes, cores, larguras, espaçamento, botões, menu fixo e rodapé. Calibrar primeiro a referência desktop com dimensões iguais. Atualizar DESIGN.md e regras anteriores de paridade.
3. **Home e Sobre Nós:** H01–H08 e A01–A05. Restituir síntese, faixas, proporções e biografias; testar vídeo e ciclos animados.
4. **Serviços:** construir variantes por página. Executar base S01–S05, depois Cabelos, Maquiagem, Manicure e Terapia. Terapia exige reconstrução própria dos resultados e diferenciais; não ampliar o template genérico para esconder essa diferença.
5. **Certificação:** I01–I05, reutilizando tokens aprovados e conferindo assets existentes.
6. **Commerce:** L03–L10, incluindo produto completo e inventário integral. Preservar carrinho, checkout, autenticação e administração; validar esses fluxos separadamente após mudar componentes compartilhados.
7. **Responsivo e efeitos:** comparação lado a lado em desktop, tablet e mobile; lightboxes, modais, submenus, hover, vídeo, rotadores, slideshow, sticky, tradução e movimento reduzido. Conferir cabeçalho em diferentes estados de sessão.
8. **Validação final:** fechar cada item com evidência, registrar divergências restantes e atualizar notas canônicas. Não declarar “idêntico” com base apenas em textos iguais, total de produtos ou altura total das páginas.

## 8. Pontos de implementação e validação

Arquivos identificados para a próxima etapa:

- `apps/storefront/src/components/storefront-shell.tsx`: cabeçalho, rodapé, controles e logo.
- `apps/storefront/src/content/site-config-client.tsx`: resolução da configuração pública e fallback.
- `apps/storefront/src/content/institutional-content.ts`: textos, assets, biografias, slideshow e links.
- `apps/storefront/src/pages/home-page.tsx`, `about-page.tsx`, `service-detail-page.tsx`, `certification-page.tsx`: composição por página.
- `apps/storefront/src/pages/category-page.tsx`, `brand-page.tsx`, `shop-page.tsx`, `product-page.tsx`: escopo dos filtros e apresentação comercial.
- `apps/storefront/src/routes/router.tsx`: destinos, redirecionamentos e compatibilidade de rotas.

A exploração foi realizada com CodeGraph e confirmada pelo comportamento no navegador. Causas verificadas: biografias vazias no conteúdo, wrappers de marca/categoria sem parâmetro e URL de logo inválida substituindo o fallback. A execução deve investigar a camada de dados do catálogo antes de escolher como importar conteúdo completo.

Checklist de aceite por página:

- Mesma ordem de seções, texto, hierarquia, botões e destinos.
- Mesmo asset, proporção, recorte, overlay, posição e carregamento estável.
- Mesmas fontes/pesos, larguras, quebras, margens e altura útil de cada seção.
- Comparação visual com viewport igual e mesmo estágio de carregamento/animação. Usar screenshots de viewport por seção; capturas full-page desta ferramenta distorceram heros baseados em viewport e não servem de referência de altura.
- Efeitos validados ao longo de ciclos completos; vídeo indisponível tratado com poster, não com vazio.
- Mobile em 390/430 px, tablet em 768 px e desktop em 1370/1440 px, com dimensões realmente confirmadas nos dois lados, sem overflow ou colisão de menu/CTA.
- Fluxos e acessibilidade preservados: teclado, foco, Escape, expansão de galeria, filtros, recarga, paginação, carrinho e checkout local sem cobrança real.
- Evidência antes/depois e status por ID. Diferenças toleradas devem ser registradas explicitamente, incluindo inconsistências que existem no próprio original.
