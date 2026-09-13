# Paridade visual 1:1 do site institucional Jonas & Elivaldo

Data: 2026-09-13

## Objetivo

Reconstruir no storefront React as páginas públicas do WordPress antigo com a mesma ordem de seções, conteúdo, imagens, composição, proporções e efeitos relevantes. O resultado deve preservar a operação comercial do novo sistema sem carregar Elementor, WordPress ou scripts de plugins na aplicação React.

## Escopo

Rotas que receberão paridade estrutural e visual:

- `/`
- `/sobre-nos`
- `/cabelos-e-penteados`
- `/maquiagem`
- `/manicure-pedicure`
- `/terapia-capilar`
- `/certificacao-internacional`

A rota `/servicos` permanece como índice próprio do novo sistema, pois não existe uma página equivalente no WordPress antigo. A rota `/loja` mantém a direção visual aprovada no Superdesign. Carrinho, login, conta, checkout e painel administrativo permanecem funcionais e fora da reprodução institucional.

## Direção técnica escolhida

A reconstrução será nativa em React e CSS, orientada por dados. Não será transplantado HTML gerado pelo Elementor porque ele depende de identificadores, estilos e scripts frágeis do WordPress. Também não serão usadas imagens de tela como substituto de conteúdo real.

Os elementos repetidos serão componentes compartilhados, enquanto cada página poderá escolher variantes estruturais para reproduzir suas particularidades. As imagens públicas do WordPress serão catalogadas em uma fonte central. A primeira entrega pode continuar referenciando os arquivos HTTPS existentes; a estrutura ficará preparada para trocar cada URL por mídia local administrável sem alterar os componentes.

## Estrutura global

### Cabeçalho

- Reproduzir as proporções da barra dourada, logo, navegação preta, sublinhado ativo e dropdown de serviços.
- Manter `Carrinho` e `Entrar`, mas integrados como ações compactas para não alterar o eixo visual do menu antigo.
- Reproduzir o comportamento sticky/responsivo e o submenu mobile.
- Não copiar a barra administrativa do WordPress.

### Rodapé

- Recriar as colunas de logo, endereço, contato e Instagram.
- Recriar a faixa inferior dourada, copyright e espaço de crédito visual.
- Incluir seletor visual de idiomas somente quando houver comportamento real; não serão exibidos controles falsos.
- O widget externo de acessibilidade não será copiado. A aplicação manterá semântica, teclado, contraste e `prefers-reduced-motion` nativos.

### Tokens e movimento

- Títulos: Work Sans, pesos e alturas de linha equivalentes ao WordPress.
- Corpo: Montserrat nas áreas em que a referência realmente o utiliza.
- Cores: preto, branco, dourado e amarelo da referência.
- Reproduzir crossfade, zoom lento, hover de cards, entradas suaves e carrosséis.
- Desativar movimento não essencial quando `prefers-reduced-motion: reduce` estiver ativo.

## Home

- Hero em tela cheia com as 15 imagens observadas no Swiper antigo, crossfade e zoom lento.
- Texto completo rotativo, CTA de vídeo e indicador de rolagem.
- Bloco Sobre Nós com texto, imagem e proporções da referência.
- Faixa de cinco serviços full-bleed com imagens, overlays e expansão/zoom no hover.
- Carrossel institucional de nove imagens do salão na posição equivalente.
- Bloco de loja com galeria rotativa e CTA para `/loja`.
- Blocos de agendamento de cabelo e unhas com as mesmas imagens, alinhamentos e CTAs.
- Depoimentos em duas composições, com as três clientes e imagens observadas no site antigo.

## Sobre nós

- Hero visual equivalente ao WordPress, com fallback estável quando o vídeo remoto não estiver disponível.
- Seção Nossa História com colagem de três imagens e texto integral.
- Faixa visual de ambiente, missão, visão e valores com imagens e ícones originais.
- Equipe em grade 2 + 3 + 3, com dimensões e rodapés dos cartões equivalentes.
- Cada profissional abrirá um modal acessível, reproduzindo o efeito de popup do Elementor; o modal terá foco contido, fechamento por Escape e retorno de foco.
- Remover seções finais que não existam na página antiga.

## Páginas de serviço

Um `ServiceDetailPage` compartilhado continuará responsável pela composição, mas o contrato de dados aceitará variantes para hero, introdução, soluções, processo, galeria, benefícios, diferenciais e fechamento.

