# Mapa LGPD inicial

> Complemento de `docs/memory-ai.md` §5. Revisar com o jurídico antes do go-live.

| Dado | Finalidade | Acesso | Retenção/ação |
|---|---|---|---|
| E-mail e nome | conta, pedido e comunicação transacional | cliente autorizado e operação | manter enquanto necessário; anonimizar após solicitação válida |
| Telefone e endereço | entrega e suporte | cliente autorizado, operação e transportadora | manter enquanto pedido/suporte exigir |
| Documento | finalidade fiscal quando aplicável | operação autorizada | minimizar e anonimizar conforme política fiscal |
| Consentimentos | comprovar preferências | cliente e operação autorizada | preservar histórico necessário |
| Pagamento externo | conciliação sem armazenar cartão | operação financeira | guardar IDs/status do provedor, nunca PAN/CVV |
| Cotação: nome, WhatsApp, e-mail/empresa opcionais, itens e observações | responder à solicitação comercial e organizar a fila de vendas | solicitante (visão pública mascarada) e equipe comercial autorizada | manter enquanto a negociação estiver ativa; excluir/anonimizar após prazo definido e mediante solicitação |
| IP e identificador de requisição do endpoint de cotação | proteção contra abuso (rate limit) e rastreabilidade | operação autorizada | manter apenas em memória/por janela curta; não persistir em log com dados pessoais |
| Logs e auditoria | segurança e responsabilização | operação autorizada | retenção definida por política e sem segredos |
