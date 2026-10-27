/**
 * Placeholders temporários padronizados para todos os produtos do catálogo (Fase 1).
 * Quatro imagens oficiais disponíveis em /assets/PRODUTOS/placeholders/:
 * - placeholder-1.png
 * - placeholder-2.png
 * - placeholder-3.png
 * - placeholder-4.png
 */
export const PRODUCT_PLACEHOLDER_IMAGES = [
  "/assets/PRODUTOS/placeholders/placeholder-1.png",
  "/assets/PRODUTOS/placeholders/placeholder-2.png",
  "/assets/PRODUTOS/placeholders/placeholder-3.png",
  "/assets/PRODUTOS/placeholders/placeholder-4.png",
] as const;

export type ProductPlaceholderImage =
  (typeof PRODUCT_PLACEHOLDER_IMAGES)[number];

/**
 * Retorna de forma determinística um dos 4 placeholders temporários padronizados.
 * Utiliza o slug ou ID do produto para garantir que um mesmo produto SEMPRE
 * exiba a mesma imagem em todas as páginas e contextos:
 * - Homepage (carrosséis, ofertas relâmpago, mais vendidos, para você)
 * - Catálogo completo (/loja) e buscas
 * - Categorias e subcategorias (/categoria/[slug])
 * - Página individual de produto (/produto/[slug]) e produtos relacionados
 * - Gaveta e formulário de cotação (/cotacao e /cotacao/[publicId])
 * - Favoritos (/favoritos) e sacola (/compras)
 */
export function getProductPlaceholderImage(
  productOrKey?: { id?: string | null; slug?: string | null } | string | null,
): string {
  if (!productOrKey) {
    return PRODUCT_PLACEHOLDER_IMAGES[0];
  }

  let key = "";
  if (typeof productOrKey === "string") {
    key = productOrKey.toLowerCase().trim();
  } else {
    key = (productOrKey.slug || productOrKey.id || "").toLowerCase().trim();
  }

  if (!key) {
    return PRODUCT_PLACEHOLDER_IMAGES[0];
  }

  // Hash determinístico djb2-like simples e estável
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  const index = hash % PRODUCT_PLACEHOLDER_IMAGES.length;
  return PRODUCT_PLACEHOLDER_IMAGES[index];
}

/**
 * Resolução visual unificada de imagem de produto.
 * Nesta etapa de demonstração temporária, substitui visualmente todas as imagens
 * de produto por placeholders padronizados (mesmo para os que possuem foto cadastrada no banco).
 * Preserva integralmente os registros originais de mídia no PostgreSQL e no Neon.
 */
export function resolveProductImage(
  productOrKey?: { id?: string | null; slug?: string | null } | string | null,
): string {
  return getProductPlaceholderImage(productOrKey);
}
