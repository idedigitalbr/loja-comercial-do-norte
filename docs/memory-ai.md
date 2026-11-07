# MEMORY AI — COMERCIAL DO NORTE

> **Documento canônico de contexto e decisões do projeto** — atualizado em **25/10/2026**.
> Leitura obrigatória para qualquer agente de IA ou desenvolvedor antes de planejar, implementar ou revisar alterações.
> Repositório: `https://github.com/idedigitalbr/loja-comercial-do-norte`.
> Complemento operacional: [`roadmap.md`](./roadmap.md). **Nesta pasta existem somente estes dois arquivos `.md`** (os únicos complementos ficam em `security/`).

## 0. Ordem de autoridade e regra de atualização

- **07/11/2026 — Substituição Canônica das Marcas Oficiais (12 Marcas e 24 Submarcas) e 120 Produtos Fictícios com Logos de Alta Resolução (executorId: `antigravity-gemini`):**
  - **Substituição Integral das Marcas Antigas pelas 12 Marcas Oficiais do Setor:**
    - Removidas todas as marcas de exemplo anteriores (`Copobras`, `Cristalcopo`, `Wyda`, `NortePlast`, `Mili`, `Nestlé`, `Supermax`, `Grandha`, `Maxiline`, `Knut`).
    - Instalados os 12 logotipos oficiais em alta resolução na pasta canônica `apps/storefront/public/assets/PRODUTOS/marcas-imgs/` a partir de `LOGOS MARCA-S PALSTICO`:
      1. `Fasapel` (`marca-fasapel.png`): Papéis toalha interfolhados, guardanapos e bobinas de alta absorção.
      2. `Fonteplast` (`marca-fonteplast.png`): Sacolas plásticas reforçadas, bobinas picotadas e embalagens flexíveis.
      3. `Knauf` (`marca-knauf.png`): Caixas térmicas EPS (isopor), isolamento de temperatura e marmitas conservadoras.
      4. `Lanchero` (`marca-lanchero.png`): Hamburgueiras térmicas, barcas para lanche e embalagens para porções e fast food.
      5. `Plasan` (`marca-plasan.png`): Potes redondos, retangulares e recipientes herméticos para molhos e sobremesas.
      6. `Prafesta` (`marca-prafesta.png`): Linha freezer e micro-ondas, marmitas práticas e descartáveis premium para festas.
      7. `Segplast` (`marca-segplast.png`): Filmes stretch para paletização, filmes de PVC culinário e fitas de fechamento seguro.
      8. `Sicao` (`marca-sicao.png`): Chocolates nobres, coberturas fracionadas, gotas forneáveis e cacau Barry Callebaut.
      9. `Techplast` (`marca-techplast.png`): Copos descartáveis PP e PS translúcidos, pratos e talheres reforçados.
      10. `Totalplast` (`marca-totalplast.png`): Copos térmicos EPS, marmitas térmicas e bandejas de isopor para frios e carnes.
      11. `Ultra Descartáveis` (`marca-ultradescartaveis.png`): Copos ultra resistentes PP e PS, potes bolha para açaí e sobremesas.
      12. `Vipel` (`marca-vipel.png`): Sacolas e sacos de papel kraft delivery, bobinas de papel e papéis acoplados.
  - **Hierarquia de 24 Submarcas e Vitrine Canônica (`DEFAULT_BRAND_SHOWCASE`):**
    - Cada marca conta com 2 submarcas ativas vinculadas (`fasapel-guardanapos-toalhas`, `fonteplast-sacolas-camiseta`, `knauf-caixas-termicas`, `lanchero-hamburgueiras`, `sicao-chocolates-barras`, etc.).
    - Atualizados `DEFAULT_BRAND_SHOWCASE` em `apps/storefront/lib/brands-data.ts`, carrosséis de vitrine (`brands-carousel.tsx`, `product-carousel.tsx`) e seed idempotente (`seed-catalog.ts`).
  - **Catálogo de 120 Produtos Fictícios Estruturados (10 Produtos por Marca):**
    - Criados 120 produtos ricos com especificações completas de food service, atacado e delivery em `prisma/seed-catalog-data.ts`.
    - Cada produto possui slug único, SKU oficial padronizado com prefixo da marca (`FAS-...`, `FON-...`, `KNA-...`, etc.), dimensões milimétricas, peso em gramas, categorias, segmentos de mercado (lanchonete, pizzaria, padaria, delivery, buffet) e tags técnicas (`reforcado`, `termico`, `vai-ao-micro-ondas`, `kraft`, `biodegradavel`).
    - Limpeza automática de registros legados de seed (`legacySource = DEMO_SOURCE`) integrada em `prisma/seed-catalog.ts`.
  - **Validação Global:**
    - 68/68 arquivos de teste de API aprovados (177 testes).
    - 51/51 arquivos de teste do Storefront aprovados (253 testes, incluindo `brands-carousel.spec.tsx` e `catalog-view.spec.tsx`).
    - `pnpm typecheck`, `pnpm typecheck:seed` e `pnpm build` executados com 100% de sucesso.


- **07/11/2026 — Redesign Circular da Seção "Compre por Marca" e Reposicionamento entre Banners Triplos e Mais Vendidos (executorId: `antigravity-gemini`):**
  - **Reposicionamento Estratégico na Vitrine da Home (`s07-compre-por-marca`):**
    - A seção "Compre por Marca" foi reposicionada para ficar alocada imediatamente abaixo da seção de Banners Triplos 01 (`s05-triple-banners-1`) e logo acima de Mais Vendidos (`s06-mais-vendidos`), assumindo a posição e ordem canônica 6 em `home-configuration.ts`, `home-composition.json` e sincronizada via SQL no PostgreSQL Neon oficial (`SiteConfiguration.homeComposition`).
  - **Redesign Visual Circular de Alta Fidelidade ao Mockup de Referência:**
    - **Cabeçalho:** Implementado layout alinhado com ícone de etiqueta vermelha inclinada (`Tag` com rotação de -45° e traço em `#E2091E`), separador vertical cinza suave, título em negrito azul marinho (`text-[#001A49]`), subtítulo descritivo `"As principais marcas em embalagens, descartáveis e muito mais."` e botão pill azul no canto superior direito `"Ver todas as marcas →"` (`bg-[#004CB1] rounded-full`).
    - **Cards de Marcas 100% Circulares:** Substituídos os cards retangulares antigos por círculos perfeitos (`rounded-full aspect-square bg-white border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.06)]`) com logotipos das marcas centralizados em destaque e micro-animação fluida de elevação no hover (`hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,76,177,0.14)]`).
    - **Fidelidade 1:1 das Marcas na Página 1:** A primeira página do carrossel agora exibe exatamente as 6 marcas do mockup fornecido pelo usuário: `Lanchero`, `Fasapel`, `Segplast`, `Ultra Descartáveis`, `Knauf` e `Plasan`.
    - **Navegação & Paginação:** Setas circulares brancas laterais com efeito hover suave e paginação inferior de 3 bolinhas discretas (`size-2.5` e ativa em `#004CB1`) sincronizadas entre desktop e mobile com scroll touch/snap suave.
    - **Skeleton Shadcn 0-CLS:** Atualizado o skeleton de `brands-carousel` em `scroll-skeleton-reveal.tsx` para reproduzir as proporções circulares e o cabeçalho idênticos.
  - **Validação Global:** 51/51 arquivos de teste aprovados no Storefront (253 testes verdes, incluindo `brands-carousel.spec.tsx`, `catalog-view.spec.tsx` e `home-configuration.spec.ts`), `typecheck` com 0 erros e banco Neon sincronizado.

- **07/11/2026 — Eliminação de "Região Belém/PA" Automática no Cabeçalho, "Informe seu CEP" como Padrão e GPS com Bairro Real via Nominatim (executorId: `antigravity-gemini`):**
  - **Eliminação de "Região Belém/PA" Automática no Cabeçalho:**
    - O cabeçalho exibia "Enviar para Região de Belém/PA" automaticamente para novos visitantes e em abas anônimas devido ao overwrite do `detectLocationByIp()` e ao fallback estático do `DEFAULT_LOCATION`.
    - Atualizado o `DEFAULT_LOCATION.shortLabel` para `'Informe seu CEP'` (estilo Mercado Livre / Magazine Luiza).
    - Removida a sobreposição silenciosa por IP em `LocationProvider`.
    - Localizações legadas com `source === 'ip'` ou `source === 'default'` gravadas em cookies ou localStorage são ignoradas em `getStoredLocation()`.
  - **Solicitação Automática de Geolocalização com Bairro Real via Nominatim:**
    - Ao carregar o site para novos visitantes, o sistema solicita a permissão nativa de geolocalização do navegador (`navigator.geolocation.getCurrentPosition`).
    - Se o usuário permitir com 1 clique, o OpenStreetMap Nominatim resolve com precisão o bairro real (ex: `Pedreira, Belém/PA`, `São Brás, Belém/PA`, `Jurunas, Belém/PA`), gravando com `source: 'gps'`.
    - Se o usuário recusar ou ignorar, o cabeçalho permanece estritamente em `Enviar para Informe seu CEP`, sem palpites artificiais.
  - **Eliminação de CEP Falso de IP (`66020-250`) e Botão X de Limpeza:**
    - Modal de CEP abre 100% limpo em abas anônimas, sem nenhum card de entrega pré-selecionado.
    - Adicionado botão interativo `X` para limpar o CEP digitado e botão `Remover localização salva` com `clearStoredLocation()`.
  - **Validação:**
    - 51/51 arquivos de teste aprovados (252 testes), typecheck e lint 100% limpos.

- **07/11/2026 — Eliminação de CEP Falso de Telecom no Modal em Abas Anônimas e Botão X de Limpeza Rápida (executorId: `antigravity-gemini`):**
  - **Eliminação de CEP Falso de IP (`66020-250`):**
    - Identificado que a detecção de localização por IP (`ipwho.is` e headers Vercel) retornava o CEP da central do provedor de internet (`66020-250`), pré-preenchendo indevidamente o modal de CEP mesmo para visitantes novos ou em abas anônimas.
    - Atualizados `apps/storefront/app/api/location/route.ts` e `apps/storefront/lib/location.ts` para fixar `cep: ''` em qualquer detecção por IP, preservando apenas cidade e UF para a região padrão.
    - No modal `PostalCodeModal` (`postal-code-modal.tsx`), o input só inicializa preenchido se o usuário tiver inserido ou confirmado manualmente um CEP ou via GPS (`source !== 'ip' && source !== 'default'`). Em abas anônimas ou novos visitantes, o campo inicia 100% limpo com placeholder intuitivo.
  - **Botão de Limpeza Rápida (`X`) e Botão de Redefinição de Região:**
    - Adicionado botão interativo `X` dentro do campo de input do CEP quando há caracteres digitados. Ao clicar, o valor é apagado imediatamente e o foco retorna ao input.
    - Adicionada a ação `Remover CEP salvo e restaurar região padrão` quando há localização manual salva, permitindo ao usuário redefinir seu endereço com 1 clique e retornar para a região padrão.
  - **Validação:**
    - 51/51 arquivos de teste aprovados (252 testes), typecheck e lint 100% limpos.

- **07/11/2026 — Confirmação Transparente de Localização no Nort Chat sem Chute Automático e Precisão de Bairros via Nominatim (executorId: `antigravity-gemini`):**
  - **Problema Diagnosticado:** Ao clicar em *"📍 A mais próxima de mim"*, o chat alegava *"Olha, consegui acessar sua localização com precisão!"* e despejava opções calculadas sem perguntar onde o usuário realmente estava. Em desktops/notebooks com geolocalização Wi-Fi/IP imprecisa, apontava para São Brás enquanto o visitante estava na Pedreira, deixando o cabeçalho do site com o genérico "Belém/PA" devido ao BigDataCloud não fornecer o bairro.
  - **Prioridade para OpenStreetMap Nominatim em `reverseGeocodeCoordinates`:** Nominatim agora é consultado primeiro com headers apropriados (`Accept-Language: pt-BR` e `User-Agent`), garantindo resolução real de bairro (`addr.suburb`), rua (`addr.road`) e CEP oficial (`addr.postcode`) para Belém e Ananindeua (Pedreira, São Brás, Jurunas, Guamá, Marco, Nazaré, Cidade Nova, etc.). O cabeçalho exibe o bairro e cidade com precisão (ex: `Pedreira, Belém/PA`).
  - **Novo Passo de Confirmação no Chat (`UNIT_CONFIRM_LOCATION`):**
    - Em vez de assumir cegamente ou cravar uma loja sem consentimento, o Nort pergunta: `Você está em: 📍 [Bairro] ([Cidade])?`
    - Opções claras: `✅ Sim, estou em [Bairro]` e `📍 Não, estou em outro bairro`.
    - Ao confirmar `Sim`: o Nort responde calorosamente: `Perfeito! Então a unidade mais próxima para o seu atendimento é a [Nome da Loja] ([Endereço])! 🏬`, direcionando o atendimento e ativando a loja no site e no CRM.
    - Ao clicar `Não, estou em outro bairro`: o Nort responde amigavelmente e abre a seleção limpa dos bairros com filiais (`📍 Pedreira`, `📍 São Brás`, `📍 Jurunas`, `📍 Guamá`, `📍 Cidade Nova`, `📍 Outro bairro`), permitindo ao usuário na Pedreira escolher `📍 Pedreira` e ser direcionado diretamente para a *Filial Mauriti Pedreira (Tv. Mauriti, 1124)*, com sincronização instantânea no site.
  - **Validação Global:** 51/51 suítes de testes do Storefront aprovadas (252 testes, incluindo `nort-chat-floating.spec.tsx` e `location.spec.ts`), `turbo typecheck` e `turbo lint` aprovados com 0 erros.

- **06/11/2026 — Auto-Reconciliação Inteligente de Vitrine e Sincronização do Carrossel de Marcas no Neon DB (executorId: `antigravity-gemini`):**
  - **Diagnóstico de Divergência Localhost vs Vercel:** Identificado que a seção `s07-compre-por-marca` ("Compre por Marca") aparecia no localhost devido ao fallback padrão quando o banco local não possuía registro salvo (`homeComposition: null`), enquanto na Vercel a API retornava o snapshot anterior de 16 seções gravado em 05/11 no PostgreSQL Neon (`SiteConfiguration.homeComposition`).
  - **Sincronização Canônica no Neon de Produção:** Sincronizado o `SiteConfiguration.homeComposition` no banco Neon oficial com o JSON canônico atualizado de 17 seções (incluindo `s07-compre-por-marca: brands-carousel`, ordem 4) e registrado o histórico correspondente em `AuditLog`. A loja online na Vercel passou a renderizar o carrossel de marcas imediatamente.
  - **Camada de Blindagem — Auto-Reconciliação Inteligente (`reconcileComposition`):** Implementada a função pura `reconcileComposition` em `home-configuration.ts` e conectada em `composition-storage.ts` (`getStorefrontComposition`). Caso qualquer snapshot antigo do banco de dados não contenha uma seção canônica recém-criada no código (como `brands-carousel`), o sistema detecta a ausência e injeta a nova seção automaticamente na posição canônica exata, preservando reordenações, props e customizações do administrador.
  - **Validação de Testes e Typecheck:** Adicionados testes unitários em `home-configuration.spec.ts` validando injeção em snapshots legados, preservação de customizações e consistência com `composition-storage.spec.ts`. Typecheck do storefront aprovado com 0 erros.

- **06/11/2026 — Reorganização do Botão Alterar Dados no Chat do Nort e Badge de Unidade com Menu Seletivo e Sincronização no Site (executorId: `antigravity-gemini`):**
  - **Botão "Alterar meus dados" dentro de "Site / Loja Virtual":**
    - Removido o botão avulso do rodapé das categorias no chat do Nort.
    - A opção `"✏️ Alterar meus dados (Nome / WhatsApp)"` foi transferida e organizada como o primeiro item da categoria sanfona **"🌐 Site / Loja Virtual"**, mantendo a interface limpa e focada nas 3 categorias principais.
  - **Badge de Unidade de Atendimento no Cabeçalho do Chat:**
    - Posicionado no topo do chat, imediatamente à esquerda do botão de engrenagem (configurações), exibindo o ícone `📍` e o nome da unidade atual (ex: `📍 Bernardo Sayão (Jurunas)` ou `📍 Unidade Cidade Nova (Ananindeua)`).
    - O badge permanece visível assim que uma unidade é selecionada ou ativada no fluxo de atendimento.
  - **Menu Seletivo de Troca Rápida de Unidade:**
    - Ao clicar no badge, abre-se uma janela/modal de seleção de unidade dentro do chat.
    - No topo do seletor, destaca o card informativo canônico:
      `Seu atendimento atual é para a unidade: [Nome da Unidade] ([Endereço])` (ex: `Unidade Cidade Nova (Ananindeua-PA) (Tv. WE-59, 138)`).
    - Apresenta todas as unidades da Comercial do Norte com endereço, horários e indicação da unidade atual.
    - Ao selecionar uma nova loja, o atendimento é atualizado, uma confirmação é registrada no chat e no lead do CRM, e o modal fecha.
  - **Sincronização Automática com o Cabeçalho do Site (`LocationProvider`):**
    - Sempre que o Nort define ou altera a unidade física (seja por bairro, CEP, proximidade ou pelo seletor rápido), o local é sincronizado instantaneamente com o cabeçalho do site (`location.shortLabel`, ex: `Cidade Nova, Ananindeua/PA` / `Cidade Nova, Ananinde...`), mantendo a loja e o chat 100% integrados em tempo real.
  - **Validação:**
    - 51/51 arquivos de teste do Storefront aprovados (252 testes, incluindo `nort-chat-floating.spec.tsx`), typecheck limpo com 0 erros.

