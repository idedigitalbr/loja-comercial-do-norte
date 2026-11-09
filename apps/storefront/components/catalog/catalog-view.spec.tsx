/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
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

  it("renders active filter pills for Ofertas do Dia and Mais Vendidos", () => {
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
        searchParamsState={{ oferta: "1", ordem: "mais_vendidos" }}
        segments={mockSegments}
        tags={mockTags}
        title="Ofertas do Dia"
        total={1}
        totalPages={1}
      />
    );

    expect(screen.getByRole("heading", { name: "Ofertas do Dia", level: 1 })).toBeDefined();
    expect(screen.getByTitle("Remover filtro de ofertas")).toBeDefined();
    expect(screen.getByTitle("Remover ordenação por mais vendidos")).toBeDefined();
  });

  it("renders top brand logo strip and expanded subbrands tree when viewing a brand page", () => {
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
        activeBrand={{
          id: "brand-fasapel",
          publicId: "brand-fasapel",
          name: "Fasapel",
          slug: "fasapel",
          imagePath: "/assets/PRODUTOS/marcas-imgs/marca-fasapel.png",
          parentId: null,
        }}
        baseUrl="/marca/fasapel"
        brands={[]}
        categories={mockCategories}
        page={1}
        products={[mockProduct]}
        searchParamsState={{ marca: "fasapel" }}
        segments={mockSegments}
        tags={mockTags}
        title="Fasapel"
        total={10}
        totalPages={1}
      />
    );

    // Top brand navigation strip is rendered
    expect(screen.getByLabelText("Navegação rápida por marcas")).toBeDefined();

    // Sidebar header "VER POR: Marcas", Limpar Filtro button and Subbrands tree for Fasapel are visible
    expect(screen.getAllByText(/VER POR:/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Limpar Filtro/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Guardanapos & Toalhas/i)[0]).toBeDefined();
    expect(screen.getAllByText(/Papel Higiênico Institucional/i)[0]).toBeDefined();
  });

  it("renders 4-column brands grid in /marcas directory mode (viewMode='brands')", () => {
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
        baseUrl="/marcas"
        brands={[]}
        breadcrumbs={[{ label: "Marcas" }]}
        categories={mockCategories}
        page={1}
        products={[]}
        searchParamsState={{}}
        segments={mockSegments}
        tags={mockTags}
        title="Marcas"
        total={10}
        totalPages={1}
        viewMode="brands"
      />
    );

    expect(screen.getByRole("heading", { name: "Marcas", level: 1 })).toBeDefined();
    expect(screen.getByLabelText("Grade de marcas em 4 colunas")).toBeDefined();
    expect(screen.getAllByText(/VER POR:/i)[0]).toBeDefined();
  });

  it("highlights filtered brand in red, collapses other brands with 'Ver mais marcas' button, and expands full carousel with arrows on click", () => {
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
        activeBrand={{
          id: "brand-ultra-descartaveis",
          publicId: "brand-ultra-descartaveis",
          name: "Ultra Descartáveis",
          slug: "ultra-descartaveis",
          imagePath: "/assets/PRODUTOS/marcas-imgs/marca-ultradescartaveis.png",
          parentId: null,
          _count: { products: 5 },
        }}
        baseUrl="/marca/ultra-descartaveis"
        brands={[]}
        categories={mockCategories}
        page={1}
        products={[mockProduct]}
        searchParamsState={{ marca: "ultra-descartaveis" }}
        segments={mockSegments}
        tags={mockTags}
        title="Ultra Descartáveis"
        total={5}
        totalPages={1}
      />
    );

    // Initial state: brand is filtered, so focused mode is active
    expect(screen.getByText("Marca filtrada:")).toBeDefined();
    expect(screen.getByText("Remover filtro")).toBeDefined();
    expect(screen.getByText("Ver mais marcas")).toBeDefined();

    // Click "Ver mais marcas" to expand the full brand carousel
    const expandButton = screen.getByText("Ver mais marcas").closest("button");
    expect(expandButton).not.toBeNull();
    fireEvent.click(expandButton!);

    // Expanded state: shows header and collapse toggle
    expect(
      screen.getByText("Navegando por todas as marcas (marca filtrada em primeiro):")
    ).toBeDefined();
    expect(screen.getByText("Ocultar outras marcas")).toBeDefined();

    // Carousel arrows are present
    expect(screen.getByLabelText("Rolar marcas para a esquerda")).toBeDefined();
    expect(screen.getByLabelText("Rolar marcas para a direita")).toBeDefined();

    // Collapse back
    const collapseButton = screen.getByText("Ocultar outras marcas");
    fireEvent.click(collapseButton);

    // Back to focused mode
    expect(screen.getByText("Marca filtrada:")).toBeDefined();
  });
});
