# Auditoria Completa — Catálogo Comercial do Norte 2026

Pipeline auditável, reproduzível e 100% offline usando `CATALOGO-ORIGINAL-DIAGRAMADO-NORTE-2026.pdf` como fonte oficial prioritária, compatível com a arquitetura real Prisma/NestJS de `loja-comercial-do-norte`.

## Totais Recalculados da Auditoria Atual
- **Produtos Pais Únicos**: 729
- **Variações / SKUs Únicos**: 827
- **Marcas Padronizadas**: 40
- **Categorias Nível 1 / Subcategorias Nível 2**: 9 / 31
- **Imagens WebP Finais Auditadas**: 729
- **Classificação para Importação em Massa (DRAFT)**:
  - **A. LIBERADO**: 501
  - **B. RASCUNHO_COM_RESSALVAS**: 285
  - **C. BLOQUEADO**: 41

## Como Executar Novamente (Reproduzível)
Na pasta raiz (`D:\.GITHUB\sistemas\produtos-do-catalogo-verificar`):
```powershell
.\auditoria_catalogo\auditar.bat
```
Ou via Python diretamente:
```powershell
C:\Users\willi\AppData\Local\Programs\Python\Python312\python.exe -m auditoria_catalogo.cli audit
```

## Como Abrir a Interface Visual no Navegador
1. **Modo servidor local dinâmico (recomendado)**:
```powershell
C:\Users\willi\AppData\Local\Programs\Python\Python312\python.exe -m auditoria_catalogo.cli serve --port 8765
```
Acesse `http://127.0.0.1:8765` para pesquisar em tempo real, filtrar por classificação A/B/C, marca, categoria, pendência, página PDF, ampliar imagens e inspecionar diferenças original vs corrigido.
2. **Modo arquivo estático**: abra `resultado_final\relatorio_auditoria.html` diretamente no navegador.

## Como Executar os Testes Automatizados
```powershell
C:\Users\willi\AppData\Local\Programs\Python\Python312\python.exe -m unittest discover -s auditoria_catalogo/tests -v
```

## Arquivos Entregues em `resultado_final/`
- `catalogo_final.xlsx` (abas formatadas)
- `catalogo_final.csv` (UTF-8 com BOM, delimitador `;`)
- `catalogo_final.json`, `produtos.json`, `variacoes.json`, `marcas.json`, `categorias.json`
- `imagens/` (WebPs auditados e corrigidos) e `manifesto_imagens.json`
- `pendencias_reais.csv` e `relatorio_validacao.json`
- `mapeamento_prisma.json` e `ALTERACOES_BANCO_PROPOSTAS.md`
- `relatorio_auditoria.html` (painel interativo)
- `auditoria.db` (histórico SQLite completo)
- `CATALOGO_NORTE_2026_AUDITORIA_FINAL.zip` (pacote consolidado)
