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
    expect(config.imageSrc).toBe("/assets/segmentos/pizzaria.png");
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
    expect(img.getAttribute("src")).toBe("/assets/segmentos/pizzaria.png");
    expect(img.className).toContain("object-bottom");
  });

  it("switches to fallback image if the specified image fails to load", () => {
    render(
      <SegmentHeroBanner
        segment={{ id: "seg-x", name: "Segmento Novo", slug: "segmento-novo" }}
      />
    );

    const img = screen.getByRole("img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/assets/segmentos/segmento-novo.png");

    // Simula erro de carregamento (onError)
    fireEvent.error(img);

    expect(img.getAttribute("src")).toBe("/assets/segmentos/default.png");
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
