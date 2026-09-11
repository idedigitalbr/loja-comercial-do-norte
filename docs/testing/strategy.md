# Estratégia inicial de testes

## Divisão por camada

| Camada | Ferramenta | Uso |
|---|---|---|
| Unitária | Vitest | Contratos, políticas de preço, máquinas de estado e componentes React |
| API | Jest/Supertest ou Vitest/Supertest, escolher uma opção | Controllers, guards e respostas HTTP |
| Integração | Test runner escolhido + MySQL real | Prisma, locks, migrations, jobs, pagamentos e concorrência |
| E2E | Playwright | Jornadas críticas do storefront e painel |

## Decisões obrigatórias antes da Task 1

- [ ] Escolher um único test runner para a API; o plano não deve misturar Jest e Vitest sem motivo.
- [ ] Provisionar MySQL 8 no CI e aplicar migrations em banco isolado por execução.
- [ ] Definir seed determinístico e limpeza de dados de teste.
- [ ] Definir instalação dos browsers do Playwright no CI.
- [ ] Configurar cobertura global de 80% e cobertura crítica de 95% sem mascarar testes de integração.
- [ ] Executar testes de concorrência contra MySQL/InnoDB, não apenas mocks.
- [ ] Registrar comandos oficiais por workspace no `package.json` raiz.

## Gate de qualidade

Uma tarefa só pode ser marcada como concluída quando os testes relevantes, typecheck, lint e a verificação de segurança aplicável passarem em ambiente limpo. Falhas intermitentes devem ser registradas e corrigidas; não devem ser ocultadas por retries ilimitados.