- **06/11/2026 — Eliminação de Atalhos Artificiais de Entrega Frequente no Modal de CEP e Refinamento de Bairros no Chat (executorId: `antigravity-gemini`):**
  - **Eliminação Definitiva de Atalhos Artificiais de Regiões Frequentes (`PostalCodeModal` / `location.ts`):**
    - Extinta a seção e constante de atalhos artificiais (`QUICK_LOCATIONS` / *"Regiões Frequentes (Comercial do Norte)"*).
    - O modal de CEP (`PostalCodeModal`) opera de forma limpa, direta e sem indução: busca direta por CEP (com cálculo oficial ViaCEP/BrasilAPI), link "Não sei meu CEP" (busca textual por rua/cidade/UF) e "Usar localização atual" (com geocodificação reversa real via GPS, sem injeção de fallbacks forçados).
  - **Pergunta Direta de Bairro no Chat do Nort com Nomes Limpos (`NortChatFloating`):**
    - Na pergunta *"em qual bairro você está?"* (`UNIT_NEIGHBORHOOD_CHOICE`), os botões de resposta rápida agora exibem exclusivamente os nomes limpos dos bairros onde há filiais da Comercial do Norte: `📍 Pedreira`, `📍 São Brás`, `📍 Jurunas`, `📍 Guamá`, `📍 Cidade Nova`.
    - Removidos nomes de avenidas/travessas dos botões (`(Tv. Mauriti)`, `(Av. Bernardo Sayão)`).
    - Removido o botão de fuga precoce `🏬 Ver todas as unidades` desta etapa de identificação de bairro.
  - **Opção Flexível para Outros Bairros e CEP:**
    - Adicionado o botão `📍 Outro bairro (digite o nome do bairro ou CEP)` que direciona para campo de texto que reconhece tanto bairros digitados (*Marco, Umarizal, Telégrafo, Nazaré, Campina*) quanto CEPs de rua via `findNearestStoreByNeighborhoodOrCep`.
  - **Validação Global:**
    - 51/51 suítes de testes do Storefront aprovadas (245 testes), typecheck (`turbo typecheck`) e lint (`turbo lint`) com 0 erros.

- **06/11/2026 — Criação da Rota Dedicada `/video` para Compartilhamento Externo e WhatsApp (executorId: `antigravity-gemini`):**
  - **Rota Dedicada `/video`:**
    - Criada a página `/video` (`apps/storefront/app/video/page.tsx` e `video-page-client.tsx`), permitindo que a apresentação em vídeo do Nort seja compartilhada diretamente via links externos (WhatsApp, redes sociais, bio do Instagram, etc.) no endereço canônico `https://loja-comercialdonorte.vercel.app/video`.
    - Ao acessar o link, o player cinematográfico em tela cheia (`NortIntroVideo`) é iniciado automaticamente com o aviso de ativação de áudio flutuante, barra de progresso vermelha a 60 FPS, tempo decorrido, modo fullscreen e botão de fechar.
  - **Hub de Ações Pós-Vídeo & Vitrine Institucional:**
    - Quando o usuário conclui o vídeo ou clica em fechar, a página exibe uma vitrine institucional moderna com tema escuro exclusivo (`#001438`), thumbnail HD extraída do vídeo original (`nort-intro-poster.jpg`), o mascote 3D Nort com o balão "Veja os produtos para seu segmento!", atalhos para os principais segmentos (Lanchonetes, Pizzarias, Confeitarias, Delivery) e 4 botões de ação rápida:
      1. *▶️ Assistir em Tela Cheia* (reabre o player cinematográfico instantaneamente);
      2. *🛍️ Acessar Loja Virtual* (redireciona para o catálogo `/`);
      3. *💬 Falar no WhatsApp* (abre conversa com mensagem personalizada de cotação);
      4. *📲 Compartilhar no WhatsApp* (compartilha o link oficial do vídeo com 1 clique).
  - **Open Graph & Twitter Cards Otimizados para WhatsApp:**
    - Metadados completos com título atraente, descrição comercial, tags de vídeo MP4 e imagem de capa (`nort-intro-poster.jpg` a 1200x630 e menos de 100KB, respeitando os limites da prévia do WhatsApp).
  - **Sitemap & Isolamento de Shell:**
    - Rota `/video` incluída no `sitemap.ts` com prioridade 0.8.
    - `StorefrontShell` atualizado para isolar a página `/video` sem poluir com header/footer da loja nem sobrepor o chat flutuante durante a reprodução.
  - **Validação Global:**
    - 51/51 suítes de testes do Storefront aprovadas (245 testes, incluindo `video-page.spec.tsx`), `turbo typecheck` com 0 erros e build Next.js 16 (`next build`) compilado com sucesso com a rota `/video` registrada.

- **06/11/2026 — Correção do Banner Explica Aí Nort (/post) e Integração Oficial de Vídeo YouTube Shorts (executorId: `antigravity-gemini`):**
  - **Correção da Identificação de Banner em `/post`:**
    - Corrigida a colisão onde a página de listagem de posts (`/post`) puxava inadvertidamente o carrossel de *Workshops & Aulas de Confeitaria* ao buscar `composition.widgets.find(w => w.type === 'video-articles-carousel')`.
    - A busca agora é estritamente vinculada ao widget `s15-explica-ai-comercial` (ou variante não-confeitaria), restaurando o banner vermelho oficial com o mascote 3D Nort e fundo geométrico.
  - **Integração de Vídeo YouTube Shorts no Explica Aí:**
    - Vídeo oficial YouTube Shorts (`https://www.youtube.com/shorts/m6drhnZQmCM`) vinculado ao post de caixas de pizza (`caixas-de-pizza-formatos-e-respiros`) e catálogo.
    - Implementado conversor robusto para URL embed segura (`youtube-nocookie.com/embed/...`) com proporção vertical adaptada (9:16) no modal.
    - O mockup do smartphone e botão de play no Hero Banner agora são totalmente clicáveis com feedback visual ao passar o cursor, abrindo o modal com autoplay, botão de fechar e atalho para o YouTube.
  - **Validação Global:**
    - 50/50 suítes de testes do Storefront aprovadas (239 testes), 68/68 suítes da API aprovadas (176 testes) e suítes do Admin e Packages 100% aprovadas.
    - Typecheck (`turbo typecheck`), Lint (`turbo lint`) e Build de produção (`turbo build`) executados com 0 erros.

- **06/11/2026 — Chat Inteligente sem "Chute" de Endereço, Resiliência a Bloqueios de GPS/Windows e Atalho Oficial da Pedreira (executorId: `antigravity-gemini`):**
  - **Chat Inteligente sem "Chute" de Endereço (`NortChatFloating`):**
    - Quando o visitante clica em *"📍 Encontrar a mais próxima de mim"*, o Nort nunca mais assume cegamente a Cidade Velha e nem recomenda o Jurunas ou Central quando o usuário está na Pedreira ou em outro bairro.
    - Se o GPS do navegador estiver bloqueado, desativado no Windows ou inacessível, e o usuário possuir apenas a localização aproximada por IP ("Belém/PA"), o Nort responde com transparência e empatia:
      > *"Identifiquei que você está na região de Belém/PA, mas não consegui acessar sua localização exata pelo navegador (pode estar desativada ou bloqueada no aparelho). Para eu não chutar seu endereço e te indicar a loja certinha mais perto de você, me conta: em qual bairro você está?"*
    - Exibe botões rápidos amigáveis dos bairros com filiais: `📍 Pedreira (Tv. Mauriti)`, `📍 São Brás (Matriz - Av. Rômulo Maiorana)`, `📍 Jurunas (Av. Bernardo Sayão)`, `📍 Guamá (Av. José Bonifácio)`, `📍 Cidade Nova (Ananindeua - Tv. WE-59)`, `📮 Digitar meu CEP da rua` e `🏬 Ver todas as unidades`.
    - Ao selecionar **Pedreira**, o atendimento é imediatamente direcionado para a **Comercial do Norte — Filial Mauriti Pedreira (Tv. Mauriti, 1124)**, atualizando o cabeçalho e a sessão para o CEP `66080-650` e bairro Pedreira.
  - **Tempo de Resposta Realista do GPS e LGPD:**
    - Aumentado o timeout do GPS de 1,2s para 6s, dando tempo suficiente para o usuário visualizar o prompt do navegador e clicar em "Permitir".
    - Totalmente compatível com a LGPD: se o usuário negar ou se o Windows/navegador bloquear, o sistema não trava, não chuta dados e oferece alternativas manuais amigáveis.
  - **Fim da Injeção de CEP Falso de Cidade Velha (`66020-600`) na Detecção por IP:**
    - Ajustadas as rotas e helpers (`location.ts`, `/api/location/route.ts` e `reverseGeocodeCoordinates`) para não injetar forçadamente o CEP `66020-600` de Cidade Velha na detecção inicial de IP. A detecção por IP mantém o CEP vazio ou referência real do bairro identificado via `getReferenceCepForNeighborhood`.
  - **Inclusão da Pedreira e Filiais em `QUICK_LOCATIONS`:**
    - `QUICK_LOCATIONS` atualizado para conter Pedreira (Tv. Mauriti, 1124 — CEP 66080-650) como primeira opção, seguida de São Brás, Jurunas, Guamá e Cidade Nova.
  - **Validação:**
    - 50 suítes de testes (239 testes) do Storefront 100% aprovados, incluindo testes de timeout e mock de GPS em `nort-chat-floating.spec.tsx` e `location.spec.ts`.
    - `typecheck` e `lint` 100% limpos.

- **06/11/2026 — Desativação da Abertura Automática do Tour Guiado ao Entrar no Site e Centralização Exclusiva Sob Demanda via Chat do Nort (executorId: `antigravity-gemini`):**
  - **Fim da Abertura Automática Invasiva ao Entrar no Site:**
    - Por determinação expressa do responsável, o tour guiado (`NortTourProvider` / `NortTourOverlay`) **NÃO** abre mais de forma automática ao carregar a página inicial da loja virtual, extinguindo qualquer overlay ou popup com o mascote bloqueando o conteúdo ao entrar no site.
    - A função `checkAndRecordAutoOpen` em `nort-tour-context.tsx` foi atualizada para retornar estritamente `false`.
  - **Acesso ao Tour Estritamente nos Locais Canônicos Pré-Existentes do Chat do Nort (`NortChatFloating`):**
    - Por alinhamento direto com o responsável, **não** foram adicionados botões avulsos na etapa de identificação ou retorno, e **não** há gatilhos em mensagens livres.
    - O acionamento do tour guiado fica restrito e consolidado estritamente nas seguintes opções do chat:
      1. *Pílula Discreta no Topo do Chat (acima do aviso de privacidade LGPD):* Botão minimalista `🧭 Fazer tour interativo pela loja ›`, posicionado entre a tag "Hoje" e o aviso de privacidade, permitindo acesso discreto logo no topo.
      2. *Categorias de Atendimento (`step === 'SERVICE'`):* Item canônico `"🧭 Fazer tour guiado interativo pela loja"` dentro do accordion *Site / Loja Virtual*.
      3. *Sidebar de Configurações (`sidebarView === 'menu'` / Ajuda):* Opção `"🧭 Fazer Tour Guiado na Loja"`, que fecha a sidebar, fecha a janela do chat e inicia o tour (`handleStartTourFromChat`).
  - **Validação:**
    - Suíte `nort-tour.spec.tsx` atualizada para validar que o tour permanece fechado na entrada e abre sob solicitação manual.
    - Suíte `nort-chat-floating.spec.tsx` validando que a identificação não possui botão avulso e que o acionamento via menu de serviços e sidebar funciona com 100% de sucesso.
    - Suíte completa do Storefront aprovada (100% verde), `typecheck` e `lint` com 0 erros.

- **05/11/2026 — Redesign do Chat do Nort: Categorias em Sanfona/Accordion, Delay Humano Realista (2-4s) e Seleção de Unidades Próximas em KM (executorId: `antigravity-gemini`):**
  - **Categorias de Atendimento em Sanfona/Accordion no WhatsApp (`NortChatFloating`):**
    - Substituída a lista vertical estática de 9 botões soltos por um menu interativo e colapsável em 3 categorias principais compactas, com títulos marcantes, subtítulos descritivos e chevron rotacionável (`ChevronDown`):
      1. *💬 Atendimento & Setores:* Quero falar com atendente humano (WhatsApp), Quero falar com o Setor Jurídico (WhatsApp), Falar com Vendas no WhatsApp e Ver endereço e horários de funcionamento.
      2. *📦 Produtos & Cotação:* Quero solicitar uma cotação de produtos, Como faço para consultar produtos no catálogo?, Não consigo adicionar itens à cotação e Preciso tirar dúvidas de faturamento e pagamento.
      3. *🌐 Site / Loja Virtual:* Quero ajuda para mudar meu CEP de entrega (abre formulário de CEP na hora), Esqueci meu login e senha (orienta recuperação com atalho para login), Fazer tour guiado interativo pela loja (`startTour()`) e Suporte técnico com erro no site.
    - No rodapé das categorias, mantida a opção rápida e discreta: `"✏️ Alterar meus dados (Nome / WhatsApp)"`.
  - **Ritmo de Digitação Humano Realista (2 a 4 segundos por mensagem):**
    - Removido qualquer encurtamento prematuro de delay. Cada mensagem possui cálculo de tempo natural proporcional ao tamanho do texto (2.4s a 3.85s), com balão animado de 3 pontinhos ondulantes (`.wa-typing-dot` em `globals.css`) e status `"digitando..."` instantâneo no topo antes do envio de cada mensagem.
  - **Tela Limpa de Boas-Vindas para Visitantes de Retorno (`RESUME_PROMPT`):**
    - Ao reabrir o site após F5 ou fechar o navegador, o chat não despeja a conversa antiga inteira de uma vez. Norti cumprimenta com tela limpa: *"Oi [Nome]! 👋 Bem-vindo(a) de volta! Como posso te ajudar agora?"*, oferecendo duas opções de resposta rápida: `[💬 Continuar conversa anterior]` (que restaura todo o histórico) e `[🆕 Iniciar novo atendimento]`.
  - **Seleção Conversacional da Unidade mais Próxima com Distância em KM (`findTopNearestStores`):**
    - Implementada a Fórmula de Haversine em `stores-data.ts` (`calculateDistanceKm` e `findTopNearestStores`).
    - Ao clicar em *"📍 Encontrar a mais próxima de mim"*, o balão do usuário envia `"📍 A mais próxima de mim (estou no bairro [Bairro], [Cidade] - [UF])"`, Nort responde *"Ah sim! Deixa eu verificar um momentinho... 🔍"*, aguarda a verificação e apresenta as 2 lojas mais próximas com a distância calculada (ex: `🏪 Unidade Mauriti (Pedreira) · a 800 metros`, `🏪 Unidade São Brás (Matriz) · a 1,9 km`), além de permitir ver todas as unidades ou digitar outro CEP.
  - **Validação:** 10 testes unitários em `nort-chat-floating.spec.tsx` e 11 testes em `crm.service.spec.ts` 100% aprovados, e typecheck limpo em ambos os apps (`apps/storefront` e `apps/api`).

- **05/11/2026 — Reorganização e Refinamento dos Filtros do Menu Lateral (`CatalogSidebar`), Eliminação de Redundâncias e Reposicionamento da Seção "Compre por Marca" (executorId: `antigravity-gemini`):**
  - **Reorganização do Menu Lateral do Catálogo (`apps/storefront/components/catalog/catalog-sidebar.tsx`):**
    - **Eliminação de Redundâncias:** Removida a listagem duplicada de marcas que existia no bloco inferior de filtros. O catálogo já conta com o bloco canônico `"VER POR: Marcas"` no topo com árvore hierárquica completa de submarcas, contadores de produtos e expansão `+` / `-`.
    - **Identidade Visual Unificada nos Cards:** O 4º bloco deixou de se chamar genericamente "Filtros" (o que causava estranheza uma vez que toda a barra lateral é composta por filtros) e passou a integrar o mesmo padrão visual dos blocos de Marcas, Categorias e Segmentos:
      - Card 1: `VER POR: Marcas` (ícone `Award` em badge azul-marinho `#00357B`)
      - Card 2: `VER POR: Categorias` (ícone `Package` em badge vermelho `#E2091E`)
      - Card 3: `VER POR: Segmentos` (ícone `Store` em badge azul `#004CB1`)
      - Card 4: `REFINAR POR: Preço & Critérios` (ícone `SlidersHorizontal` em badge grafite `#1E293B`, com botão "Limpar" contextual quando há parâmetros ativos)
    - **Hierarquia Interna Otimizada:**
      1. *Faixa de Preço (Dual Slider):* Priorizada no topo com slider de duplo cursor, caixas de valor mínimo e máximo e botão "Resetar preço".
      2. *Ordenar Produtos:* Pílulas selecionáveis de ordenação rápida (`Menor Preço`, `Maior Preço`, `Mais Vendidos`, `Novidades`, `Relevância`, `Mais Bem Avaliados`).
      3. *Disponibilidade & Entrega:* Pílulas de condições (`Frete Grátis`, `Retirar na Loja`, `Pronta Entrega`).
      4. *Avaliação dos Clientes:* Pílulas de classificação por estrelas (★ 5, ★ 4+, ★ 3+, ★ 2+).
    - **Preservação de Filtros Cruzados ("Filtro do Filtro"):** O botão "Limpar Filtro de Marca" agora limpa apenas o parâmetro de marca sem perder outros filtros simultâneos selecionados (categoria, segmento, preço, etc.).
  - **Reposicionamento da Seção "Compre por Marca" na Home (`s07-compre-por-marca`):**
    - A seção foi movida para ficar posicionada imediatamente abaixo da barra de 7 ícones 3D de categorias em destaque (`s03-category-icons-bar`), assumindo `order: 4` em `home-configuration.ts` e `home-composition.json`.
  - **Validação:** 3 testes de `home-configuration.spec.ts`, testes de `brands-carousel.spec.tsx` e `catalog-view.spec.tsx` 100% verdes; `typecheck` aprovado com 0 erros.

