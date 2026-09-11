# Inventário de migração WooCommerce

Status: aguardando export oficial; a importação será executada posteriormente e não bloqueia a fundação do MVP.

## Fontes necessárias

- [ ] Export de produtos e variantes em CSV ou JSON.
- [ ] Export de categorias e marcas.
- [ ] Arquivo ou origem das imagens.
- [ ] Export de clientes, pedidos, cupons e avaliações, se forem migrados.
- [ ] Lista de URLs públicas atuais.
- [ ] Definição do que será preservado, anonimizado ou descartado.
- [ ] Contagem oficial de produtos para reconciliação; o número 346 do plano ainda não foi validado.

## Campos a reconciliar

| Domínio | Contagens/somas | Regras de aceite |
|---|---|---|
| Produtos | Ativos, rascunhos, arquivados | Nenhum item sem decisão de status |
| Variantes | SKUs únicos e duplicados | SKU duplicado exige resolução manual |
| Preços | Soma e amostra por faixa | Centavos, moeda BRL e preço vigente confirmados |
| Estoque | Físico, reservado e disponível | Nenhum saldo negativo |
| Marcas/categorias | Nomes antes/depois | Sem `Uncategorized` após o mapeamento |
| Imagens | Com imagem, sem imagem e falhas | Falhas listadas e não silenciosas |
| URLs | Slugs atuais e novos | Redirecionamentos aprovados |
| Histórico | Clientes/pedidos/cupons | Escopo aprovado no Gate B |

## Regras de execução

1. Fazer dry-run em banco descartável.
2. Importar com `legacySource` e `legacyId` idempotentes.
3. Gerar relatório de divergências antes de qualquer importação definitiva.
4. Aprovar o mapa de marcas, categorias e URLs.
5. Executar a migração final somente após o MVP passar os critérios de aceitação.
