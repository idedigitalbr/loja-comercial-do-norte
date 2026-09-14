# Configurações administrativas e integrações da loja

## Contexto

O painel administrativo já possui autenticação, catálogo, pedidos, estoque, promoções e relatórios. O módulo de pagamentos já define a interface para Pix, cartão, estorno e webhook do Mercado Pago, mas o provider atual ainda lança `MERCADO_PAGO_NOT_CONFIGURED`. O conteúdo institucional do storefront está concentrado em fallback estático e o sistema de jobs já possui o tipo `SEND_TRANSACTIONAL_EMAIL`, porém não há persistência de configurações, serviço SMTP ou templates.

## Objetivo

Adicionar ao painel uma área de configurações capaz de operar:

1. identidade e conteúdo visual básico do site;
2. banners da Home e seus estados de publicação;
3. credenciais e preferências do Mercado Pago;
4. SMTP e remetente das mensagens;
5. templates e preferências de notificações transacionais.

A solução deve manter os dados importados do WooCommerce e permitir que o site público consuma apenas configurações não sensíveis.

## Escopo funcional

### Configurações do site

Criar uma tela administrativa com identidade visual, nome da loja, logo, favicon, endereço, telefone, WhatsApp, Instagram, metadados básicos e links institucionais. Logo e favicon serão enviados por mídia, sem entrada de URL externa obrigatória.

### Banners da Home

Permitir criar, editar, ordenar, ativar/desativar e excluir banners. Cada registro terá mídia desktop, mídia mobile opcional, texto de apoio, título, descrição, rótulo e destino do CTA, ordem e status. O storefront carregará a configuração publicada e manterá o conteúdo estático atual como fallback quando a API não estiver disponível.

### Mercado Pago

Adicionar configuração para ambiente `TEST` ou `PRODUCTION`, access token, public key, segredo de assinatura do webhook, métodos habilitados e status da integração. Os endpoints de teste e salvamento devem validar as credenciais sem expor o token após o cadastro. O provider existente será conectado à API oficial para Pix, cartão tokenizado e estorno, preservando idempotência e o fluxo atual de webhook.

### SMTP e mensagens

Adicionar configuração de host, porta, usuário, senha, criptografia/TLS, remetente, nome do remetente e `reply-to`, com botão de envio de teste. A senha será armazenada cifrada e nunca retornada ao frontend.

Criar templates editáveis em texto e HTML para:

- cadastro de cliente;
- pedido criado;
- pagamento pendente, aprovado ou recusado;
- mudança de status do pedido;
- recuperação de senha, quando o fluxo estiver disponível.

Cada evento terá ativação individual, assunto, corpo e variáveis documentadas. O painel deverá oferecer pré-visualização e envio de teste.

## Arquitetura proposta

### Persistência

Adicionar modelos Prisma separados para evitar um registro genérico difícil de validar:

- `SiteConfiguration`: registro único com identidade e dados públicos do site;
- `SiteBanner`: banners ordenáveis e publicáveis;
- `PaymentConfiguration`: configuração única do Mercado Pago;
- `SmtpConfiguration`: configuração única do SMTP;
- `EmailTemplate`: template único por evento e idioma, com assunto, HTML, texto e status;
- `NotificationPreference`: ativação e destinatários por evento;
- `EmailDelivery` ou uso equivalente de `ScheduledJob`: rastreio de tentativas, estado e erro de cada envio.

Segredos serão cifrados com AES-GCM usando uma chave dedicada `SETTINGS_ENCRYPTION_KEY`, obrigatória fora do desenvolvimento. Logs, respostas públicas e respostas do painel conterão somente flags como `hasAccessToken` e `hasPassword`.

### API

Criar módulos protegidos por sessão e permissões administrativas para leitura/escrita de configurações, upload de mídia de site, banners, Mercado Pago, SMTP e templates. A API pública terá um endpoint somente leitura, por exemplo `/api/v1/site/config`, retornando identidade e banners publicados sem qualquer segredo.

Adicionar permissões específicas `settings.manage`, `payments.manage` e `notifications.manage`, mantendo compatibilidade com usuários que já possuem a role `ADMIN` após atualização do seed.

### Mídia

Reutilizar `LocalFileStorageService` e as validações de MIME/tamanho existentes. Logo e favicon receberão variantes adequadas; banners terão validação de imagem e caminhos persistentes em `storage/uploads`, sem apagar arquivos antigos automaticamente durante a atualização.

### Pagamentos

O `MercadoPagoProvider` receberá uma configuração resolvida em tempo de execução, estenderá os dados necessários do pagador e usará timeout e tratamento explícito para respostas da API. O fluxo de criação continuará protegido por chave de idempotência. O webhook validará assinatura quando o segredo estiver configurado, persistirá o evento antes de aplicar a transição e permanecerá idempotente.

### Notificações

Eventos de cadastro, criação de pedido, pagamento e mudança de status criarão um envio pendente de forma idempotente. O worker existente processará `SEND_TRANSACTIONAL_EMAIL`, renderizará as variáveis do template, enviará pelo SMTP configurado, registrará sucesso/erro e aplicará retentativas limitadas. Falha de e-mail não deve desfazer o cadastro, checkout ou transição de pedido.

## Segurança e operação

- Nunca armazenar token do Mercado Pago ou senha SMTP em texto claro.
- Nunca devolver segredos em endpoints GET, logs ou mensagens de erro.
- Validar URLs, e-mails, portas, MIME, tamanho de upload e variáveis permitidas.
- Restringir cada mutação às permissões correspondentes.
- Manter o token do Mercado Pago fora do código e dos arquivos versionados.
- Fornecer variáveis no `.env.example`, sem valores reais.
- Preservar fallback estático do storefront durante migração e indisponibilidade da API.

## Testes e critérios de aceitação

Implementar em TDD, cobrindo antes do código:

- cifra/decifra e ausência de segredos nas respostas;
- validação e autorização dos endpoints administrativos;
- persistência e ordenação/publicação de banners;
- endpoint público sem campos sensíveis;
- provider Mercado Pago com respostas de Pix, cartão, estorno, timeout e erro;
- assinatura e duplicidade de webhook;
- criação idempotente e retentativa de e-mails;
- renderização de templates e variáveis inválidas;
- telas administrativas de configurações, upload, teste e estados de erro;
- carregamento do storefront com configuração remota e fallback.

Critérios de aceite: um administrador consegue configurar a identidade e banners sem editar código; consegue testar e habilitar Mercado Pago e SMTP sem revelar segredos; consegue ativar templates e receber as mensagens dos eventos previstos; o site público usa os dados publicados; e o catálogo importado continua íntegro.

## Fora do escopo desta etapa

Não incluir editor visual completo de todas as seções institucionais, múltiplos provedores de pagamento, campanhas de marketing por e-mail, automação de WhatsApp ou armazenamento em serviço externo de mídia. Esses itens podem ser adicionados sobre os mesmos limites depois.
