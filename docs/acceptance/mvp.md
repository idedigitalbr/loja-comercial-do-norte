# MVP comercial — escopo e aceitação

Status: preliminar; depende dos Gates A–D.

## Objetivo

Permitir que a operação publique produtos e treinamentos, receba pedidos com Pix ou cartão, controle estoque/vagas e acompanhe a execução sem depender de funcionalidades de crescimento.

## Incluído no MVP

- Catálogo público com produto, variante, marca, categoria, imagem, preço e disponibilidade.
- Cadastro/login opcional do cliente e checkout como convidado.
- Treinamento com turma, lote, capacidade e participante.
- Carrinho persistido, cotação de preço no servidor e cupom simples se aprovado no Gate B.
- Estoque com reserva concorrente e liberação por expiração/cancelamento.
- Frete ou retirada, conforme decisão do Gate B.
- Pedido com histórico de estados e snapshots de preço, endereço e entrega.
- Mercado Pago para Pix e cartão tokenizado, com webhook e idempotência.
- Painel mínimo para catálogo, estoque, pedidos, clientes e turmas.
- Jobs MySQL essenciais: expiração de reservas, reconciliação de pagamento e e-mail transacional.
- Auditoria das ações críticas e controles mínimos de autenticação, autorização, upload e logs.

## Fora do MVP inicial

- Relatórios analíticos avançados e exportações grandes.
- SEO dinâmico completo e geração avançada de JSON-LD.
- Migração automática de todos os históricos do WooCommerce.
- Cashback, pontos, carteira e regras VIP complexas.
- Automação de marketing e integrações não essenciais.

## Critérios de aceitação

- [ ] Ambiente limpo instala dependências, aplica migration e executa seed.
- [ ] Administrador publica produto completo e turma com vaga.
- [ ] Cliente compra produto com Pix e recebe código/estado persistido.
- [ ] Cliente compra produto com cartão tokenizado em ambiente de teste.
- [ ] Webhook duplicado ou fora de ordem não duplica pagamento nem pedido.
- [ ] Duas reservas concorrentes não conseguem consumir a última unidade/vaga.
- [ ] Cancelamento ou expiração libera estoque/vaga uma única vez.
- [ ] Pedido preserva preço, frete, participante e dados necessários no momento da compra.
- [ ] Usuário sem permissão não acessa ações administrativas críticas.
- [ ] Smoke test funciona no pacote de produção.
