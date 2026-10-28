/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { CatalogView } from "./catalog-view";
import type { ApiCategory, ApiProduct } from "@/lib/types";
import * as QuoteCartModule from "../quote-cart-provider";
import * as FavoritesModule from "../favorites-provider";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams("")),
}));

describe("CatalogView", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const mockProduct = {
    id: "prod-1",
    name: "Leite Condensado 395 g",
    slug: "leite-condensado-395g",
    description: "Lata de 395 g. Produto de demonstração do catálogo.",
    categoryId: "cat-mercearia",
    brandId: "brand-1",
    status: "ACTIVE",
    images: [],
    variants: [
      {
        id: "var-1",
        publicId: "var-pub-1",
        sku: "LEITE-395",
        priceCents: 749,
        compareAtPriceCents: 960,
        sortOrder: 0,
        status: "ACTIVE",
      },
    ],
  } as unknown as ApiProduct;

  const mockCategories = [
    {
      id: "artigos-para-festa",
      name: "Artigos para Festa",
      slug: "artigos-para-festa",
      status: "ACTIVE",
      sortOrder: 0,
      createdAt: "",
      updatedAt: "",
      children: [{ id: "sub-1", name: "Velas e Suprimentos", slug: "velas-e-suprimentos", status: "ACTIVE", sortOrder: 0, createdAt: "", updatedAt: "" }],
    },
    {
      id: "embalagens",
      name: "Embalagens",
      slug: "embalagens",
      status: "ACTIVE",
      sortOrder: 1,
      createdAt: "",
      updatedAt: "",
      children: [],
    },
  ] as unknown as ApiCategory[];

  const mockSegments = [
    { id: "seg-1", name: "Lanchonetes & Hamburguerias", slug: "lanchonete" },
    { id: "seg-2", name: "Pizzarias & Esfiharias", slug: "pizzaria" },
  ];

  const mockTags = [
    { id: "t-1", name: "Biodegradável", slug: "biodegradavel" },
    { id: "t-2", name: "Descartável", slug: "descartavel" },
    { id: "t-3", name: "Kraft", slug: "kraft" },
  ];

  it("renders catalog header, sidebar and 4-column product grid", () => {
    vi.spyOn(QuoteCartModule, "useQuoteCart").mockReturnValue({
      items: [],
      count: 0,
      subtotalCents: 0,
      ready: true,
      drawerOpen: false,
      add: vi.fn(),
      updateQuantity: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      openDrawer: vi.fn(),
      closeDrawer: vi.fn(),
    });

    vi.spyOn(FavoritesModule, "useFavorites").mockReturnValue({
      favorites: [],
      count: 0,
      ready: true,
      isFavorite: vi.fn(() => false),
      add: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
      clear: vi.fn(),
    });

    render(
      <CatalogView
        brands={[]}
        categories={mockCategories}
        page={1}
        products={[mockProduct]}
        searchParamsState={{}}
        segments={mockSegments}
        tags={mockTags}
        title="Catálogo completo"
        total={1}
        totalPages={1}
      />
    );

    // Title and count
    expect(screen.getByRole("heading", { name: "Catálogo completo", level: 1 })).toBeDefined();
    expect(screen.getByText(/1 produto\(s\) publicado\(s\)/i)).toBeDefined();

    // Sidebar sections
    expect(screen.getAllByText(/Tags & Filtros Rápidos/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Categorias/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Segmentos/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Filtros/i)[0]).toBeDefined();

    // Filter pills
    expect(screen.getAllByRole("button", { name: "Mais Vendidos" })[0]).toBeDefined();
    expect(screen.getAllByRole("button", { name: "Frete Grátis" })[0]).toBeDefined();

    // Product Card
    expect(screen.getByText("Leite Condensado 395 g")).toBeDefined();
    expect(screen.getByText("R$ 7,49")).toBeDefined();

    // Aside must NOT have inner scrollbar or overflow-y-auto
    const aside = screen.getByLabelText("Menu lateral e filtros de produtos");
    expect(aside.className).not.toContain("overflow-y-auto");
    expect(aside.className).not.toContain("max-h-");
    expect(aside.className).not.toContain("sidebar-scrollbar");
  });
});
