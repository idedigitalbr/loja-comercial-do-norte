import { describe, expect, it } from "vitest";
import {
  getProductPlaceholderImage,
  PRODUCT_PLACEHOLDER_IMAGES,
  resolveProductImage,
} from "./product-placeholders";

describe("product-placeholders", () => {
  it("returns valid placeholder paths for all 4 images", () => {
    expect(PRODUCT_PLACEHOLDER_IMAGES).toHaveLength(4);
    for (const path of PRODUCT_PLACEHOLDER_IMAGES) {
      expect(path).toMatch(
        /^\/assets\/PRODUTOS\/placeholders\/placeholder-[1-4]\.png$/,
      );
    }
  });

  it("deterministically returns the exact same placeholder for the same product identifier", () => {
    const slug = "caixa-pizza-35cm";
    const result1 = getProductPlaceholderImage(slug);
    const result2 = getProductPlaceholderImage(slug);
    const result3 = resolveProductImage({ slug });
    expect(result1).toBe(result2);
    expect(result1).toBe(result3);
  });

  it("uses slug first, then fallback to id", () => {
    const product = {
      id: "cmvpec2az002r0w5gyx7t96pe",
      slug: "caixa-pizza-35cm",
    };
    expect(resolveProductImage(product)).toBe(
      getProductPlaceholderImage("caixa-pizza-35cm"),
    );

    const productOnlyId = { id: "cmvpec2az002r0w5gyx7t96pe", slug: null };
    expect(resolveProductImage(productOnlyId)).toBe(
      getProductPlaceholderImage("cmvpec2az002r0w5gyx7t96pe"),
    );
  });

  it("handles null, undefined, and empty string gracefully with default placeholder", () => {
    expect(getProductPlaceholderImage(null)).toBe(
      PRODUCT_PLACEHOLDER_IMAGES[0],
    );
    expect(getProductPlaceholderImage(undefined)).toBe(
      PRODUCT_PLACEHOLDER_IMAGES[0],
    );
    expect(getProductPlaceholderImage("")).toBe(PRODUCT_PLACEHOLDER_IMAGES[0]);
    expect(resolveProductImage({})).toBe(PRODUCT_PLACEHOLDER_IMAGES[0]);
  });

  it("distributes across all 4 placeholder images across catalog products", () => {
    const testSlugs = [
      "bandeja-isopor-n2",
      "caixa-pizza-35cm",
      "copo-descartavel-300ml",
      "detergente-neutro-5l",
      "filme-pvc-30cm",
      "forminha-docinho-n5",
      "guardanapo-papel-24x24",
      "leite-condensado-395g",
      "prato-descartavel-21cm",
      "queijo-mussarela-fatiado-1kg",
      "sacola-plastica-40x50",
      "velas-aniversario-coloridas",
    ];

    const usedImages = new Set<string>();
    for (const slug of testSlugs) {
      usedImages.add(getProductPlaceholderImage(slug));
    }

    // All 4 placeholders must be utilized
    expect(usedImages.size).toBe(4);
    for (const path of PRODUCT_PLACEHOLDER_IMAGES) {
      expect(usedImages.has(path)).toBe(true);
    }
  });
});