- **05/11/2026 — Detecção Automática de Localização por IP (Estilo Magazine Luiza) e Persistência da Conversa no Chat do Nort (executorId: `antigravity-gemini`):**
  - **Detecção Automática ao Abrir o Site (`LocationProvider` + `/api/location?mode=ip`):** Ao acessar a loja sem uma localização manual salva, o Storefront detecta automaticamente a cidade/região aproximada do visitante via headers geo da CDN/Vercel (`x-vercel-ip-city`, `x-vercel-ip-latitude`, etc.) e fallback por IP (`ipwho.is`), preenchendo o cabeçalho (`Região de Belém/PA` ou cidade detectada) sem exigir popup de permissão do navegador.
  - **Fallback Inteligente no Chat Quando o Navegador Bloqueia o GPS:** No chat do Nort (`NortChatFloating`), ao tocar em `📍 Encontrar a mais próxima de mim`, caso o navegador tenha bloqueado ou ocultado o popup de localização (`Localização bloqueada`), o Nort não trava nem falha: ele utiliza automaticamente a localização aproximada do cabeçalho/IP para sugerir a unidade mais próxima (`✅ Continuar na [Unidade]`), oferecendo também o campo de CEP para refinar pela rua exata. Quando o GPS do navegador é permitido, também faz geocodificação reversa (`reverseGeocodeCoordinates`) para atualizar o bairro/cidade no cabeçalho do site.
  - **Persistência Completa da Conversa e Alteração de Dados Sem Duplicar Lead (executorId: `antigravity-gemini`):**
    - Todo o estado da conversa (`customerName`, `customerPhone`, `selectedStoreId`, `step`, `messages` e o identificador único `publicId`) é salvo continuamente em `localStorage` (`cn_nort_chat_session_v1`) e cookie (`cn_nort_visitor_id`). Ao dar F5, o cliente continua com toda a conversa aberta de onde parou.
    - Caso o cliente precise corrigir o nome ou o telefone (ex: digitou com erro de digitação), ele clica na opção **"✏️ Alterar meus dados (Nome / WhatsApp)"**: abre o formulário pré-preenchido, ele salva as alterações e o sistema atualiza o **mesmo Lead** no MiniCRM (`POST /api/v1/crm/leads` via `upsert` com o mesmo `publicId`), sem criar outro ID e sem duplicar cartões no Kanban da equipe comercial.

- **05/11/2026 — Seção "Compre por Marca" na Home, Hierarquia de Marcas & Submarcas e Vitrine de Produtos por Marca (executorId: `antigravity-gemini`):**
  - **Seção "Compre por Marca" na Home (`BrandsCarouselWidget`, `s07-compre-por-marca`):** Implementada em `apps/storefront/components/storefront/widgets/brands-carousel/brands-carousel.tsx` e integrada à composição oficial da Home (`home-configuration.ts` e `home-composition.json`) logo após "Mais vendidos". Reproduz o layout de referência com título centralizado `"Compre por Marca"`, 6 cards brancos quadrados arredondados (`rounded-[28px]`) com logotipos oficiais das marcas, barra inferior colorida de destaque (`accentColor`) e paginação por bolinhas abaixo.
  - **Hierarquia de Marcas e Submarcas Populada (`brands-data.ts` e `prisma/seed-catalog.ts`):** Criada base canônica e seed com 10 marcas principais (`Copobras`, `Cristalcopo`, `Wyda`, `NortePlast`, `Mili Profissional`, `Nestlé Professional`, `Supermax`, `Grandha`, `Maxiline`, `Knut Hair Care`) e 29 submarcas vinculadas (`Linha Cristal PP`, `Linha Térmica EPS`, `Alkymia di Grandha`, `BBTox Absolute Repair`, `Fito Capillus`, `Urbano Spa`, etc.), além de logotipos SVG vetoriais em `/assets/PRODUTOS/marcas-imgs/` e distribuição determinística dos produtos de demonstração entre marcas e submarcas.
  - **Vitrine de Produtos por Marca (`/marca/[slug]` e `/marcas`):**
    - **Faixa Superior de Logos de Marcas com Contadores (`CatalogView`):** Barra horizontal no topo da vitrine com mini-cards quadrados das marcas, contagem de produtos `(N)` ao lado de cada card e destaque na marca/submarca ativa.
    - **Árvore Lateral Expansível de Submarcas (`CatalogSidebar`):** Card `"Filtro Marcas & Submarcas"` na lateral esquerda com botão `"✕ Limpar Filtro"`, expansão `+` / `-`, checkboxes visuais para marca mãe e submarcas indentadas com contagens `(N)`.
    - **Backend NestJS (`CatalogService.listBrands`):** Enriquecido com `_count: { select: { products: true, children: true } }` nas marcas raiz e `_count: { select: { products: true } }` nas submarcas filhas.

- **05/11/2026 — Animações de Scroll Super Fluidas e Skeleton Shadcn/UI nas Seções (executorId: `antigravity-gemini`):**
  - **Padrão Oficial shadcn/ui & LinkedIn:** Skeleton 100% plano e sólido em `#CBD5E1` (slate-300 firme) com `cnPulse` (`animate-pulse` suave entre 100% e 55% de opacidade), sem nenhum gradiente linear ou listras artificiais. Cards brancos com bordas nítidas `border-slate-200/90` e sombras elegantes `shadow-[0_4px_20px_rgba(15,23,42,0.06)]` / `shadow-[0_2px_10px_rgba(15,23,42,0.07)]` para destaque limpo.
  - **Motor de Carregamento Progressivo no Scroll (`ScrollSkeletonSection`, `ScrollCatalogProductItem`, `ScrollRevealBlock`):** Implementado em `apps/storefront/components/ui/scroll-skeleton-reveal.tsx` e integrado a todas as seções da Home via `ElementorSectionWrapper`, além das páginas de Catálogo (`/loja`, `/categoria`, `/segmento`, `/marca`), Eventos (`/evento`), Workshops de Confeitaria (`/eventos/workshops/aulas-confeitaria`), Posts (`/post`) e Produtos Relacionados (`/produto/[slug]`).
  - **Fluxo Skeleton -> Revelação Fluida:** Quando o visitante rola a página (seções below-the-fold), a seção aparece primeiro como um **Skeleton shadcn** nas proporções exatas de cada tipo de widget (`product-carousel`, `split-banner`, `category-grid`, `banner-grid`, `brands-carousel`, `segments-carousel`, `video-articles-carousel`, `events-carousel`, `instagram-feed`, `testimonials-grid` e `store-locations-map`) sem causar Layout Shift (CLS = 0), e em seguida revela o conteúdo real com transição suave `cubic-bezier(0.16, 1, 0.3, 1)` (fade + micro slide de 8px).
  - **Acessibilidade e SEO Preservados:** Respeito integral a `prefers-reduced-motion: reduce`, desativação automática no modo de edição inline do Elementor e preservação do conteúdo no DOM para leitores de tela, SEO e testes automatizados.
  - **Validação:** 49 suítes de testes (222 testes unitários) aprovadas no Storefront (incluindo `scroll-skeleton-reveal.spec.tsx`) e `typecheck` 100% limpo.

- **05/11/2026 — Remoção do Item "Podcast Universo Business" do Menu de Navegação (executorId: `antigravity-gemini`):**
  - **Menu Desktop e Gaveta Mobile:** Removido o link/botão "Podcast Universo Business" da Barra 03 de navegação do cabeçalho (`apps/storefront/components/site-header.tsx`) e também da listagem de links da gaveta mobile (`mobileMenuOpen`).
  - **Limpeza de Dependências:** Removido o import não utilizado do ícone `Podcast` de `lucide-react`.
  - **Validação:** Teste unitário em `site-header.spec.tsx` atualizado e aprovado, 214 testes unitários do Storefront verdes e typecheck 100% sem erros.

- **05/11/2026 — Chat WhatsApp Estilo Typebot, Roteamento Multi-Lojas na Cotação e MiniCRM Kanban (executorId: `antigravity-gemini`):**
  - **Chat WhatsApp Estilo Typebot (`NortChatFloating`):** O chat flutuante do mascote Norti foi transformado em uma experiência conversacional interativa no estilo Typebot com interface idêntica ao WhatsApp (balões com timestamp, confirmação de leitura azul `✓✓` e animação de digitação realista `"Norti está digitando..."` com 3 pontos animados).
  - **Fluxo Guiado Conversacional & Captura de Leads:** Norti conduz uma conversa passo a passo perguntando Nome, WhatsApp com DDD, a loja mais próxima e o assunto de interesse, permitindo também digitação livre e envio direto.
  - **Pré-Preenchimento Completo do WhatsApp (`wa.me` com `?text=`):** Corrigido o envio do WhatsApp para que a mensagem vá automaticamente formatada no corpo da conversa com o nome do cliente, unidade de atendimento, assunto e protocolo, acabando com os cliques vazios.
  - **Cotação Multi-Lojas com Seleção de Unidade mais Próxima:** Tanto no formulário de cotação (`/cotacao`), quanto na confirmação (`/cotacao/[publicId]`) e no drawer lateral (`QuoteDrawer`), o cliente obrigatoriamente seleciona a unidade mais próxima (Jurunas/Bernardo Sayão, Matriz São Brás, Mauriti/Pedreira, Guamá, Cidade Nova e Delivery), direcionando o atendimento e o WhatsApp para a filial correspondente sem prejudicar as demais lojas.
  - **MiniCRM com Pipeline Kanban no Painel Administrativo:** Criado módulo e página de MiniCRM (`apps/admin/src/features/crm/crm-page.tsx`) com Kanban em 5 estágios (`Novos Leads`, `Em Atendimento`, `Cotação/Negociação`, `Convertido/Ganho` e `Perdido/Arquivado`), filtro por filial, histórico completo da conversa com o Norti, botão direto de WhatsApp com o lead e anotações internas. No backend NestJS (`apps/api/src/modules/crm/`), endpoints públicos e administrativos com persistência no Prisma (`CrmLead` e `CrmLeadNote`) e fallback resiliente em memória.
  - **Validação:** Todos os 45 arquivos de testes (211 testes) do Storefront aprovados, testes unitários do Admin aprovados (`crm-page.spec.tsx` e `admin-shell.spec.ts`), typecheck 100% limpo em todos os pacotes.

- **05/11/2026 — Otimização Mobile dos Carrosséis de Produtos: Passador Inferior e Limite de 4 Bolinhas (executorId: `antigravity-gemini`):**
  - **Reposicionamento do Passador (Indicador de Carrossel):** O sinalizador/passador com pílula navy (`#101F3C`) foi movido do cabeçalho superior para a parte inferior centralizada (`mt-4 flex justify-center`), eliminando o bug de layout em dispositivos móveis onde o título "Para você" era espremido e quebrava em duas linhas ("Para \n você") ao disputar espaço com "Ver todos >" e o passador no topo.
  - **Limite Máximo de 4 Bolinhas por Carrossel:** As vitrines de produtos da home (`ProductCarouselWidget`) agora limitam a exibição a no máximo 4 páginas (`MAX_CAROUSEL_PAGES = 4`), evitando que dezenas de bolinhas minúsculas poluam a tela. O passador exibe no máximo 4 bolinhas por passada com pílula ativa vermelha (`#E2091E`).
  - **Cabeçalho Limpo e Tipografia sem Quebra:** O título da vitrine recebeu `whitespace-nowrap` e o link "Ver todos >" foi reposicionado com alinhamento flexível `justify-between`, garantindo visual limpo e arejado em qualquer celular.
  - **Validação:** Testes unitários do Storefront aprovados (`product-carousel.spec.tsx` com 2 testes cobrindo navegação e limite estrito de 4 bolinhas), typecheck com 0 erros e linting 100% limpo.

- **05/11/2026 — Desativação do Vídeo Automático na Abertura do Site e Exibição do Mascote Nort no Mobile (executorId: `antigravity-gemini`):**
  - **Desativação do Vídeo Automático ao Abrir:** O vídeo de introdução / loading screen fullscreen não abre mais automaticamente ao acessar o site. Em `layout.tsx`, a classe `nort-intro-active` só é adicionada sob demanda quando solicitado expressamente via query param (`?intro=1` ou `?force-intro=1`). Em `nort-intro-helpers.ts`, `AUTO_OPEN_INTRO_ON_SITE_LOAD` foi configurado como `false`.
  - **Abertura do Vídeo Sob Demanda em Tela Cheia:** O vídeo de apresentação agora abre exclusivamente quando o usuário clica no botão com ícone de play ("Assista nosso vídeo") na seção de Segmentos ("Para todos os Negócios"), acionando o player cinematográfico em tela cheia (`NortIntroVideo`) com a barra de progresso vermelha, controles de som/volume, modo fullscreen e botão de fechar, eliminando o modal pequeno.
  - **Mascote Nort Visível no Mobile na Seção de Segmentos:** Removida a classe `hidden sm:flex` que ocultava o personagem em smartphones e tablets. O mascote 3D Nort com o balão "Veja os produtos para seu segmento!" agora se ajusta responsivamente no mobile (`w-[270px] xs:w-[310px] sm:w-[410px]...`), posicionado entre os botões de ação e os cards de segmentos, mantendo o encaixe sobre o gradiente azul oficial.
  - **Validação:** Testes unitários do Storefront aprovados, typecheck com 0 erros e build Next.js 16 validado com sucesso.

- **05/11/2026 — Ajuste da Seção Explica Aí Nort: Remoção do Player e Presença do Mascote Nort no Mobile (executorId: `antigravity-gemini`):**
  - **Remoção do Ícone de Player:** Removido o ícone circular com botão play (`<Play />`) que ficava ao lado de "Nort!" no título da seção, mantendo a tipografia limpa em duas linhas ("Explica Aí" / "Nort!").
  - **Mascote Nort Visível no Mobile e Tablet:** O mascote 3D Nort (`S14-Boneco3D-explica-ai-nort-trimmed.webp`) agora é exibido também no mobile e tablets (`block lg:hidden absolute top-7 right-3 ...`), garantindo a presença visual do personagem que dá nome à seção em todos os dispositivos.
  - **Validação:** 209 testes unitários aprovados no Storefront e typecheck com 0 erros.

- **05/11/2026 — Sincronização de Produção na Vercel e Banco Neon (executorId: `antigravity-gemini`):**
  - **Reatribuição de Alias Oficial Vercel:** O domínio com hífen `https://loja-comercialdonorte.vercel.app` foi reatribuído para o deploy mais recente (`loja-home-front-82r5s5eti-idedigital.vercel.app`, timestamp `v05-11-2026-12-02am`), alinhando com `lojacomercialdonorte.vercel.app`.
  - **Sincronização da Composição no Banco Neon:** O registro `SiteConfiguration.homeComposition` no banco Neon de produção (`db_lojacomercialdonorte`) foi sincronizado com `apps/storefront/data/home-composition.json`, efetivando a remoção da seção `s11-triple-banners-2` e a inclusão do carrossel de confeitaria na API pública `/api/v1/site/composition`.

- **04/11/2026 — Restauração do Mascote Nort no Cabeçalho (Remoção Apenas do Balão e Interação) (executorId: `antigravity-gemini`):**
  - **Presença Visual do Mascote Preservada:** O mascote Nort foi restaurado na Barra 02 do cabeçalho (`SiteHeader` / `NortHeader`), mantendo o loop de animação do sprite 3D e a respiração (`breathe`), ancorado na base da barra azul com o recuo adequado do logotipo (`md:pl-[88px] lg:pl-[94px]`) e preservando a ancoragem `#tour-header-nort` do tour guiado.
  - **Remoção Estrita de Balão e Interações Conflitantes:** Removidos o balão de fala pop-up (`bubbleWrap`), temporizadores de insistência de hover e gatilhos de clique/foco no cabeçalho, deixando a interação conversacional e atalho do tour guiado exclusivamente centralizados no chat flutuante do WhatsApp / Nort (`NortChatFloating`).
  - **Validação:** 204 testes unitários no Storefront aprovados, typecheck com 0 erros e linting 100% limpo.

