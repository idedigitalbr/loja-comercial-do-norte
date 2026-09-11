# Backup e rollback na Hostinger

Antes de migration ou troca de pacote:

1. Exportar o banco MySQL e armazenar o backup fora do diretório público.
2. Preservar o pacote anterior e o diretório persistente `storage/uploads`.
3. Registrar versão, migration aplicada e horário.

Para rollback de aplicação, reaponte o startup para o pacote anterior sem desfazer migrations. Migrations incompatíveis devem ser divididas em etapas retrocompatíveis; nunca use reset ou drop no ambiente de produção.

Para restauração, bloquear novas requisições, restaurar o banco validado, restaurar o pacote correspondente, executar o health check e validar um pedido controlado antes de reabrir o domínio.