### Cabelos e Penteados

- Preservar hero, introdução e duas soluções.
- Corrigir molduras, gradientes, ícones e proporções dos cards.
- Exibir as seis fotos iniciais da galeria antiga e disponibilizar as 35 restantes pelo botão `Ver mais`.
- Abrir imagens em lightbox com navegação anterior/próxima, teclado e contador.
- Corrigir a descrição e os textos dos três cards do fechamento.

### Maquiagem

- Preservar hero e introdução com a colagem original.
- Reproduzir os três cards de maquiagem com o tratamento visual do Elementor.
- Usar as três imagens reais da galeria antiga.
- Recriar o fechamento com imagem, overlay, subtítulo, CTA e três cards.

### Manicure e Pedicure

- Preservar hero, introdução e processo de quatro etapas.
- Reproduzir os oito serviços com o mesmo tratamento gráfico.
- Remover a galeria `Unhas feitas para você`, ausente no fluxo antigo auditado.
- Recriar o fechamento com descrição e mensagens específicas de manicure.

### Terapia Capilar

- Corrigir a imagem principal da introdução para `capilar-3-1028x1536.jpg`.
- Preservar o processo de quatro etapas e cinco tratamentos com o tratamento visual correto.
- Substituir a galeria genérica pelo bloco amarelo de benefícios e carrossel antes/depois de cinco casos.
- Recriar `Por que você deve nos escolher` com texto, quatro diferenciais e carrossel lateral de duas imagens.
- Recriar o fechamento com texto e CTA específicos.

## Certificação Internacional

- Remover a introdução genérica que não existe no original.
- Recriar a primeira composição com certificado, texto do especialista, chamada de validação e link externo do CNBS.
- Recriar `O que significa essa certificação` com quatro itens.
- Adicionar `Benefícios exclusivos` com os quatro cards ausentes.
- Recriar `Por que você deve nos escolher` com texto, quatro compromissos e carrossel de duas imagens.
- Recriar o fechamento completo com descrição, CTA e três cards de confiança.

## Componentes previstos

- `LegacyCarousel`: autoplay opcional, controles, indicadores e pausa por interação.
- `MediaLightbox`: abertura por miniatura, teclado, contador e foco acessível.
- `ProgressiveGallery`: quantidade inicial configurável e expansão preservando a ordem.
- `TrustClosingSection`: imagem/overlay/textos/cards configuráveis por página.
- `TeamMemberModal`: popup acessível dos profissionais.
- `LegacyServiceCard`: moldura, gradiente, ícone, imagem e conteúdo em variantes.
- `LegacyFooter`: rodapé institucional compartilhado.

## Dados e imagens

- Centralizar listas de imagens, textos, legendas e variações no conteúdo institucional e no conteúdo de serviços.
- Preservar a ordem das imagens observada no WordPress.
- Não carregar scripts do Elementor, GTranslate ou UserWay.
- Não modificar o WordPress antigo durante a auditoria ou implementação.

## Responsividade

- Desktop será alinhado inicialmente à referência auditada em aproximadamente 1680 px.
- Tablet e mobile manterão a ordem semântica, reduzirão grades progressivamente e evitarão cortes que ocultem rostos ou conteúdo principal.
- Galerias e carrosséis aceitarão gesto horizontal, botões e teclado.
- Header, dropdown, modais e lightbox deverão funcionar a partir de 320 px.

## Testes e QA

- Testes de contrato para ordem e presença das seções de cada rota.
- Testes comportamentais para carrossel, `Ver mais`, lightbox e modal da equipe.
- Testes para garantir que Manicure não renderize a seção extra e que Certificação contenha as seções hoje ausentes.
- Testes de navegação e links de WhatsApp/CNBS.
- Typecheck, lint, suíte completa e build do storefront.
- QA visual comparativo desktop e mobile entre WordPress e localhost, com capturas das seções principais.

## Critérios de aceite

- Todas as seções do WordPress aparecem na mesma ordem na rota nova correspondente.
- Textos e imagens auditados correspondem à origem, salvo correções ortográficas explicitamente preservadas pelo projeto.
- Carrosséis, galerias, lightbox, modais, hover e movimento funcionam sem dependências do WordPress.
- Não há seções extras nas páginas que pretendem paridade 1:1.
- Loja, carrinho, login e checkout continuam funcionando.
- A aplicação permanece responsiva, acessível e compatível com o build destinado à Hostinger Business.