- **04/11/2026 — Vídeo Original Ativo e Remoção do Limite de 3 Exibições no Pré-Lançamento (executorId: `antigravity-gemini`):**
  - **Exibição Contínua:** Removido o limite de 3 visualizações (`ENFORCE_INTRO_VIEW_LIMIT = false`) durante a fase de desenvolvimento/pré-lançamento. O vídeo agora aparece sempre em todas as cargas normais de `http://localhost:3001/` sem depender de `?intro=1`. A regra de 3 exibições continua pronta no código e será reativada (`true`) no momento do lançamento oficial.
  - **Qualidade Máxima Original:** Reproduz o MP4 original de 18,6 MB (1080p H.264 com áudio cristalino e faststart para carregamento imediato).
  - **Preservação dos Arquivos Comprimidos:** Os arquivos otimizados gerados anteriormente foram salvos como `/videos/nort-intro-compressed.webm` (4,2 MB) e `/videos/nort-intro-compressed.mp4` (10,8 MB) para ativação imediata no momento do lançamento oficial da loja.
  - **Validação:** 198 testes unitários no Storefront aprovados e typecheck 100% limpo.

- **04/11/2026 — Refinamento do Vídeo de Intro: Fullscreen Real, Áudio Ligado, Barra YouTube e Desacoplamento do Tour (executorId: `antigravity-gemini`):**
  - **Fullscreen Real de Ponta a Ponta:**
    - Removidos containers com largura/altura limitadas (`max-w-6xl`, `max-h-[76vh]`), bordas e paddings. O elemento `<video>` agora ocupa 100% da tela (`w-full h-full object-cover object-center`) em camada fullscreen absoluta `z-[9999999]`.
  - **Barra de Progresso Minimalista Estilo YouTube:**
    - Removidos todos os textos de poluição visual (títulos de loading, slogans e headers superiores).
    - Implementada barra de progresso fina e limpa na borda inferior da tela com preenchimento vermelho e scrubber circular (padrão YouTube), contador de tempo numérico (`0:04 / 0:25`), controle de volume e botão discreto de "Pular" no topo.
  - **Áudio Ligado por Padrão:**
    - O vídeo agora inicia com `muted = false` (som ligado). Caso a política restrita de autoplay do navegador barre som antes de uma interação, o sistema faz fallback silencioso para áudio mutado e ativa o som no primeiro toque/clique em qualquer ponto da tela.
  - **Desacoplamento Rigoroso do Tour Onboarding:**
    - O tour guiado (`NortTourProvider` / `NortTourOverlay`) agora checa `isIntroActive()`. Durante a execução do vídeo de intro, o tour NÃO é renderizado e aguarda o evento `nort-intro-finished` para abrir suavemente após o vídeo terminar ou ser pulado.
  - **Métricas de Compressão Registradas:**
    - Arquivo original: 18,63 MB. Novo WebM VP9: 4,26 MB (**redução de 77,1%**, menos de 1/4 do tamanho original mantendo resolução 1080p).
  - **Validação:** 184 testes unitários aprovados no Storefront e build Next.js 16 validado sem erros.

- **03/11/2026 — Vídeo de Apresentação do Mascote Nort em WebM e Fake Loading em Tela Cheia (executorId: `antigravity-gemini`):**
  - **Compressão e Otimização WebM:**
    - Vídeo original em MP4 (18.6 MB) comprimido e convertido para WebM VP9 + áudio Opus (`/videos/nort-intro.webm`) resultando em 4.1 MB (redução de 78%), com resolução 1080p nítida e taxa de carregamento ultra-rápida.
    - Gerado fallback MP4 com atom faststart (`/videos/nort-intro.mp4`) para compatibilidade universal em navegadores legados.
  - **Componente Fullscreen de Intro / Fake Loading (`NortIntroVideo`):**
    - Exibição em tela cheia com ambiência escura cinematográfica (`#030712`) e reflexo difuso de luz em segundo plano.
    - Autoplay sem botões de play/pause tradicionais, com inicialização suave sem bloqueio do navegador.
    - Barra inferior de fake loading com indicador de usabilidade: `"Carregando loja virtual Comercial do Norte..."`, barra de progresso com gradiente institucional, porcentagem dinâmica e contagem regressiva de segundos restantes.
    - Controles discretos: botão de alternar áudio (`Ativar som` / `Som ativo`) e botão de atalho (`Pular para a loja ➔`).
  - **Regra de Frequência (Primeiras 3 Visualizações):**
    - Controle via `localStorage` (`cn_nort_intro_views_v1`) para exibir nas primeiras 3 visitas do usuário.
    - Suporte a preview via URL `?intro=1` ou `?reset-intro=1`, além de métodos globais `window.__replayNortIntro()` e `window.__resetNortIntro()`.
  - **Validação:**
    - 9 testes unitários em `components/intro/nort-intro-video.spec.tsx` (183 testes totais no storefront aprovados).
    - Build de produção Next.js 16 (Turbopack) validado com sucesso.

- **30/10/2026 — Sincronização em Produção: 5 Linhas (20 Produtos/Pág), 158 Itens no Neon e Deploys Vercel (executorId: `antigravity-gemini`):**
  - **Grid de 5 Linhas (20 produtos/página):**
    - Padronizado `PAGE_SIZE = 20` no storefront em todas as rotas (`/loja`, `/categoria/[slug]`, `/segmento/[slug]`, `/marca/[slug]`, `/tag/[slug]` e fallback do cliente de API), preenchendo exatamente 5 linhas de 4 cards no desktop.
  - **Sincronização do Banco Neon (`db_lojacomercialdonorte`):**
    - Catálogo expandido para 158 produtos comerciais ativos com demonstração íntegra, multi-categorias e 480 mídias WebP espelhadas.
    - Todos os 9 segmentos (28 a 94 itens) e todas as categorias principais (22 a 52 itens) possuem $\ge 2$ páginas de paginação completas.
  - **Publicação na Vercel:**
    - **API de Produção:** deploy `loja-1gzy7ea04-idedigital.vercel.app` promovido e vinculado a `https://api-comercialdonorte.vercel.app`, respondendo com 158 itens e servindo uploads WebP.
    - **Storefront de Produção:** deploy `loja-home-front-hn4bne17j-idedigital.vercel.app` promovido e vinculado aos domínios `https://loja-comercialdonorte.vercel.app` e `https://lojacomercialdonorte.vercel.app` com HTTP 200 OK.

- **30/10/2026 — Rastreabilidade de Deploy: Tag de Versão e Timestamp Automático no Balão do Tour (executorId: `antigravity-gemini`):**
  - **Identificador de Versão Minimalista Automático:**
    - Criado módulo canônico `apps/storefront/lib/version.ts` com cálculo em build-time formatado no padrão exato solicitado: `vDD-MM-YYYY-H-MPM` no fuso horário de Brasília (exemplo: `v30-10-2026-12-28pm`).
    - Configurado em `apps/storefront/next.config.ts` via injeção estática `env.NEXT_PUBLIC_DEPLOY_VERSION`, garantindo que todo e qualquer deploy futuro em produção (Vercel ou local) registre automaticamente o horário preciso em que foi compilado.
    - Exibição de tag minimalista no canto superior esquerdo do balão de fala do mascote Nort (`NortTourCard`), permitindo auditoria visual imediata da versão publicada ativa no navegador.
  - **Validação:** Testes unitários atualizados em `nort-tour.spec.tsx` com regex de formato aprovado, typecheck verde e build Next.js 16 validado com sucesso.

- **30/10/2026 — Publicação em Produção na Vercel: Vitrine do Storefront com Tour Guiado do Nort Atualizado (executorId: `antigravity-gemini`):**
  - **Deploy de Produção Concluído:**
    - Executado build e publicação na Vercel a partir do commit `d77e11f` (`main`).
    - Deployment oficial gerado: `https://loja-home-front-1tu83a0x1-idedigital.vercel.app`.
    - Aliases de produção alinhados e ativos com HTTP 200:
      - `https://lojacomercialdonorte.vercel.app`
      - `https://loja-comercialdonorte.vercel.app`
      - `https://loja-home-front-idedigital.vercel.app`
  - **Recursos Disponíveis Online:**
    - Tour guiado teatral com backdrop ultra escuro (`rgba(1, 3, 10, 0.965)`).
    - Mascote Nort ampliado em alta escala (`h-[400px] xl:h-[450px]`) encostado no rodapé com balão de quadrinhos apontando para sua boca.
    - Nova fala oficial canônica de abertura com posicionamento de negócio da loja.
    - Regra de frequência de auto-abertura (2x ao dia nos 2 primeiros dias) ativa no cliente.

- **30/10/2026 — Atualização da Fala Canônica de Boas-Vindas do Mascote Nort no Tour (executorId: `antigravity-gemini`):**
  - **Nova Fala Oficial de Abertura:**
    - Título: `"Opa! Seja muito bem-vindo à Comercial do Norte! 👋"`
    - Mensagem: `"Eu sou o Nort, o mascote da loja! Somos o comercial da pizzaria, do lancheiro e de quem empreende. 💙 Aqui você encontra tudo o que precisa para o seu negócio. Quer que eu te mostre nossa loja?"`
    - Substituição da introdução genérica anterior pela cópia canônica oficial focada no posicionamento comercial dos segmentos (pizzaria, lancheiro, empreendedores).
  - **Validação:** Testes unitários atualizados em `nort-tour.spec.tsx` e 100% aprovados, typecheck com 0 erros e build Next.js 16 compilado com sucesso.

- **30/10/2026 — Ampliação Visual do Mascote Nort no Tour Guiado (executorId: `antigravity-gemini`):**
  - **Aumento Proporcional do Mascote Nort:**
    - O mascote Nort no componente `NortTourCard` foi ampliado de `w-48 sm:w-60 md:w-72 h-40 sm:h-52 md:h-60` para `w-64 sm:w-80 md:w-[380px] lg:w-[440px] xl:w-[480px]` e altura `h-56 sm:h-72 md:h-[340px] lg:h-[400px] xl:h-[450px]` com `max-h-[46vh]`.
    - Isso aumenta a altura e o volume do Nort em até 70% em telas desktop, eliminando o aspecto de miniatura sob o balão de fala e tornando suas poses, expressões faciais e o rabicho do balão apontado para sua boca muito mais expressivos e carismáticos.
    - Sombra e iluminação aprimoradas (`drop-shadow-[0_20px_35px_rgba(0,0,0,0.75)]`) com ancoragem rente à base inferior (`bottom: 0`).
  - **Validação:** 174 testes unitários no Storefront aprovados, typecheck com 0 erros e build Next.js 16 validado com sucesso.

- **30/10/2026 — Tour Guiado do Nort: Fundo Teatral Ultra Escuro (96.5%) e Regra de Frequência de 2x ao Dia nos Primeiros 2 Dias (executorId: `antigravity-gemini`):**
  - **Filtro de Contraste Teatral Ultra Escuro:**
    - Ajustado o preenchimento da máscara SVG de escurecimento de `rgba(2, 6, 23, 0.92)` para `rgba(1, 3, 10, 0.965)`, criando um blackout quase total no fundo não focado e intensificando o anel dourado pulsante (`shadow-[0_0_40px_rgba(251,191,36,0.9)]`). Os elementos em foco brilham com recorte nítido e os passos de boas-vindas e encerramento direcionam toda a atenção para o Nort.
  - **Regra de Frequência Automática (2x ao dia nos primeiros 2 dias):**
    - Implementada a função canônica `checkAndRecordAutoOpen(storage, now)` com persistência estruturada no `localStorage` sob a chave `cn_nort_tour_freq_v1` (`{ days: { [dateIso]: count } }`).
    - **Dia 1:** O tour inicia automaticamente na 1ª e na 2ª carga de página. Na 3ª carga de página do Dia 1, não abre mais automaticamente.
    - **Dia 2:** Repete o mesmo comportamento (abre na 1ª e 2ª carga de página do Dia 2, bloqueando a partir da 3ª).
    - **Dia 3 em diante:** O tour encerra as aberturas automáticas permanentemente.
    - O gatilho manual ("Ver tour guiado novamente" no balão do mascote no cabeçalho) permanece sempre funcional para o usuário rever o tour quando quiser, sem consumir nem ser bloqueado pela cota automática.
  - **Validação e Testes:** Suíte `components/tour/nort-tour.spec.tsx` atualizada com validação completa de datas consecutivas e futuras, 174 testes unitários aprovados no Storefront, typecheck com 0 erros e build de produção Next.js 16 concluído com sucesso.

- **30/10/2026 — Redesign do Tour Guiado: Abertura Imediata, Mascote Nort na Base em Tamanho Grande e Filtro Ultra Escuro (executorId: `antigravity-gemini`):**
  - **Abertura Imediata sem Prompt Inferior:**
    - O prompt pequenininho flutuante no canto inferior direito foi removido.
    - O tour guiado agora inicia **automaticamente** assim que o visitante acessa o site (se ainda não tiver completado anteriormente), proporcionando uma experiência de boas-vindas fluida e sem atrito.
    - O botão no cabeçalho do Nort ("Ver tour guiado novamente") permanece ativo para reabrir o tour sempre que desejado.
  - **Mascote Nort Grandão Centralizado na Base (Bottom: 0):**
    - O Mascote 3D Nort foi reposicionado para a base inferior da tela (`bottom: 0`), centralizado, com dimensões aumentadas (`w-48 sm:w-60 md:w-72 h-40 sm:h-52 md:h-60`), mantendo-o imponente e expressivo.
    - O balão de fala estilo quadrinhos fica posicionado logo acima do Nort com o rabicho apontando para baixo diretamente para a cabeça/boca do mascote.
    - A área superior da viewport fica 100% desobstruída para a visualização dos elementos destacados (busca, categorias, ofertas, cotação, etc.).
  - **Filtro de Foco Ultra Escuro (92% de Opacidade):**
    - A máscara SVG de escurecimento foi aprofundada para `rgba(2, 6, 23, 0.92)`, criando alto contraste cinematográfico.
    - O spotlight abre recorte com anel dourado pulsante de 4px e brilho intenso (`shadow-[0_0_35px_rgba(251,191,36,0.85)]`) sobre os elementos ativos.
    - No passo 1 (Boas-vindas) e no passo 9 (Conclusão), o palco todo escurece para evidenciar a apresentação do Nort.
  - **Validação:** 173 testes unitários aprovados, typecheck limpo e build de produção Next.js 16 validado com sucesso.

- **30/10/2026 — Correção Crítica no Gatilho do Tour Guiado do Nort (executorId: `antigravity-gemini`):**
  - **Causa Raiz Identificada:** Ao clicar em "Fazer tour!" no prompt flutuante de boas-vindas (`NortTourPrompt`), o evento de clique do React (`MouseEvent`) era repassado como primeiro argumento para `startTour(startIndex = 0)`. O cálculo `Math.min(event, 8)` avaliava para `NaN`, resultando em `currentStepIndex = NaN`. Como `NORT_TOUR_STEPS[NaN]` é `undefined`, o `currentStep` ficava `null` e o `NortTourOverlay` não era renderizado, fazendo com que o prompt fechasse e nenhuma tela de tour abrisse.
  - **Blindagem e Resolução:**
    - `startTour` atualizado com sanitização defensiva: valida `typeof startIndex === 'number' && !Number.isNaN(startIndex) ? Math.floor(startIndex) : 0`, garantindo fallback seguro para o passo 0 mesmo se chamado diretamente por manipuladores de eventos.
    - Encapsulamento de chamadas com arrow functions `onClick={() => onStart()}` em `NortTourPrompt`.
    - Adicionado `createPortal(..., document.body)` em `NortTourOverlay` e `NortTourPrompt`, blindando os overlays contra empilhamento e restrições de overflow/transform de containers pais.
    - Implementação de `mobileSelector` e detecção de visibilidade (`rect.width === 0 && rect.height === 0`): quando o tour roda no mobile ou quando um elemento estiver oculto (`display: none`), o sistema faz fallback gracioso para seletores alternativos visíveis (ex: `#tour-header-mobile-menu`, `#tour-header-logo`, `#tour-header-location-mobile`) ou centraliza o diálogo na viewport sem quebras.
    - Suíte `nort-tour.spec.tsx` atualizada com teste específico validando o clique em "Fazer tour!" com 100% de sucesso.

- **30/10/2026 — Sincronização Total de Produção: Vitrine Vercel, API e Banco Neon (executorId: `antigravity-gemini`):**
  - **Diagnóstico de Defasagem ("Aparecendo Antigo"):**
    - Identificada dupla causa para a visualização antiga em produção:
      1. **Roteamento de Domínios Vercel:** O domínio com hífen `https://loja-comercialdonorte.vercel.app` e a API `https://api-comercialdonorte.vercel.app` estavam apontando para deployments antigos de 4 dias atrás (`loja-home-front-mogsgnmnp`), enquanto apenas o alias sem hífen recebia updates do CLI.
      2. **Descompasso de Dados no Neon PostgreSQL:** O banco de dados de produção Neon (`bitter-haze-15129381`, `db_lojacomercialdonorte`) continha apenas 8 segmentos e 12 produtos datados de 28/10. O 9º segmento (`delivery`), os 3 produtos de delivery (`sacola-kraft-delivery`, `lacre-seguranca-delivery`, `pote-termico-molho-250ml`) e a `homeComposition` com a seção `s08-segmentos-negocios` atualizada ainda não tinham sido sincronizados na nuvem.
  - **Ações e Resolução Executadas:**
    - Executado `seedCatalog` diretamente no banco Neon de produção (`db_lojacomercialdonorte`), sincronizando as 13 categorias, 9 segmentos com suas ordenações oficiais, 7 tags, 15 produtos e 8 associações ativas para o segmento Delivery.
    - Atualizada a `homeComposition` em `SiteConfiguration` (registro `default`) no Neon para a versão com os 9 itens no carrossel de negócios.
    - Executado novo build e deploy de produção do storefront na Vercel (`loja-home-front-5e6fcnbd5-idedigital.vercel.app`) a partir da `main`.
    - Alinhados ambos os aliases de produção: `https://loja-comercialdonorte.vercel.app` e `https://lojacomercialdonorte.vercel.app`, garantindo que ambos sirvam a versão atualizada com HTTP 200 e paridade 1:1 com o localhost.

