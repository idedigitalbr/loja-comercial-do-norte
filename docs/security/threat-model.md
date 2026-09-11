# Threat model resumido

## Ativos

- credenciais e sessões de clientes e administradores;
- dados de contato, endereços e consentimentos;
- preços, estoque, reservas, pedidos e pagamentos;
- uploads de imagens e exports operacionais.

## Controles implementados

- Argon2id para senhas;
- cookies HTTP-only assinados e rotação de sessão;
- RBAC validado na API;
- validação de DTOs e uploads;
- idempotência para checkout, pagamentos, cupons, estoque e jobs;
- locks MySQL para estoque e vagas;
- HMAC no webhook Mercado Pago;
- segredos fora do repositório;
- anonimização transacional de dados pessoais.

## Riscos e pendências

- configurar rate limiting e bloqueio progressivo de login;
- validar credenciais e assinatura no ambiente Mercado Pago real;
- testar backup/restauração e permissões do hPanel;
- revisar retenção, suporte ao titular e logs antes do go-live.
