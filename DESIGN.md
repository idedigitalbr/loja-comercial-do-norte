# Jonas & Elivaldo — Design Context

## Direção

Experiência de comércio premium para salão profissional: editorial, acolhedora e objetiva. O sistema combina preto profundo, dourado/amarelo institucional e superfícies claras para manter a marca reconhecível sem sacrificar legibilidade.

## Checkout

- Fluxo guiado em cinco etapas: contato, endereço, entrega, revisão e pagamento.
- Compra sem conta é o caminho padrão; criação de conta é uma opção explícita, sem bloquear o visitante.
- O resumo do pedido permanece visível em desktop e acompanha a leitura em telas menores.
- Campos obrigatórios têm validação inline, foco no primeiro erro e mensagens em português.
- Order bump aparece como oferta complementar no momento da revisão, sem interromper o checkout.

## Componentes e interação

- Ícones são Lucide, com espessura consistente e sem emojis ou glifos decorativos.
- Ações primárias usam o amarelo institucional; ações secundárias usam superfícies neutras e bordas finas.
- O carrinho lateral tem foco preso, fechamento por `Esc`, restauração de foco e badge de quantidade.
- No cabeçalho desktop da loja, o carrinho é representado por ícone e badge; no mobile, mantém o rótulo textual para descoberta.
- O CTA de WhatsApp usa o ícone de conversa e um brilho sutil contínuo, desativado para quem prefere movimento reduzido.
- Estados de carregamento, erro, carrinho vazio e produto sem imagem são sempre explícitos.

## Paridade com o site público atual

A referência visual vigente é https://jonaselivaldohair.com.br/ em todas as rotas públicas, incluindo Home, páginas institucionais, serviços, certificação e loja. Este requisito atualiza o direcionamento comercial premium anterior: fonte, cor, tamanho, recorte, espaçamento, ordem das seções, textos e efeitos devem seguir a página original observada. Consulte `docs/superpowers/plans/2026-10-01-auditoria-paridade-site-original.md` para diferenças auditadas, critérios e status por item.

- A página Sobre nós atual usa cinco painéis fotográficos (JE-6, FOTO-305, produt-6, JE-7 e JE-8); não acrescentar cartões de Missão, Visão e Valores.
- A rota original `/servicos/` retorna 404. O caminho de compatibilidade `/servicos#eventos` leva à seção Eventos da Home; não criar um índice inexistente na referência.
- O cabeçalho público mantém o visual original também na loja. Carrinho, conta, busca, favoritos, checkout e administração devem continuar funcionais em posições compactas e sem mudar a estrutura de referência.
- Usar conteúdo real do catálogo para nome, SKU, descrição, marca, categoria e recomendações. Não preencher descrição ausente com texto genérico. Nomes importados precisam exibir entidades HTML decodificadas.
- Quando a referência pública usa a imagem placeholder do WooCommerce por não possuir foto do produto, reproduzir essa condição; registrar separadamente mídia ausente na implementação.
- Valores de contato devem permanecer alinhados à referência: endereço completo, telefone (96) 98100-1897, WhatsApp 5596981001897 e Instagram `jonas_elivaldo_hair_designers`.

Última reconciliação do guia: 2026-10-01. A auditoria comparativa permanece em andamento.

## Responsividade

- Desktop: formulário e resumo em duas colunas, com resumo fixo durante a revisão.
- Tablet/mobile: uma coluna, controles de etapa e oferta complementar ocupam a largura disponível.
- Textos de formulário e botões permanecem legíveis sem depender de hover.

## Verificação

Última revisão visual e funcional: 2026-09-15. O checkout e o carrinho foram validados por testes automatizados, build de produção e inspeção no navegador local.