- **29/10/2026 — Produtos Vinculados ao Segmento Delivery no Catálogo (executorId: `antigravity-gemini`):**
  - **Identificação do problema:** A página `/segmento/delivery` retornava 0 produtos porque, embora o segmento Delivery tivesse sido inserido no banco de dados e taxonomia, nenhum produto do catálogo possuía o vínculo `ProductSegment` com a chave `delivery`.
  - **Vínculos e Novos Produtos Canônicos:**
    - Atualizados produtos essenciais já existentes para incluir o segmento `delivery`: `caixa-pizza-35cm` (caixas de pizza), `sacola-plastica-40x50` (sacolas plásticas reforçadas), `bandeja-isopor-n2` (bandejas térmicas), `guardanapo-papel-24x24` (guardanapos) e `copo-descartavel-300ml` (copos descartáveis).
    - Adicionados 3 produtos específicos de demonstração em `prisma/seed-catalog.ts` fiéis ao segmento: `sacola-kraft-delivery` (Sacola de Papel Kraft Delivery com Alça), `lacre-seguranca-delivery` (Lacre de Segurança Inviolável para Delivery) e `pote-termico-molho-250ml` (Pote Térmico com Tampa Antivazamento 250 ml).
    - Executado o `seedCatalog` via script canônico, totalizando 8 produtos ativos para o segmento Delivery no endpoint `/api/v1/catalog/products/search?segment=delivery`.
    - Atualizada a suíte `apps/storefront/app/segmento/[slug]/segment-page.spec.tsx` cobrindo a renderização completa e consulta de produtos no segmento Delivery.


- **29/10/2026 — Padronização Visual do Banner de Segmento Delivery (executorId: `antigravity-gemini`):**
  - **Identificação do problema:** O banner de topo da página de segmento Delivery (`/segmento/delivery`) estava utilizando temporariamente a foto de card com fundo retangular fechado de cozinha (`s08-segment-09-delivery.jpg`), rompendo o padrão visual das outras 8 páginas de segmento (`pizzaria`, `lanchonete`, `padaria`, `restaurante-buffet`, etc.), onde a foto central é estritamente uma pessoa recortada sem fundo (PNG/WebP transparente com canal alfa, ancorada na base sobre o fundo azul `#0059E9`).
  - **Correção e padronização de assets:**
    - Geração de fotografia de estúdio com entregador sorridente segurando sacola kraft com lacre de segurança inviolável e conjunto completo de insumos de delivery (caixas kraft, marmitas térmicas com tampa bolha, bandejas de alumínio, copos de café e potes de molho).
    - Recorte e desmatting de alta precisão com canal alfa transparente no padrão `1536x1024` (4 canais, WebP/PNG), alinhamento rente à base inferior (`object-bottom`) e integração com o efeito nativo de drop shadow do componente `SegmentHeroBanner`.
    - Criação de `apps/storefront/public/assets/PRODUTOS/segmentos/segmento-delivery.png.webp` e mapeamento em `SEGMENT_BANNER_MAP.delivery` em `apps/storefront/components/segment-hero-banner.tsx`.
    - Atualização da suíte de testes em `apps/storefront/components/segment-hero-banner.spec.tsx` cobrindo o novo asset oficial e o texto de destaque "DO SEU DELIVERY".


- **29/10/2026 — Tour Guiado Interativo com o Mascote Nort (executorId: `antigravity-gemini`):**
  - **Motor de Tour Dedicado para Next.js 16 / React 19:**
    - Avaliação técnica entre Onborda e NextStepjs: ambas usam Framer Motion, mas apresentam limitações em headers fixos e viewports móveis sem cálculo de clamping nem suporte nativo a avatares e balões em estilo quadrinhos.
    - Implementação de motor sob medida em `apps/storefront/components/tour/` com máscara SVG fullscreen de spotlight com cantos arredondados (`rx/ry`), anel pulsante dourado com glow suave ao redor do elemento em foco e rastreamento em 60fps via `requestAnimationFrame` em eventos de `scroll` e `resize`.
  - **Apresentação em 1ª Pessoa pelo Mascote Nort:**
    - O mascote Nort 3D participa ativamente de cada passo com poses em alta definição (`nort-boas-vindas.png`, `nort-apontando-joinha.png`, `mascote-nort-apontando.webp`, `nort-pensativo.png`, `nort-ofertas.png`, `nort-notebook-em-pe.png`, `nort-entrega-pedidos.png`, `nort-celular.png` e `nort-sorridente-joinha.png`).
    - Balão de fala estilo HQ com rabicho/ponteiro voltado diretamente para a boca do mascote (lateral no desktop e vertical no mobile), texto em primeira pessoa ("Oi! Eu sou o Nort!...", "Aqui na nossa busca...", etc.), tag "Nort Apresenta" e badge temático para cada área.
  - **Etapas Canônicas do Tour:**
    1. Boas-vindas e introdução ao catálogo (`#tour-header-nort`)
    2. Barra de Busca Rápida de Produtos (`#tour-header-search`)
    3. Departamentos & Segmentos (`#tour-header-categories`)
    4. Explica Aí Nort & Workshops de Confeitaria (`#tour-header-content`)
    5. Mais Vendidos & Ofertas do Dia (`#tour-header-deals`)
    6. Localização, Entrega e Retirada nas Lojas (`#tour-header-location`)
    7. Minha Cotação e Lista de Pedidos (`#tour-header-quote`)
    8. Atendimento Direto e WhatsApp Vendas (`#tour-header-whatsapp`)
    9. Conclusão e convite para navegar à vontade
  - **Controles, Acessibilidade e Gatilhos:**
    - Paginação por pontinhos interativos com salto direto, botões "Pular tour", "Voltar" e "Próximo / Concluir Tour! 🚀".
    - Navegação completa por teclado (`Escape` para fechar, `ArrowRight` para avançar, `ArrowLeft` para voltar).
    - Gatilho permanente no balão do cabeçalho do Nort ("Ver tour guiado novamente"), ativando `startTour()`.
    - Convite flutuante sutil no rodapé para novos visitantes após 3.5 segundos sem intrusão, com memória no `localStorage` (`cn_nort_tour_completed_v1`).
    - 172 testes unitários aprovados e build Next.js 16 validado sem erros.

- **29/10/2026 — Redesign Premium de Workshops e Confeitaria (Kit Visual Oficial) (executorId: `antigravity-gemini`):**
  - **Identidade e Paleta Canônica de Confeitaria Fina:**
    - Cor Principal e Dominante: Marrom Chocolate (`#4B290D`) aplicado em títulos, botões primários, destaques, bordas ativas e badges.
    - Cores Complementares: Creme Claro (`#FAF6F0`), Creme Médio (`#F3EAE0`), Rosé Claro (`#E0BCBC`), Branco Suave (`#FFFFFF`) e Rosa Framboesa (`#B75675`) para tags e acentos sutis, sem dominar a interface.
    - Tokens CSS declarados em `confeitaria-tokens.css` (`--color-chocolate`, `--color-cream-light`, `--color-cream-medium`, `--color-rose-light`, `--color-soft-white`, etc.).
  - **Assets Oficiais Integrados em `/public/assets/confeitaria`:**
    - Cópia e organização estruturada das pastas `01-listagem-eventos`, `02-pagina-workshop`, `03-fotos-extras`, `04-paleta-e-codigo`, `05-referencias` e `06-icones-vetoriais`.
  - **Página 1: Listagem de Todos os Workshops (`/eventos/workshops/aulas-confeitaria`):**
    - Componente dedicado `ConfeitariaWorkshopsList` reproduzindo pixel-perfect o layout de referência `05-referencias/layout-listagem-completo.png`.
    - Hero com composição de confeitaria (`01-hero-foto-confeiteira-direita.jpg`), breadcrumbs, eyebrow rosa, títulos em serif refinada e 3 pilares em círculos rosé com ícones vetoriais (100% Prático, Certificado Oficial, Insumos Inclusos).
    - Barra de filtros em pílulas com marrom chocolate para seleção ativa, contadores dinâmicos e campo de busca refinado.
    - Grid de 4 colunas com os 4 workshops principais (Doces Finos e Brigadeiros Gourmet, Bolos Decorados com Chantilly e Bicos, Sobremesas na Taça, Cupcakes para Presentear) com fotos em alta definição do kit, badges flutuantes e CTAs elegantes direcionando para a página single.
    - Banner intermediário com degradê pronto (`09-banner-chocolate-degrade-pronto.png`), chamada institucional "Confeitaria que transforma" e selo cursivo decorativo.
    - 4 blocos de diferenciais (Novos ambientes, Promoções exclusivas, Café da manhã, Especialistas) e divisória institucional "Conhecimento · Técnica · Sabor · Grandes Resultados".
  - **Página 2: Single do Workshop (`/evento/workshop/aulas-confeitaria/[slug]`):**
    - Componente dedicado `ConfeitariaWorkshopSingle` reproduzindo pixel-perfect o layout de referência `05-referencias/layout-pagina-interna-completo.png`.
    - Hero cinematográfico com foto do bolo de chocolate gourmet (`02-hero-doces-finos-degrade-pronto.png`), badges de modalidade presencial, metadados de data/horário/local e Card Flutuante de Inscrição com seletor interativo de quantidade de ingressos (1 a 5) e conversão via WhatsApp com mensagem pré-preenchida.
    - Seção "Sobre o Evento" com caixa destacada "O que você vai aprender" com checks, foto alta de brigadeiros gourmet (`03-foto-brigadeiros-sobre-o-evento.jpg`) e card de localização com botão do Google Maps.
    - Seção "Programação" com timeline vertical estilizada e horários em nós circulares + "O que te espera" (grid 2x2) + Banner com degradê pronto de cupcakes (`05-banner-cupcakes-degrade-pronto.png`).
    - Galeria "Veja como foi na última edição" com as 4 fotos oficiais (`06-galeria-confeiteira.jpg`, `07-galeria-brigadeiros-coloridos.jpg`, `08-galeria-aula-pratica.jpg`, `09-galeria-bolo-de-chocolate.jpg`) e Lightbox/Modal para ampliação.
    - Card final acolhedor "Ainda tem dúvidas?" com CTA para atendimento no WhatsApp.
  - **Integridade Global:**
    - Menu/Header e Footer do site foram 100% preservados sem nenhuma alteração.
    - 166 testes unitários aprovados e build Next.js 16 compilado com sucesso.

- **29/10/2026 — Navegação dos Botões de Listagem de Eventos e Workshops (executorId: `antigravity-gemini`):**
  - **Ação dos Cards na Listagem:** O botão de ação dos cartões na listagem de eventos (`/evento`, `/eventos`) e na listagem de workshops (`/eventos/workshops/aulas-confeitaria`) direciona diretamente para o respectivo Single Post (`detailHref` = `/evento/[slug]` ou `/evento/workshop/aulas-confeitaria/[slug]`) em vez de abrir links externos de WhatsApp/Google Maps direto do card. O contato e confirmação de presença no WhatsApp permanecem como ação principal dentro da página de Single Post de cada evento.

- **29/10/2026 — Padronização e Segregação de Eventos e Workshops (Light Mode):**
  - **Single de Workshop e Aulas de Confeitaria (`/evento/workshop/aulas-confeitaria/[slug]`):** padronizada para conter rigorosamente a mesma estrutura de seções, componentes e recursos do template de eventos de referência (`/evento/[slug]`), preservando as 6 seções canônicas (Hero 3 colunas com seletor de vagas e matrícula WhatsApp, 4 cartões de destaques, programação em timeline + mapa e expectativas, galeria de fotos com lightbox e banner de dúvidas no WhatsApp). A única diferença visual é o tema claro normal (`theme="light"`, `event-theme.module.css`) em substituição ao dark mode de `/evento`.
  - **Segregação de Catálogo entre `/eventos` e `/eventos/workshops/aulas-confeitaria`:**
    - `/eventos` lista exclusivamente eventos gerais institucionais (Palestras, Reinaugurações, Fóruns), ocultando workshops e aulas de confeitaria, com contadores e botões de filtro visíveis apenas para categorias com eventos existentes.
    - `/eventos/workshops/aulas-confeitaria` lista exclusivamente workshops práticos e aulas-show de confeitaria em tema claro normal, eliminando eventos institucionais (palestras e reinaugurações) de sua listagem e filtros.
  - **Resolução de Roteamento e Fallbacks:** adicionado suporte a `workshop-doces-finos-brigadeiros-gourmet` e workshops da base canônica sem 404 através de busca centralizada em `findAnyEventBySlug`.

- **29/10/2026 — Nort no cabeçalho:** ciclo animado orgânico de 60 segundos com 64 quadros em atlas (`nort-loop-64-v1.png`) cobrindo: idle com mãos no bolso, retirada de mão, joinha (like), aceno amigável, pose pensativa e retorno suave ao idle. Por orientação do responsável, o balão não abre de imediato nem sozinho; a abertura ocorre exclusivamente se o visitante insistir com o hover em cima do Nort por 4 segundos contínuos (ou clique direto), abrindo para baixo (`top: 100%` com seta indicadora superior alinhada ao mascote) para manter desobstruídos o logo, o seletor de CEP e a barra de busca. Se o cursor sair antes de 4s, a abertura é cancelada. Texto aprovado: “Oi! Eu sou o Nort! 👋 Como posso te ajudar?”. Por orientação do responsável, os links “Ver tour guiado novamente” e “Falar com o Nort” permanecem em `#` nesta etapa. Fechamento por Escape, botão X, blur ou clique externo. Suporte a `prefers-reduced-motion`. Suíte dedicada `nort-header.spec.tsx` validando os 4 segundos de insistência.

- **28/10/2026 — Sincronização Local e Produção:** alinhamento completo entre ambiente local e nuvem. Schema Neon atualizado com todas as 7 migrations versionadas (posts, events, segments, tags, home composition), persistência de dados de CMS preservando cotações de produção, inclusão dos assets de storage/uploads no controle de versão e deploy Vercel das aplicações.
- **28/10/2026 — Mais Vendidos e Ofertas do Dia:** filtros no servidor e rotas dedicadas (`/ofertas`, `/mais-vendidos`, `/loja?oferta=1`, `/loja?ordem=mais_vendidos`). NestJS API com `onlyOffers` e ordenação por `mais_vendidos`, títulos dinâmicos, breadcrumbs, fallback de ofertas reais e badges ativos no catálogo.
- **28/10/2026 — CMS de Posts e Eventos & Taxonomia WooCommerce:** integrado diretamente na `main` com arquitetura completa (PostgreSQL + NestJS + Storefront Next.js + Admin React). Suporte a `/post`, `/evento`, `/segmento`, `/marca` e submenus administrativos de Posts e Eventos.


- **Orientação explícita do responsável em 26/10/2026:** entregar as alterações diretamente na `main`, sem abrir PR nem aguardar revisão de PR. Esta orientação substitui a exigência anterior de entrega por PR. Preservar isolamento do escopo, validações, reservas e push sem force; não incluir alterações de outras tarefas.

1. **Decisões explícitas mais recentes do responsável pelo projeto**, registradas neste documento, prevalecem sobre propostas, prompts, planos e decisões técnicas anteriores.
2. **Código da branch realmente inspecionada** determina o que existe e funciona no repositório; memória de produto não deve ser interpretada como funcionalidade já implementada.
3. A referência **visual** oficial é `site-comercial-do-norte-html-referencia/`, especialmente `DESIGN-comercial-do-norte.md`, imagens e páginas HTML. Ela é um ativo a reutilizar, não motivo para reconstrução visual livre.
4. Documentação antiga (planos, specs, runbooks, auditorias e memórias da base Jonas) foi **removida do repositório** em 24/10/2026 e permanece apenas no histórico Git (`5781590`). Além destes dois arquivos, `docs/` contém somente complementos de segurança (`docs/security/`), que não são fonte de decisão de produto.
5. Não inventar conclusão, teste, deploy, conexão ao ERP ou dado comercial. Anotar como **decidido / implementado / pendente / bloqueado**.
6. Atualizar **este `memory-ai.md`** quando houver decisão duradoura, e **`roadmap.md`** quando houver mudança de status, commit, risco, bloqueio ou etapa. Não criar novos arquivos Markdown de memória nem pastas `permanente`/`prompts` paralelas.

### Estado atual do código (transição)

