# Threat model resumido

> Complemento de `docs/memory-ai.md` §5 (segurança). Não define escopo nem arquitetura.

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
- locks transacionais no banco para estoque e vagas;
- HMAC no webhook Mercado Pago;
- segredos fora do repositório;
- anonimização transacional de dados pessoais.

## Riscos e pendências

- configurar rate limiting e bloqueio progressivo de login;
- validar credenciais e assinatura no ambiente Mercado Pago real;
- testar backup/restauração e permissões do servidor (VPS com Next + Nest + PostgreSQL);
- revisar retenção, suporte ao titular e logs antes do go-live.

## Coordenação e rastreabilidade de agentes

- Ativos adicionais: identidade do operador, reserva por Issue, histórico de sessões/commits/PRs e configuração do Project privado.
- Controle: permissão real de escrita do ator, identificação estável do executor, sessão proprietária e uma ref por Issue; atualizações concorrentes recusadas por fast-forward. `pendingMirror` impede nova execução antes da confirmação do espelho. Recuperação não expira reservas automaticamente e exige motivo/constatação de processo encerrado.
- Comentários não provam propriedade. Inputs são argumentos estruturados do Node; workflow privilegiado nunca executa a cabeça do PR. PROJECT_TOKEN organizacional é separado do GITHUB_TOKEN.
- Limite: usuários com permissão de escrita no Git podem alterar refs fora do protocolo; a trava coordena agentes cooperantes, não substitui autorização do repositório. Não publicar credenciais, custos privados ou conteúdo sensível em ledger/comentários.
- Homologação de credenciais do Actions e conferência visual do Kanban/timeline permanecem descritas no roadmap. CI não concede aceite humano.
