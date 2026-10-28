/**
 * @vitest-environment jsdom
 */

import React from "react";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  SegmentHeroBanner,
  resolveSegmentBanner,
} from "./segment-hero-banner";

describe("SegmentHeroBanner", () => {
  afterEach(() => {
    cleanup();
  });

  it("resolveSegmentBanner correctly returns mapped data for pizzaria", () => {
    const config = resolveSegmentBanner("pizzaria");
    expect(config.prefix).toBe("O COMERCIAL");
    expect(config.highlight).toBe("DA SUA PIZZARIA");
    expect(config.imageSrc).toBe("/assets/PRODUTOS/segmentos/segmento-pizzaria.png.webp");
    expect(config.backgroundColor).toBe("#0059E9");
  });

  it("resolveSegmentBanner dynamically resolves feminine and masculine segment names", () => {
    const padaria = resolveSegmentBanner({ id: "1", name: "Padarias & Confeitarias", slug: "padaria" });
    expect(padaria.prefix).toBe("O COMERCIAL");
    expect(padaria.highlight).toBe("DA SUA PADARIA");

    const buffet = resolveSegmentBanner({ id: "2", name: "Restaurantes & Buffets", slug: "restaurante-buffet" });
    expect(buffet.prefix).toBe("O COMERCIAL");
    expect(buffet.highlight).toBe("DO SEU RESTAURANTE");

    const custom = resolveSegmentBanner({ id: "3", name: "Hamburgueria Gourmet", slug: "hamburgueria" });
    expect(custom.prefix).toBe("O COMERCIAL");
    expect(custom.highlight).toBe("DA SUA HAMBURGUERIA GOURMET");
  });

  it("resolves all 8 official segments to their respective photos in PRODUTOS/segmentos", () => {
    const expectations = [
      { slug: "pizzaria", image: "/assets/PRODUTOS/segmentos/segmento-pizzaria.png.webp", highlight: "DA SUA PIZZARIA" },
      { slug: "lanchonete", image: "/assets/PRODUTOS/segmentos/segmento-lanchonete.png.webp", highlight: "DA SUA LANCHONETE" },
      { slug: "padaria", image: "/assets/PRODUTOS/segmentos/segmento-padaria.png.webp", highlight: "DA SUA PADARIA" },
      { slug: "loja-de-festas", image: "/assets/PRODUTOS/segmentos/segmento-festas.png.webp", highlight: "DA SUA FESTA" },
      { slug: "festas", image: "/assets/PRODUTOS/segmentos/segmento-festas.png.webp", highlight: "DA SUA FESTA" },
      { slug: "restaurante-buffet", image: "/assets/PRODUTOS/segmentos/segmento-restaurante-buffet.png.webp", highlight: "DO SEU RESTAURANTE" },
      { slug: "confeitaria-bolos", image: "/assets/PRODUTOS/segmentos/segmento-confeitaria-bolos.png.webp", highlight: "DA SUA CONFEITARIA" },
      { slug: "sorveteria-acai", image: "/assets/PRODUTOS/segmentos/segmento-sorveteria-acai.png.webp", highlight: "DO SEU AÇAÍ" },
      { slug: "bar-distribuidora", image: "/assets/PRODUTOS/segmentos/segmento-bar-distribuidora.png.webp", highlight: "DO SEU BAR" },
    ];

    for (const exp of expectations) {
      const banner = resolveSegmentBanner(exp.slug);
      expect(banner.imageSrc).toBe(exp.image);
      expect(banner.highlight).toBe(exp.highlight);
    }
  });

  it("renders pizzaria banner with exact texts, image and brush underline", () => {
    render(
      <SegmentHeroBanner
        segment={{ id: "seg-1", name: "Pizzarias & Esfiharias", slug: "pizzaria" }}
      />
    );

    // Texto do lado esquerdo: O COMERCIAL
    expect(screen.getByText("O COMERCIAL")).toBeDefined();

    // Texto do lado direito: DA SUA PIZZARIA
    expect(screen.getByText("DA SUA")).toBeDefined();
    expect(screen.getByText("PIZZARIA")).toBeDefined();

    // Imagem no centro colada na base
    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("/assets/PRODUTOS/segmentos/segmento-pizzaria.png.webp");
    expect(img.className).toContain("object-bottom");
  });

  it("switches to fallback image if the specified image fails to load", () => {
    render(
      <SegmentHeroBanner
        segment={{ id: "seg-x", name: "Segmento Novo", slug: "segmento-novo" }}
      />
    );

    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/assets/PRODUTOS/segmentos/segmento-novo.png.webp");

    // Simula erro de carregamento (onError)
    fireEvent.error(img);

    expect(img.getAttribute("src")).toBe(
      "/assets/HOME Vitrine/S0-HEADER/Mascote-3D-NORT/corpo-inteiro/nort-apontando-joinha.png"
    );
  });

  it("respects banner prop overrides", () => {
    render(
      <SegmentHeroBanner
        banner={{
          prefix: "O COMERCIAL",
          highlight: "DO SEU NEGÓCIO",
          backgroundColor: "#004CB1",
        }}
      />
    );

    expect(screen.getByText("O COMERCIAL")).toBeDefined();
    expect(screen.getByText("DO SEU")).toBeDefined();
    expect(screen.getByText("NEGÓCIO")).toBeDefined();
  });
});