- **Correção confirmada em 25/10/2026:** a main remota já contém Next.js/PostgreSQL e a coordenação, integrados em `018648f`; HEAD consultado `984079e`. Os apontamentos abaixo sobre main antiga e branches de desenvolvimento são históricos. A cópia local `D:\.GITHUB\sistemas\loja-comercial-do-norte` estava em `c6977e0` (23/10), foi sincronizada por fast-forward para `984079e` nesta sessão. O origin local ainda usa a URL antiga de `victorwilliames`; o repositório oficial é `idedigitalbr/loja-comercial-do-norte`. **Não refazer a migração Next nem reutilizar o storefront Vite antigo.** Vite permanece no admin.
- Referência inspecionada: branch `chore/multiagent-coordination`, derivada de `feat/stack-next-postgres` (`88c413c`). A `main` permanece em `564c9e3` até revisão humana. Em 24/10/2026 o **storefront passou a ser Next.js 16 (App Router)** consumindo a API REST, o **admin** continua React/Vite, o Prisma aponta para **PostgreSQL** com migrations versionadas e o domínio de **cotação** já existe na API.
- Next.js, NestJS e PostgreSQL estão implementados na branch de desenvolvimento; padronização completa de UI, aceite no navegador e produção permanecem pendentes. Não confundir implementação nessa branch com integração na `main` ou publicação.
- Projeto **em desenvolvimento**; segundo o responsável, **ainda não há produtos cadastrados**. Não concluir daí que o banco está vazio: validar usuários, configurações, banners e demais registros antes de qualquer reset.
- Meta da fase 1: **31/10/2026** (evento ACP), sujeita à validação de prontidão. Não declarar lançamento realizado.

| Camada | Decidido | Implementado hoje | Pendente |
|---|---|---|---|
| Storefront | Next.js App Router + TypeScript | **Next.js 16.4.3** em `apps/storefront` publicado na Vercel (`loja-comercialdonorte.vercel.app`) consumindo a API REST oficial | estado vazio/erros de rede, E2E Playwright, design da referência (fase C/D5) |
| API | NestJS, fonte única da regra de negócio | **NestJS 11 + Express 5** hospedado em Vercel Functions (`api-comercialdonorte.vercel.app`) | manter e evoluir |
| Banco | PostgreSQL (Neon na nuvem + Embedded local) | **PostgreSQL 18 no Neon** (AWS sa-east-1, São Paulo), conectado à API NestJS na Vercel | manter e monitorar |
| ORM | Prisma | Prisma 6 | revisar schema e histórico de migrations |
| UI | Tailwind CSS + shadcn/ui + `packages/ui` | CSS manual extenso + `packages/ui` parcial | padronizar (fase C) |
| Ícones | Lucide | Lucide | manter |
| Cotação | solicitação + aviso à equipe de vendas | **implementada** (`Quote`/`QuoteItem`/`QuoteEvent`, `POST /quotes` público, fila no admin, notificação) | telas finais/E2E (E8) |
| Flags de escopo | fase 1 sem checkout/pagamento/treinamento | `FEATURE_CHECKOUT/PAYMENTS/TRAININGS` desligadas por padrão, rotas retornam 404 | esconder telas legadas do admin |
| ERP | integração futura | inexistente | fase F |

## 1. Decisão FINAL de arquitetura — não reabrir por preferência de framework

**Stack aprovada para a Comercial do Norte:**

| Camada | Padrão obrigatório | Papel e limites |
|---|---|---|
| Storefront público | **Next.js + React + TypeScript** | Renderização adequada a SEO de produto/categoria, experiência responsiva e páginas institucionais |
| API / regras comerciais | **NestJS existente**, Node.js + TypeScript | **Fonte única da lógica de negócio**, catálogo, cotação, autenticação, integrações, pagamentos futuros e autorização |
| Banco de dados | **PostgreSQL** | Provider PostgreSQL implementado na branch de desenvolvimento; backup e validação antes de qualquer banco real |
| ORM | **Prisma** | Modelagem, migrações e acesso a dados **somente pela API NestJS** |
| Design e estilos | **Tailwind CSS + shadcn/ui + tokens CSS** | Componentes reutilizáveis, acessíveis, consistentes; **não instalar um segundo design system concorrente** |
| Componentes compartilhados | `packages/ui` | Componentes base, variantes, utilitários e tokens únicos para loja e admin |
| Ícones | **Lucide** | Mesmo estilo, tamanhos e stroke em todas as telas |
| Dados de servidor no cliente | **TanStack Query quando necessário** | Cache, sincronização e invalidação de requisições interativas; não confundir com TanStack Start |
| Forms / contratos | **React Hook Form + Zod** quando apropriado; `packages/contracts` | Schemas compartilhados, validação no servidor obrigatória, formulários padronizados |
| Workspaces | **Turborepo + pnpm** | Preservar monorepo, scripts centralizados, TypeScript strict, lint/test/build padronizados |
| Qualidade | **Vitest + Playwright + lint + typecheck** | Verificação automatizada, sobretudo fluxos de cotação, auth e concorrência |
| Hospedagem-alvo | **VPS com deploy definido e verificado** | Next.js e NestJS como serviços separados/reverse proxy; PostgreSQL persistente, backups, HTTPS, observabilidade. Não presumir que o modelo antigo (um processo Nest servindo os SPAs) sirva como deploy final |

### O que fica explicitamente DE FORA

- **MedusaJS: NÃO instalar, NÃO migrar o backend para Medusa, NÃO usá-lo como motor de pedidos, carrinho ou catálogo.** Pode servir apenas de inspiração conceitual quando solicitado.
- **Payload CMS: NÃO instalar, NÃO criar segundo backend, NÃO utilizar coleções ou backend Payload.** O estudo antigo de Payload é apenas histórico; no máximo aproveitar ideias de UX/CMS, sem dependência.
- **TanStack Start: NÃO adotar**. Decisão de framework público já é **Next.js**.
- Não criar APIs comerciais próprias dentro de Route Handlers do Next.js que dupliquem lógica NestJS. SSR pode consultar a API NestJS; a autorização permanece no backend.
- Não adicionar outro framework de componentes (MUI, Ant Design etc.) por comodidade; novas dependências requerem justificativa técnica.
- Não reintroduzir MySQL nem React/Vite como arquitetura final. Não reconstruir o backend Nest sem um requisito comprovado.

### Organização-alvo coerente com a base atual

```text
apps/
  storefront/          # Next.js App Router implementado; evolução visual incremental
  admin/               # painel React/Vite EXISTENTE; padronizar shadcn/Tailwind
                         # avaliar integração futura ao Next, sem big bang
  api/                 # NestJS — única API de negócio e acesso ao PostgreSQL
packages/
  ui/                  # tokens globais, shadcn/ui, componentes compartilhados
  contracts/           # Zod, DTOs e tipos públicos compartilhados
  api-client/          # cliente de API tipado, autenticação e tratamento de erros
  config-eslint/
  config-typescript/
prisma/                  # schema PostgreSQL + quatro migrations versionadas
site-comercial-do-norte-html-referencia/  # fonte visual de verdade
docs/
  memory-ai.md          # ESTA fonte de verdade
  roadmap.md            # execução, auditoria e registro de alterações
  security/             # complementos: LGPD e threat model
```

**Não renomear diretórios por estética sem mapear imports, scripts e deploy**. A migração para Next é incremental e o admin não precisa ser refeito no mesmo commit.

**Responsabilidades:** `storefront` e `admin` apenas consomem a API (nunca acessam banco); `api` concentra regra de negócio, persistência, autorização, integrações e jobs; `packages/*` guarda contratos, cliente tipado, componentes e configurações compartilhadas.

### Princípios obrigatórios de implementação

- Organização por domínio/feature; separação de camadas e dependências explícitas; baixa duplicação; contratos tipados e atualizados junto com API.
- Tokens e componentes canônicos centralizados no workspace compartilhado; nenhum CSS solto para refazer estilos já existentes. Tailwind sobre CSS custom properties. Configuração shadcn consistente em `apps/*` e `packages/ui`.
- Server Components por padrão em páginas Next quando fizer sentido; componentes cliente somente por interação real. SEO com metadata, conteúdo indexável e URLs canônicas verificadas. Estratégia de cache sem expor conteúdo privado.
- API NestJS preserva controle transacional, RBAC, validações, idempotência, logs com `requestId`, auditoria e autenticação segura. Nunca confiar em preço/frete/totais enviados pelo browser.
- Acessibilidade **WCAG 2.2 AA**, navegação por teclado, foco visível, `aria-*`, formulários com estados de sucesso/erro/carregamento, responsividade mobile-first.
- `pt-BR`, moeda BRL e fuso comercial **America/Belem**; separadores, preços em centavos e datas coerentes. Não hardcodar segredos, domínio nem dados privados.
- Não reescrever funcionalidades prontas só por conveniência. Mudança estrutural precisa ter teste, rollback e explicação de impacto no roadmap.

## 2. Produto e estratégia comercial

**Comercial do Norte**: distribuidora de plásticos, descartáveis, embalagens, variedades e mercearia, localizada em Belém/PA, atendendo **atacado e varejo** (pizzarias, padarias, lanchonetes, restaurantes, festas, escritórios, revendedores e consumidor final). O projeto substitui a experiência institucional antiga `dosplasticos.com.br`; domínio final ainda requer confirmação.

### Fase 1 — escopo vigente: catálogo + cotação

- A loja **parece e navega como e-commerce**, com preços de referência, busca, páginas de produtos, categorias, marcas, banners, conteúdo e ofertas; **não realiza cobrança online na fase 1**.
- Fluxo: catálogo → **Adicionar à Cotação** → carrinho de cotação → formulário (nome, WhatsApp, empresa opcional, observações) → **Enviar Cotação** → número/protocolo → equipe de vendas avisada por notificação → negociação/fechamento **no ERP**, fora do site.
- **Sem checkout de compra, Pix, cartão, parcelamento ou cálculo de frete para venda nesta fase**; não mostrar botões "Comprar"/"Finalizar compra".
- Produto novo entra em **rascunho/pendente, invisível no catálogo público**, até marketing completar os dados e publicar. Validar acesso por slug também, não apenas nas listagens.
- Marketing deve gerenciar produtos, categorias, marcas, banners, identidade, dados da loja e, progressivamente, páginas/blog no painel sem intervenção de programador.
- ERP ainda **não integrado**: catálogo por admin/seed provisório. A futura API do ERP será origem autoritativa dos dados que fornecer; manter `legacySource`, `legacyId` e SKU como pontos de integração. Não implementar sync sem especificação oficial.

### Fase 2 — posterior e NÃO habilitada agora

- Sincronização com ERP; marketplace/checkout completo quando aprovado; Pix/cartão, frete, reserva e conciliação de estoque; nota fiscal conforme integração e necessidades; conta do cliente completa; blog CMS editável, automação de marketing e otimizações.
- Módulos antigos NestJS de pagamentos, pedidos, cupons, estoque e treinamento **não devem ser apagados indiscriminadamente**: preservar e isolar por feature flags/rotas apropriadas até auditoria de domínio. Módulo de treinamentos é legado, fora da vitrine Comercial do Norte.
- **Não assumir que recursos herdados estão prontos para produção**. Há problemas conhecidos de webhook, jobs, segurança e frete descritos no roadmap.

### Regras de catálogo, produto e publicação

- Só produto `ACTIVE` aparece ao público; rascunho (`DRAFT`) fica invisível em listagem, busca, sitemap **e no acesso por slug**.
- Publicar exige: SKU na variante principal, foto principal (`isPrimary`), peso e dimensões (largura, altura, comprimento). A regra já existe em `CatalogService.publish` (`ProductIncompleteError`).
- Preço vive na variante, em centavos (`priceCents` e `compareAtPriceCents`); o "de/por" das ofertas deriva daí, nunca de texto livre.
- Categoria: hierarquia pai/filho implementada com `parentId`, `imagePath`, `sortOrder` e proteção contra ciclos. Filtros incluem descendentes; upload/ordenação no painel ainda precisam de aceite.
- Marca: já tem hierarquia pai/filho, e o filtro inclui as marcas filhas.
- Mídia: upload até 10 MB (JPEG/PNG/WebP) gera 3 larguras WebP (480/960/1440) + original em armazenamento próprio; **proibido hotlink externo** em produto, banner ou conteúdo.
- `legacySource` + `legacyId` (único composto) e `ProductVariant.sku` (único) são as âncoras de qualquer importação ou sincronização.
- Conteúdo de demonstração (marca, depoimento, preço) precisa estar marcado como exemplo e nunca ser publicado como real.

### Integração com o ERP (fase 2 — não implementar sem contrato)

- O ERP é a **fonte autoritativa** dos dados que fornecer: título, descrição, preço, galeria, categoria/subcategoria, peso e dimensões (cubagem) e, quando acordado, estoque.
- Produto que chega do ERP entra como **pendente/rascunho** e só é publicado depois que o marketing completar foto/descrição e aprovar.
- Sincronização idempotente por `legacySource`/`legacyId`/SKU; nunca apagar histórico local nem despublicar automaticamente por ausência no ERP sem decisão explícita.
- Nada de sync antes de: documentação oficial da API, autenticação, limites de requisição, eventos/periodicidade e política de conflitos acordados.
- O importador WooCommerce existente é **referência conceitual** de idempotência e reconciliação — não é dependência nem especificação do ERP.

## 3. Identidade visual e UX oficiais

- **Decisão do responsável em 26/10/2026 (Issue #61):** todos os títulos da vitrine (`h1` a `h6`) usam **Bold (700)**, centralizado no token `--cn-font-weight-heading` e aplicado no CSS global. A regra prevalece sobre as classes legadas de peso; tamanhos e cores são preservados.

**Fonte oficial:** `site-comercial-do-norte-html-referencia/DESIGN-comercial-do-norte.md`, com `index.html`, prévia de design system e `assets/`. Reutilizar a composição e os ativos já aprovados; não substituir por referência visual da +B Farma nem pelo visual preto/dourado da Jonas & Elivaldo.

### Requisito vigente de vitrine modular — 25/10/2026

- O responsável pediu reprodução extremamente fiel do **HTML real**, sem redesign, comparando viewports iguais. Não alterar a referência. Preservar API Nest, cotação e integrações existentes.
- Home por widgets conhecidos, tipados e validados: instância com `id`, `type`, `enabled`, `order`, `props`; composição versionada; registro fechado de renderizadores, sem HTML arbitrário vindo do banco. Conteúdo separado do JSX. Header/navegação/footer globais fora da ordenação livre.
- Server Components para carregamento/composição; Client Components apenas nas interações. Reutilizar `packages/ui`, contratos e API. Tailwind + tema shadcn alinhados aos tokens extraídos; a presença de primitivos próprios **não comprova** instalação completa do shadcn/Radix.
- Primeira implementação: fundamentos → header/navegação → hero de largura total → carrossel contido → carrossel de campanhas convencional. Não implementar todos os widgets nem editor visual agora.
- Evolução planejada: edição pelo admin, publicação sem deploy e preview/editor usando os mesmos renderizadores públicos. Persistência e autorização exclusivamente no Nest; não criar CMS/backend paralelo.
- **Implementação executada em 25/10/2026:**
  - **Fundamentos e Tokens:** Tokens oficiais do Header (`--cn-header-top-red: #e2091e`, `--cn-header-main-blue: #004cb1`, `--cn-header-subnav-blue: #00357b`, `--cn-bg-hero: #ebebeb`) centralizados em `packages/ui/src/styles/tokens.css` e mapeados no Tailwind 4 em `apps/storefront/app/globals.css`. Assets e favicons sincronizados em `apps/storefront/public/assets/`.
  - **Arquitetura Modular de Widgets:** Tipos estritos em `apps/storefront/lib/storefront/widget-types.ts` (`WidgetConfig`, `HeroCarouselProps`, `ContainedHeroProps`, `BenefitsBarProps`, `ProductCarouselProps`, `CategoryGridProps`), registro em `widget-registry.tsx` e renderizador seguro `PageRenderer`. Composição padrão da vitrine desacoplada do JSX em `home-configuration.ts`.
  - **Header Fiel à Referência (S0):** Três barras canônicas (`#E2091E` benefícios/WhatsApp, `#004CB1` Mascote James 3D / Logo oficial branca / CEP Belém / Busca circular Figma / Ações cotação e conta, `#00357B` departamentos e ofertas com tag NOVO), scroll auto-hide inteligente e Drawer Mobile off-canvas.
  - **Hero de Largura Total (S1):** `HeroCarouselWidget` estilo Mercado Livre, com autoplay, setas circulares brancas, indicadores de pontos e transição degradê inferior.
  - **Hero Secundário Contido (S1):** `ContainedHeroWidget` arredondado (`rounded-2xl md:rounded-3xl`), sobreposto com margem negativa (`-mt-8 sm:-mt-12 md:-mt-16 lg:-mt-20`), setas escuras translúcidas com blur e badge com dot da marca.
  - **Widgets Complementares:** `BenefitsBarWidget` (4 pilares comerciais), `ProductCarouselWidget` (ofertas com cards e cotação) e `CategoryGridWidget` (departamentos).
  - **Editor Visual Estilo Elementor (25-26/10/2026):** Implementado modo de edição visual interativo direto na vitrine pública (`HomeView`, `ElementorEditorProvider`, `ElementorTopBar`, `ElementorSectionWrapper`, `InlineImageEditorOverlay`). Permite ao administrador selecionar qualquer seção via alça minimalista (`[ ✎ Lápis ] | [ ⠿ Drag & Drop ] | [ ↑ ] [ ↓ ]`), inserir seção acima/abaixo, duplicar, ocultar ou remover, além de trocar imagens e links diretamente no centro de cada banner/card (`InlineImageEditorOverlay`). Possui:
    - **Controle de Acesso Admin:** O botão flutuante discreto `ElementorTogglePill` e o modo de edição só são visíveis e ativáveis por usuários autenticados como administradores (`user.isAdmin === true`). A rota `POST /api/storefront/composition` valida o cookie/permissão de administrador antes de salvar (retornando `403 Forbidden` para acessos não autorizados).
    - **Autosave Temporário Local vs Salvar no Servidor:** Cada alteração visual (troca de imagem, exclusão de slide, reordenação de seções) realiza autosave local imediato no navegador (`localStorage`) para evitar perda de rascunhos. O botão de publicação no topo fica pulsando com status `Salvar *`. Ao clicar, publica no servidor e passa a exibir `Salvo no Servidor` com ícone verde.
    - **Persistência Real no Servidor & SSR:** O arquivo `home-composition.json` é gravado no disco do servidor (`lib/storefront/composition-storage.ts`), revalida o cache Next.js (`revalidatePath('/')`), e é entregue via SSR no `layout.tsx` e `page.tsx` para que qualquer visitante ou aba anônima visualize as alterações imediatamente sem telas em branco ou layouts desatualizados.
    - **Histórico de Revisões e Checkpoints estilo Elementor (26/10/2026):** Implementado sistema completo de auditoria e restauração de versões (`ElementorRevisionsModal`, `StorefrontRevision`, `/api/storefront/revisions`). Cada salvamento no servidor grava automaticamente um checkpoint com data, hora, autor da alteração (`authorName`, `authorEmail`) e snapshot da vitrine. Permite visualizar a linha do tempo e restaurar com 1 clique qualquer versão anterior caso o administrador queira reverter alterações indevidas.
  - **Biblioteca Completa de Widgets e Homepage de 20 Seções (`site-final.jpg` + `wireframe.png` — 25/10/2026):**
    - Reconstruída a homepage inteira em fidelidade 1:1 com `REFERENCIA/site-final.jpg` (`2880×17208`) e `REFERENCIA/wireframe.png` (`1920×9267`), composta pelo `SiteHeader` (3 barras), **19 seções sequenciais de widgets configuráveis** (`defaultHomeComposition` em `home-configuration.ts`) e `SiteFooter` (Seção 20):
      - `01` `hero-carousel` (*Tudo para sua Pizzaria* — largura total com degradê inferior)
      - `02` `contained-hero` (*Semana do Feirante — Copo 180ml* — contido arredondado com overlap negativo)
      - `03` `category-grid` (`variant: 'icons-bar'` — faixa branca com 8 ícones quadrados editáveis)
      - `04` `product-carousel` (`variant: 'split-banner'` — banner vertical *Semana do Feirante* à esquerda + 3 produtos em promoção à direita)
      - `05` `banner-grid` (3 banners triplos: *Limpeza*, *Feirante*, *Sacos e Sacolas*)
      - `06` `product-carousel` (`variant: 'standard-5col'` — *Mais vendidos* com 5 colunas)
      - `07` `quote-steps-banner` (*Saiba / Como funciona a cotação online* — Mascote 3D James + 4 cards numerados com ícones azuis e setas vermelhas + arte direita; removido da vitrine inicial da Home a pedido do usuário, preservado no catálogo do Elementor)
      - `08` `segments-carousel` (*Para todos os Negócios / De todos os tamanhos* — topo em azul escuro com gradiente oficial e cards brancos editáveis sobrepondo em `-mt-28` com base transparente; prefixo padronizado como "Para" para todos os ramos; carrossel infinito contínuo avançando de 1 em 1 card sem buracos em branco ao final, suporte a autoplay inteligente pausável no hover/edição, swipe touch e 9 indicadores individuais).
      - `09` `promo-strip` (`variant: 'offers-strip'` — *OFERTAS IMPERDÍVEIS* em imagem oficial `/assets/HOME Vitrine/S9-BANNERZINHO-Promo/S9-BANNERZINHO-Promo.webp` e link para `/loja?oferta=1`)
      - `10` `product-carousel` (`variant: 'standard-5col'` — *Para você* com 5 colunas)
      - `11` `banner-grid` (3 banners triplos: *Hamburgueira*, *Luva Vermelho*, *Luva Azul*)
      - `12` `events-carousel` (*Nossos Eventos / Tudo que acontece no Comercial do Norte* — fundo escuro quadriculado e 4 cartazes `9:16` com imagens oficiais de `public/assets/HOME Vitrine/S12-EVENTOS/`; banner superior com thumbnail de palco removido a pedido do usuário)
      - `13` `promo-strip` (`variant: 'conditions-mascot'` — removido da vitrine Home abaixo de eventos a pedido do usuário; preservado no catálogo do Elementor)
      - `14` `product-carousel` (`variant: 'standard-5col'` — *Para você* com 5 colunas)
      - `15` `video-articles-carousel` (*Explica aí comercial* — bloco bordô com 2 cards horizontais de vídeo/artigo *Como escolher a caixa de pizza certa*)
      - `16` `instagram-feed` (*A Loja no Instagram* — `@comercialdonorte` com 6 cards verticais editáveis com imagens oficiais de `public/assets/HOME Vitrine/S15-INSTAGRAM/`)
      - `17` `promo-strip` (`variant: 'whatsapp-group'` — *Entre em nosso Grupo de ofertas Exclusivas do WhatsApp*; temporariamente isolado na rota dedicada `/secaoCotacaoWPP` a pedido do usuário para customização e ajustes)
      - `18` `testimonials-grid` (*AVALIAÇÕES NO GOOGLE — O que nossos clientes dizem no Google.* — 10 cards 5 estrelas em grid 5×2)
      - `19` `store-locations-map` (*Encontre nossas unidades / Lojas mais perto de você* — busca na coluna esquerda + 6 unidades da rede com links oficiais do Google Maps e scroll escuro + mapa interativo dinâmico)
      - `20` `SiteFooter` (Logo branca centralizada, redes sociais Instagram/TikTok/Facebook e barra azul `#1D3B78`)
  - **Validação:** `pnpm typecheck` 6/6 aprovados, `pnpm lint` 6/6 aprovados e `pnpm --filter storefront test` aprovados no monorepo.

| Papel | Valor oficial | Uso |
|---|---|---|
| Azul principal | `#264887` | Header, navegação, links/ações principais |
| Azul hover | `#1E3A6E` | Hover/foco conforme contraste |
| Vermelho comercial | `#E33C34` | Ofertas, sinalização comercial, CTA contextual |
| Vermelho hover | `#C92F27` | Estados de hover |
| Fundo | `#F4F7FB` | Fundo principal |
| Títulos | `#1D2433` | Títulos e textos de destaque |
| Texto | `#475467` | Conteúdo corrente |
| Superfície escura | `#13213B` | Footer/seções de contraste |

- Tipografia: **Lufga**, fallback **Plus Jakarta Sans**, sans-serif; escala 400/500/600/700/800. Usar licença e arquivos já legitimamente fornecidos ao projeto; não publicar fontes sem direitos.
- Logo oficial e variações na pasta `assets/Logos/` da referência HTML. Preservar integralmente proporções e marca.
- Componentes base: button, input, textarea, select, badge, dialog, sheet/mini-carrinho, dropdown/mega menu, card, table, form, toast/alert, skeleton, empty state; variantes consistentes e tipadas em `packages/ui`.
- Visual limpo de varejo, forte legibilidade, fotografias e produtos reais. Referências conceituais de organização: Magalu e Mercado Livre, **sem copiar identidades**.
- Conteúdo inventado, avaliações, marcas, produtos e preços devem ser **explicitamente marcados como demonstração** e nunca expostos como informação real.

### Estrutura editorial e da home (contrato de conteúdo)

- **S0 Cabeçalho:** barra fina (ofertas do dia, "compre pelo WhatsApp", "retire na loja"), logo, **busca grande** ("buscar embalagem, descartável, marca..."), "Informe seu CEP", conta e carrinho de cotação com contador; **mega menu de categorias/subcategorias** e atalhos para ofertas, marcas e conteúdo. Faixa de benefícios com os selos da empresa: **Menor Preço · Variedade · Tudo em um Só Lugar · Clientes Satisfeitos**.
- **S1** carrossel de campanhas administrável. **S2** marcas em círculos. **S3** ofertas do dia com etiquetas derivadas de dados confiáveis, contagem válida quando existir período cadastrado e CTA de cotação.
- **S4** categorias e banners de segmento (“Comercial do Norte do Pizzaiolo”). **S5** mais vendidos e atacado/pro seu negócio; não simular métricas reais sem dados.
- **S6** conteúdo “**Explica Aí Comercial**”, artigos/vídeos e produtos relacionados; na primeira fase pode ter conteúdo estático aprovado, posterior CMS editável.
- **S7** prova social **somente quando houver dados verificáveis**. **S8** loja física, localização e atendimento. **S9** ofertas/Instagram. **S10** rodapé completo: institucional, ajuda, minha conta, contatos, CNPJ, selos e políticas.
- Elementos adicionais planejados: atalhos pós-carrossel, explicação do processo de cotação, termos buscados quando existirem dados, consentimento/cookies LGPD.
- Produto: galeria real, SKU, variações, dados técnicos, marca/categoria, “Adicionar à Cotação”, mini-carrinho acessível e similares; categorias e marcas com URLs amigáveis.

### Categorias referenciadas na pesquisa do site anterior

Artigos para Festa; Embalagens; Descartáveis; Doces e Bomboniere; Sacos e Sacolas; Produtos de Limpeza; Frios e Laticínios; Mercearia. Subcategorias dependem da estrutura oficial do catálogo/ERP.

### Dados empresariais pesquisados, ainda **a confirmar antes da publicação**

- Endereço pesquisado: Av. Rômulo Maiorana, 115A, São Braz, Belém/PA, CEP 66093-635.
- Horários pesquisados: seg–sex 6h30–18h; sáb 6h30–12h30; dom 7h–12h30.
- Telefones pesquisados: (91) 4042-0513 e (91) 3246-4908; WhatsApp (91) 98344-0880.
- E-mail pesquisado: contato@dosplasticos.com.br; CNPJ pesquisado: 16.965.024/0001-15.
- Domínio final: pendente; não inferir que `dosplasticos.com.br` continuará. Nunca colocar `jonaselivaldohair.com.br` como canonical, destino de mídia ou contato.

## 4. Base existente — o que já está implementado

- Monorepo Turbo + pnpm com `apps/storefront` (Next.js App Router), `apps/admin` (React/Vite) e `apps/api` (NestJS 11 + Prisma 6 + PostgreSQL), além de `packages/contracts`, `ui` e `api-client`. Migrations versionadas incluem baseline, nome do site, cotações e hierarquia de categorias. A existência dos arquivos não comprova aplicação em produção.
- API com autenticação por sessão (cookie assinado), RBAC por permissão, catálogo (produto/variante/imagem), marcas hierárquicas, categorias, estoque com reserva transacional, carrinhos anônimos, cupons/promoções, pedidos com máquina de estados, pagamentos Mercado Pago, entregas, clientes, configurações, banners, notificações, relatórios e treinamentos herdados.
- `SiteBanner` é o model real de banners; `GET /api/v1/site/config` devolve site + banners ativos.
- Mídia com Sharp: original + 480/960/1440 WebP.
- Seed idempotente e importador WooCommerce ancorado em `legacySource`/`legacyId`.
- Admin cobre catálogo, fila de cotações, pedidos, estoque, clientes, promoções, relatórios e configurações. Módulos de compra são legado isolado por flags na API; ocultação completa no admin ainda está pendente.

Lacunas, defeitos e riscos dessa base **não são repetidos aqui**: estão em `roadmap.md` §3 (R01–R16) e nas fases de migração.

## 5. Regras para agentes — qualidade e segurança

1. **Antes de editar:** confirmar branch/HEAD, ler `memory-ai.md` + `roadmap.md`, conferir arquivos de código afetados e design de referência, definir testes e rollback; não sobrescrever trabalho em andamento.
2. **Alterar por etapas pequenas:** commit por migração/feature; mensagens em português; não misturar migração de banco, reescrita do frontend e redesign inteiro no mesmo commit.
3. **Nunca afirmar "implementado" apenas porque está neste documento.** Sempre comprovar em código + teste de execução.
4. **Dados críticos:** preservar identificadores, relacionamentos, saldos, histórico, privilégios e segredos. Mesmo sem produtos, verificar se há admin, configuração ou banner real antes de migrar/limpar bancos.
5. **Nomes de função/tabela/rota:** conferir schema atual e contratos antes de copiar de uma memória antiga; atualizar docs apenas quando efetivamente mudarem.
6. **Proteção de API:** autorização por recurso/ownership, RBAC, validação de input no servidor, limite de upload, CSP, CORS, CSRF conforme autenticação, rate limiting em endpoints públicos, logs sanitizados e LGPD.
7. **Estoque / cotação:** a solicitação de cotação **não confirma pedido pago** nem deve reservar estoque automaticamente; separar intenção de cotação de transação comercial.
8. **Padrão UI:** reutilizar shadcn/ui + `packages/ui` e tokens oficiais; componentes acessíveis; nada de CSS arbitrário duplicado nem animação invasiva.
9. **Segredo:** nunca commitar `.env`, tokens de ERP/Pagamentos, senhas ou dumps. Exemplos usam variáveis e valores fictícios marcados.
10. **Restrições de escopo:** sem Medusa, sem Payload, sem TanStack Start, sem reconstrução do backend Nest e sem ativar pagamentos na fase 1.

### 5.1 Coordenação multiagente permanente

- Fonte operacional: [Project 3](https://github.com/orgs/idedigitalbr/projects/3), preservando o nome configurado e somente **Tabela, Kanban e Roadmap**. Repositório oficial privado: `idedigitalbr/loja-comercial-do-norte`. Hierarquia nativa **Sprint → Etapa → Tarefa**, 36 tarefas originais; manutenção adicional identificada separadamente no manifesto.
- Toda Issue operacional possui responsável humano em Assignees; padrão autorizado `victorwilliames`, sem remover atribuições legítimas. Executor IA é outro campo. Campo vazio significa nenhuma IA designada.
- Identidade estável em `scripts/agents/executors.json`: executorId, ferramenta, operadorHumano, modelo e nomeExibido. Modelo desconhecido fica nulo; não usar os exemplos de modelos do briefing como telemetria. Novos operadores precisam de cadastro explícito e permissão de escrita no repo.
- Exclusividade e Acompanhamento: Consolidação na branch oficial e exclusiva `main`. Extinta a criação de branches de reserva `refs/heads/claims/issue-*`. O rastreamento de tarefas, sessões e agentes ocorre diretamente via GitHub Project 3 e comentários estruturados nas Issues.
- Ledger autoritativo: Marcadores estruturados nos comentários da própria Issue (`<!-- agent-session:... -->` e `<!-- agent-ledger:... -->`), preservando ator autenticado, sessão única, status e histórico.
- Não há expiração/liberação forçada automática. O estado da tarefa é controlado nos campos `Status` e `Agente executando` do Project 3. Conclusão exige commits na `main`, aprovação e evidências de testes.
- `pause/resume` registram eventos; duração total deriva de início/fim verificados. Tempo ativo, tokens de entrada/saída/cache/total, custo e provedor ficam **Não disponível** sem telemetria real. Não publicar custos privados nem segredos em campos, comentários ou ledger.
- Campos atuais: `Tipo` multisseleção; `Agente executando` seleção única; `Agentes que participaram` multisseleção, preenchido no início da execução, não no claim. `Trilha` foi removida; registros históricos foram preservados em comentários. Heartbeat atualiza atividade sem renovar reserva automaticamente; ausência de atividade não libera a trava.
- `project-sync.mjs` (bootstrap) cria o que falta; `--reconcile` corrige estrutura, dependências e incoerências comprovadas, sem reaplicar status/executor/assignees do manifesto sobre trabalho ativo. Não fecha tarefas nem agrupadores automaticamente. Repetição deve resultar em zero alterações. `verify-project.mjs` é somente leitura.
- Dependências nativas Blocked by/Blocking são verificadas por leitura da API; ciclos longos são recusados. Dependência aberta impede claim/start/resume. O manifesto preserva as 36 tarefas e 42 dependências originais.
- Status: Backlog, A Fazer, Reservado, Em Andamento, Em Revisão, Bloqueado, Concluído. Conclusão exige aprovação humana explícita, commit/PR/testes e filhos encerrados. CI e merge de PR não concluem nem liberam reserva. Revisão/bloqueio permanecem ao liberar a sessão.
- Prioridades preservam IDs e escala: P0 — URGENTE | Pra ontem; P1 — ALTA | Pra hoje; P2 — NORMAL | Prioridade média; P3 — BAIXA | Pra depois. Labels continuam existindo, ocultas na Tabela.
- Datas do Project: `Início`/`Entrega` são gravadas apenas quando faltam. Verificação da API confirmou 34/34 itens fora de Backlog com ambas as datas; 8 itens em Backlog sem datas. Datas de tarefas ativas são estimativas. Roadmap Sprint 3 preserva entrega aprovada em 31/10 apesar de tarefas filhas agregadas até 07/11; requer revisão humana. Seletores de timeline/escala do Roadmap não são expostos pela API usada e aguardam confirmação manual na UI.
- Workflows consultam a permissão real do ator (write/maintain/admin), usam argumentos diretos ao Node e nunca executam texto de comentários no shell. PR privilegiado só usa código da branch padrão; nunca checkout da cabeça do PR com token privilegiado.
- Automação de Projects usa secret `PROJECT_TOKEN` com escrita no Project da organização e leitura das Issues vinculadas. Preferir GitHub App com Organization projects read/write e acesso somente ao repo necessário; não pressupor que GITHUB_TOKEN efêmero tenha acesso organizacional. Git/Issues usam GITHUB_TOKEN com permissões do workflow. Não copiar a credencial OAuth local para secrets automaticamente. Referências: [autenticação de Projects](https://github.github.com/gh-aw/reference/auth-projects/), [refs Git](https://docs.github.com/en/rest/git/refs).
- Regras nativas de Project que renomeiam/fecham por IDs antigos devem ser revistas antes de mudar Status. A regra de adicionar sub-issues pode permanecer. Nenhuma automação deve concluir apenas por CI ou PR mesclado.
- Não criar branch para mudanças de campos. Para código, reutilizar branch segura quando possível; PR #37 tem base `feat/stack-next-postgres` para isolar coordenação. Merge na main e deploy exigem autorização separada.

## 6. Decisões pendentes fora da stack

- Confirmação de domínio, dados cadastrais/horários/contato, lista de marcas, catálogo e fotos, responsável/destino das cotações, origem real dos preços.
- Regras comerciais da fase 2 ainda em aberto: frete (provedor, regiões, prazo, fallback), retirada, condições de pagamento, cancelamento/reembolso, emissão fiscal/NF e política VIP.
- Documentação e contrato da API do ERP (Bruno/equipe), autenticação, limites, eventos, periodicidade e estratégia de sincronização.
- Infra de VPS, estratégia de deploy Next + Nest + PostgreSQL, armazenamento persistente de mídia, backups, CI/CD e plano de rollback.
- Definição de quando o painel administrativo será migrado para Next.js; **o objetivo firme agora é migrar a loja pública**, mantendo o painel utilizável durante a transição.

## 7. Checklist de Hardening, Segurança e Pré-Lançamento (Go-Live)

> **Regra de convivência com o desenvolvimento:** Durante a fase ativa de desenvolvimento e prototipação, atalhos de conveniência (contas mock de login, bypass de teste em rotas e fallbacks locais) permanecem ativos para acelerar a validação e não travar o fluxo de trabalho dos agentes e desenvolvedores. **Nenhum destes atalhos deve ser removido prematuramente**, devendo ser resolvidos estritamente na etapa final de homologação e lançamento.

### 7.1 Segurança & Acesso (Hardening)
- [ ] **Contas e senhas de demonstração:** Remover o botão *"Ver Senhas de Demonstração / Acesso Rápido"* e as contas estáticas (`admin@admin.com` / `cliente@demo.com`) de `AuthFlowCard` e `auth-provider.tsx` antes de disponibilizar para o público real.
- [ ] **Senha do Administrador de Produção:** Alterar a senha da conta administradora principal no banco de dados do Neon para uma senha forte, única e segura (substituindo a senha padrão de seed `admin123456`).
- [x] **Blindagem da API de Vitrine (Implementado 26/10/2026 via `admin-guard.ts`):** Fechada a permissão de conveniência `x-admin-role` e a leitura de cookie cru em ambientes de produção/Vercel (`403 Forbidden` com rejeição de atalhos inseguros), exigindo sessão oficial autenticada pelo NestJS (`je_access`) ou chave de serviço autorizada (`x-admin-secret`), enquanto preserva os atalhos em ambiente de desenvolvimento local/CI para não travar os fluxos de trabalho autônomos dos agentes.
- [x] **Persistência Durável no PostgreSQL Neon (Implementado 26/10/2026):** Composição ativa e histórico de revisões integrados ao PostgreSQL Neon (`SiteConfiguration.homeComposition` e `AuditLog`), permitindo que a Vercel serverless grave e recupere alterações sem depender do sistema de arquivos local (mantendo fallback em disco para desenvolvimento offline).
- [ ] **Fallback de Segredo de Sessão:** Remover o fallback `'development-cookie-secret'` nos serviços de autenticação e criptografia da API, exigindo `COOKIE_SECRET` estrito em qualquer runtime de produção.
- [ ] **Controle de Mídia e Uploads:** Limitar tipos MIME e tamanhos máximos para uploads de banners e logotipos no painel do editor visual.

### 7.2 Performance, Cache & Infraestrutura
- [ ] **Auditoria de Imagens:** Otimização de todos os assets estáticos via `next/image` com configuração rigorosa de domínios em `next.config.ts`.
- [ ] **Estratégia de Cache e ISR:** Ajustar os tempos de revalidação estática da vitrine e catálogo para equilibrar atualização em tempo real e economia de recursos no Neon/Vercel.
- [ ] **Connection Pooling no PostgreSQL:** Validar o limite de conexões simultâneas do pooler do Neon (`-pooler`) com a escala de acessos simultâneos na inauguração.
- [ ] **Headers de Segurança e CORS:** Revisar a lista de origens autorizadas (`APP_ORIGIN`, `ADMIN_ORIGIN`) nos cabeçalhos de resposta da API para bloquear requisições de origens desconhecidas.

**Regra final:** implementação ainda em andamento. Nenhuma documentação anterior, prompt ou decisão revogada revoga as escolhas de **Next.js + NestJS + PostgreSQL + Prisma + Tailwind + shadcn/ui** estabelecidas em 24/10/2026.

### Login único da vitrine — decisão de 26/10/2026 (Issue #56)

- O responsável definiu `/login` do storefront como única tela de login, inclusive para administradores. O painel Vite não deve apresentar formulário de credenciais próprio.
- O painel consulta a sessão no NestJS: sessão administrativa válida abre o dashboard; sessão ausente/expirada redireciona ao storefront; cliente autenticado recebe acesso restrito; falha de rede permite nova tentativa sem conceder acesso.
- `VITE_STOREFRONT_URL` define a origem de login em hospedagem separada. Em desenvolvimento, admin 5174 usa storefront 3001. A autenticação/publicação da Issue #55 permanece independente.

### Fluxo de entrega autorizado pelo responsável — 26/10/2026

- O responsável determinou integração direta na `main` para os ajustes solicitados, sem abrir PRs nem aguardar revisão de PR. Esta instrução explícita substitui a exigência anterior de PR para essas entregas. Preservar commits isolados, validações, reservas e push sem force; não presumir autorização de migrations ou deploy manual.
- A correção de login único da Issue #56 foi autorizada para integração direta. Validação real local: API NestJS e PostgreSQL existentes ligados, painel sem sessão redirecionou para `/login`, entrada pela conta ADMIN de desenvolvimento reconhecida pela API e dashboard aberto com a mesma sessão. Sem seed ou migration.

### Refinamento aprovado como direção visual — 26/10/2026 — Issue #60

- Explica Aí Nort: título principal acima do subtítulo, peso bold 700; pills rosa claro/vermelho, títulos azuis, três frases curtas por card e CTA contornado. Carrossel contínuo com parte do próximo card visível, degradê vermelho à direita e navegação por setas/toque/teclado.
- Quatro imagens editoriais sintéticas para pizza, kraft, copos e doces, com uniforme azul, enquadramento e luz quente consistentes. São ilustrações dos temas, sem identificação como clientes/equipe reais. Assets dedicados em `apps/storefront/public/assets/explica-ai/`, sem substituir fotos compartilhadas por outras seções.
- Composição padrão e JSON local atualizados; composições previamente publicadas pela API ou salvas no editor preservam seus dados e precisam de atualização/publicação administrativa para receber os novos textos e caminhos. Nenhuma gravação no banco ou publicação executada nesta tarefa.

- Atualização expressa do responsável em 26/10/2026: integrar esta alteração diretamente na main, sem exigir revisão de PR. Aplicação isolada do commit visual sobre origin/main; demais trabalhos pendentes não integram esta entrega. Esta autorização substitui a exigência anterior de PR para esta entrega.

### Decisão de testes de banco — 26/10/2026

A execução E2E da API deve usar banco descartável criado pelo runner `scripts/dev/run-api-e2e.mjs`, em PostgreSQL acessado por URL de loopback, sem herdar DATABASE_URL de produção. Migrations e seed automatizados ficam restritos a esse banco de teste; remoção só do banco UUID criado pela própria execução. No GitHub Actions, a conexão publicada em loopback chega a um service container cujo `inet_server_addr()` usa a faixa Docker privada `172.16/12`; essa exceção só é aceita com `GITHUB_ACTIONS=true` e `API_TEST_ALLOW_DOCKER=true`, repassados pelo Turborepo. A URL continua estritamente loopback e outras redes privadas/públicas são recusadas. Concorrência usa fixtures próprias. Idempotência concorrente de cotação precisa devolver o mesmo registro confirmado a todas as chamadas, preservando o escopo da chave; não basta haver uma única linha no banco se as outras chamadas falham. Formalizar migration já existente fisicamente no Neon exige inspeção somente de leitura e aprovação separada para aplicação.

### Decisão confirmada em 26/10/2026 — publicação administrativa da vitrine

Issue #55: o NestJS é a autoridade de publicação, validação, RBAC e persistência da composição. Composição ativa e checkpoint são gravados na mesma transação Prisma, com `ActorType.USER` e identidade da sessão; restauração cria novo checkpoint com o editor atual. A vitrine autentica pelo proxy same-origin `/api/v1`, com cookie HttpOnly emitido pelo Nest, evitando dependência de cookies de terceiros. Produção/Vercel exige `settings.manage`; e-mail, cookie de UI, localStorage e segredo de cron não concedem essa permissão. Falhas de persistência não podem virar sucesso ou fallback em disco em produção. O modo offline local permanece disponível somente fora de produção/Vercel, com composição e histórico no mesmo arquivo atômico. Esta decisão substitui as descrições históricas de SQL direto no Next, fallback de produção e autorização por segredo compartilhado. Aplicação em produção segue dependente de revisão humana, migration compatível e publicação coordenada da API e vitrine.


### Consolidação definitiva na main e extinção de branches de reserva — 26/10/2026

- **Decisão do responsável do projeto:** Revogada em definitivo a exigência de branches por issue, Pull Requests compulsórios e branches de reserva `claims/issue-*`.
- **Fluxo simplificado:** A branch `main` é a única branch ativa de desenvolvimento. Agentes operam diretamente na `main` com commits frequentes e push normal após validações automatizadas.
- **Rastreabilidade:** O controle é mantido nas GitHub Issues, comentários estruturados e GitHub Project 3, sem acúmulo de branches no Git.
- **Integração consolidada:** PRs #57 (vitrine transacional no NestJS), #51 (Playwright e mascote NORT), #52 (backup/restore PostgreSQL com bridge Docker) integrados na `main`.


### Decisão de Taxonomia e URLs Canônicas de Segmentos e Tags — 27/10/2026

- **Separação de Papéis na Taxonomia:**
  - O produto pode pertencer a uma hierarquia de Categoria/Subcategoria, ter uma única Marca de fabricante, múltiplos Segmentos de Atendimento (ex: um produto que atende Pizzarias e Hamburguerias simultaneamente) e múltiplas Tags Livres (ex: `kraft`, `biodegradavel`).
  - O Segmento possui papel de destaque comercial e visual: gera cards temáticos na vitrine e rotas canônicas de primeiro nível `/segmento/[slug]` (ex: `/segmento/pizzaria`), em paridade com `/categoria/[slug]`.
  - As Tags Livres atendem filtros transversais do catálogo e contam com páginas dedicadas em `/tag/[slug]`.
  - A rota geral `/loja` apoia a exploração combinada por meio de badges de filtros ativos com remoção individual (`×`) de busca textual, categoria, segmento ou tag.
- **Persistência e Seed:**
  - `prisma/seed-catalog.ts` inclui a criação idempotente dos 8 segmentos de demonstração e das 7 tags canônicas, associando-os aos produtos padrão do catálogo.

- **29/10/2026 — Padronização de Workshops e Aulas de Confeitaria (White Mode):** unificação estrutural completa entre a área geral de eventos e a trilha de workshops de confeitaria. Ambas compartilham os mesmos componentes canônicos (`EventsView` para listagem e `EventSinglePost` para a página individual), mantendo exatamente as mesmas seções (Hero 3 colunas, seleção de ingressos, destaques, programação com linha do tempo, card de localização com Google Maps, galeria de fotos e banner inferior de dúvidas no WhatsApp). A única distinção é o tema: dark mode para `/eventos` e white mode normal (`theme="light"`) para workshops. Resolução de erro 404 e integração completa do evento `workshop-doces-finos-brigadeiros-gourmet` no catálogo canônico de dados (`events-data.ts`).
- **29/10/2026 — Banner do post Explica Aí Nort:** referência enviada pelo responsável orienta banner vermelho 1610×393 px no desktop, celular central 232×466 px ultrapassando as bordas, breadcrumb discreto em duas linhas e fundo azul-claro. Estilos isolados no componente; conteúdo do post preservado.
- **05/11/2026 — Redesign do Chat Nort (Fidelidade Visual ao WhatsApp, Cores Sólidas, Wallpaper Clássico e Atendimento Conversacional Guiado):**
  - **Proibição de Gradientes e Glassmorphism:** Nenhum elemento do chat utiliza `linear-gradient`, `radial-gradient` ou `backdrop-blur`. Paleta centralizada nas variáveis CSS `--chat-header: #075844`, `--chat-background: #E4D8D3`, `--chat-received: #F1F3F4`, `--chat-sent: #E0FBD4`, `--chat-button: #FFFFFF`, `--chat-text: #111B21`, `--chat-muted: #667781`, `--chat-border: #D1D7DB` e `--chat-accent: #00A884`.
  - **Wallpaper Clássico do WhatsApp:** Aplicado fundo sólido `#E4D8D3` com a textura oficial de desenhos lineares (`apps/storefront/public/assets/whatsapp-wallpaper.jpg`) em `repeat` e `mix-blend-mode: multiply`.
  - **Fluxo Conversacional Guiado:** Nort (`Nort | Comercial do Norte`) conduz o atendimento com avatar circular oficial à esquerda das mensagens, simulação natural de digitação (`"digitando..."` no cabeçalho + balão com 3 pontos cinzas animados), identificação integrada à conversa (Nome + WhatsApp com máscara brasileira e validação), escolha da unidade (`Encontrar a mais próxima de mim` via geolocalização/CEP ou `Escolher uma unidade` dentre as filiais reais cadastradas) e opções de atendimento por botões de resposta rápida estilo WhatsApp (`#FFFFFF`), além de registro automático do lead no MiniCRM (`CrmLead`).
- **05/11/2026 — Modernização da Central de Atendimento Nort e Gestão de Tickets:**
  - **Janela Centralizada e Ampliada:** Modal centralizado na tela (`sm:w-[540px] md:w-[580px]`, `sm:h-[660px] sm:max-h-[88vh]`, `rounded-[22px]`, `border border-[#D1D7DB]`, `shadow-[0_25px_60px_rgba(0,0,0,0.6)]`) com overlay escuro e imersivo no fundo (`bg-[#000000]/95 backdrop-blur-[3px]`) e travamento de scroll da página.
  - **Botão Flutuante de Fechamento (X) Externo:** Posicionado 100% do lado de fora à direita da janela (`absolute top-1 sm:top-2 left-[calc(100%+12px)] sm:left-[calc(100%+16px)]`), com gap de respiro garantindo visibilidade total do cabeçalho e do botão de configurações sem qualquer sobreposição.
  - **Cabeçalho Simplificado:** Exibe exclusivamente **"Nort"** com selo verificado e status dinâmico (`online` / `digitando...`). Todos os controles anteriores foram consolidados em um **único botão de configurações** (ícone de engrenagem). Removido botão de voltar da conversa principal (o botão de voltar agora existe estritamente na navegação interna da Sidebar de Configurações).
  - **Sidebar Interna com 4 Vistas:** Desliza suavemente sem fechar o chat ou perder o contexto:
    1. *Novo atendimento:* Confirmação para arquivar conversa anterior e iniciar nova preservando dados do cliente.
    2. *Histórico de atendimentos:* Agrupamento cronológico (*Hoje*, *Ontem*, *Esta semana*, *Datas anteriores*), busca por texto e tela de detalhes do ticket com transcrição completa e **Trilha de eventos (Audit Trail)**.
    3. *Meus dados:* Formulário para consultar e atualizar Nome, WhatsApp, e-mail opcional e loja preferida.
    4. *Ajuda e suporte:* Contatos diretos, unidades da rede e gatilho do tour guiado da loja.
  - **Gestão de Tickets e Títulos Determinísticos sem IA:** Sistema em `apps/storefront/lib/nort-tickets.ts` com identificador sequencial amigável (`Ticket #000101`), título e categoria gerados a partir dos cliques e intenções reais do cliente.
  - **Trilha de Eventos e CRM:** Registro contínuo de eventos (`start`, `identify`, `select_unit`, `select_category`, `select_service`, `edit_data`, `finish`) enviado estruturadamente no payload do lead (`/api/v1/crm/leads`).
  - **Delays Humanos Naturais:** Calibragem de digitação lenta conforme faixas de caracteres (<25 chars: 0.8s–1.5s; 25–60 chars: 1.5s–2.0s; 60–120 chars: 2.0s–3.0s; >120 chars: 3.0s–4.0s) com pausas de respiração e indicador ondulante.
