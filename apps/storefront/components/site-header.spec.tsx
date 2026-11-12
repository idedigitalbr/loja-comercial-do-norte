/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";
import type { ApiBrand, ApiCategory, ApiSegment, ApiTag } from "@/lib/types";

// Mock das dependências
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("next/image", () => ({
  default: ({ fill, priority, unoptimized, ...props }: any) => <img {...props} />,
}));

vi.mock("./quote-cart-provider", () => ({
  useQuoteCart: () => ({ count: 0, openDrawer: vi.fn() }),
}));

vi.mock("./location-provider", () => ({
  useUserLocation: () => ({
    location: { shortLabel: "Belém, PA", cep: "66000-000" },
    openModal: vi.fn(),
  }),
}));

vi.mock("./favorites-provider", () => ({
  useFavorites: () => ({ count: 0 }),
}));

vi.mock("./auth-provider", () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

const mockCategories: ApiCategory[] = [
  {
    id: "cat-1",
    publicId: "cat-1",
    name: "Embalagens",
    slug: "embalagens",
    parentId: null,
    imagePath: null,
    sortOrder: 1,
    _count: { products: 25, children: 2 },
    children: [
      {
        id: "cat-1-1",
        publicId: "cat-1-1",
        name: "Caixas para Pizza",
        slug: "caixas-para-pizza",
        parentId: "cat-1",
        imagePath: null,
        sortOrder: 1,
        _count: { products: 12 },
      },
      {
        id: "cat-1-2",
        publicId: "cat-1-2",
        name: "Marmitas Térmicas",
        slug: "marmitas-termicas",
        parentId: "cat-1",
        imagePath: null,
        sortOrder: 2,
        _count: { products: 13 },
      },
    ],
  },
  {
    id: "cat-2",
    publicId: "cat-2",
    name: "Descartáveis",
    slug: "descartaveis",
    parentId: null,
    imagePath: null,
    sortOrder: 2,
    _count: { products: 40, children: 0 },
    children: [],
  },
];

const mockBrands: ApiBrand[] = [
  {
    id: "brand-fasapel",
    publicId: "brand-fasapel",
    name: "Fasapel",
    slug: "fasapel",
    description: "Papéis e guardanapos profissionais.",
    imagePath: "/assets/PRODUTOS/marcas-imgs/marca-fasapel.png",
    parentId: null,
    _count: { products: 97, children: 1 },
    children: [
      {
        id: "sub-fasapel-guardanapos",
        publicId: "sub-fasapel-guardanapos",
        name: "Guardanapos & Toalhas",
        slug: "fasapel-guardanapos-toalhas",
        imagePath: null,
        parentId: "brand-fasapel",
        _count: { products: 20 },
      },
    ],
  },
  {
    id: "brand-galvanotek",
    publicId: "brand-galvanotek",
    name: "Galvanotek",
    slug: "galvanotek",
    description: "Embalagens plásticas alimentícias.",
    imagePath: null,
    parentId: null,
    _count: { products: 75, children: 0 },
    children: [],
  },
];
const mockSegments: ApiSegment[] = [
  {
    id: "seg-1",
    name: "Pizzarias & Esfiharias",
    slug: "pizzaria",
    description: "Caixas e descartáveis para pizzarias.",
    _count: { products: 9 },
  },
  {
    id: "seg-2",
    name: "Delivery",
    slug: "delivery",
    description: "Sacolas kraft, lacres e marmitas.",
    _count: { products: 617 },
  },
];
const mockTags: ApiTag[] = [
  { id: "tag-1", name: "Biodegradável", slug: "biodegradavel" },
  { id: "tag-2", name: "Kraft", slug: "kraft" },
];

describe("SiteHeader - Floating Toggle Button & Drawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("inicia com o botão flutuante oculto no topo da página e exibe após rolar além do slide", () => {
    render(
      <SiteHeader
        brands={mockBrands}
        categories={mockCategories}
        logoUrl="/logo.png"
        phone="(91) 98344-0880"
        segments={mockSegments}
        siteName="Comercial do Norte"
        tags={mockTags}
        whatsapp="5591983440880"
      />
    );

    // O botão flutuante existe no DOM com tooltip
    const floatingBtn = screen.getByLabelText("Ver menu produtos");
    expect(floatingBtn).toBeDefined();

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.textContent).toContain("Ver menu produtos");

    // Container pai deve ter classe indicando oculto no topo
    const container = floatingBtn.closest("div.fixed");
    expect(container?.className).toContain("-translate-x-14");
    expect(container?.className).toContain("opacity-0");

    // Simula scroll além do threshold
    Object.defineProperty(window, "scrollY", { value: 400, writable: true });
    fireEvent.scroll(window);

    // Agora o container deve estar visível
    expect(container?.className).toContain("translate-x-0");
    expect(container?.className).toContain("opacity-100");
  });

  it("abre o drawer lateral ao clicar no botão flutuante", () => {
    render(
      <SiteHeader
        brands={mockBrands}
        categories={mockCategories}
        logoUrl="/logo.png"
        phone="(91) 98344-0880"
        segments={mockSegments}
        siteName="Comercial do Norte"
        tags={mockTags}
        whatsapp="5591983440880"
      />
    );

    const floatingBtn = screen.getByLabelText("Ver menu produtos");
    fireEvent.click(floatingBtn);

    // O drawer lateral abre
    expect(screen.getByRole("dialog", { name: "Menu de Navegação Lateral" })).toBeDefined();
  });

  it("abre e fecha o drawer lateral ao clicar sucessivamente no botão 'Categorias | Segmentos'", () => {
    render(
      <SiteHeader
        brands={mockBrands}
        categories={mockCategories}
        logoUrl="/logo.png"
        phone="(91) 98344-0880"
        segments={mockSegments}
        siteName="Comercial do Norte"
        tags={mockTags}
        whatsapp="5591983440880"
      />
    );

    const toggleBtn = screen.getByRole("button", {
      name: /abrir menu de categorias e segmentos/i,
    });

    // 1º clique: abre o drawer
    fireEvent.click(toggleBtn);
    expect(
      screen.getByRole("dialog", { name: "Menu de Navegação Lateral" })
    ).toBeDefined();

    // 2º clique no mesmo botão: fecha o drawer
    fireEvent.click(toggleBtn);
    expect(
      screen.queryByRole("dialog", { name: "Menu de Navegação Lateral" })
    ).toBeNull();
  });

  it("não renderiza o link do Podcast Universo Business no menu do cabeçalho nem no menu mobile", () => {
    render(
      <SiteHeader
        brands={mockBrands}
        categories={mockCategories}
        logoUrl="/logo.png"
        phone="(91) 98344-0880"
        segments={mockSegments}
        siteName="Comercial do Norte"
        tags={mockTags}
        whatsapp="5591983440880"
      />
    );

    // Não deve existir no cabeçalho desktop
    expect(
      screen.queryByRole("link", {
        name: /podcast universo business oficial/i,
      })
    ).toBeNull();

    // Abre o menu mobile para conferir se também não está no drawer
    const mobileMenuBtn = screen.getByRole("button", {
      name: /abrir menu principal/i,
    });
    fireEvent.click(mobileMenuBtn);

    expect(
      screen.queryByRole("link", {
        name: /podcast universo business oficial/i,
      })
    ).toBeNull();
  });
});

describe("SiteHeader - Mega Menus (Categorias, Segmentos e Marcas)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("substitui os gatilhos antigos pelos novos mega menus Categorias, Segmentos e Marcas", () => {
    render(
      <SiteHeader
        brands={mockBrands}
        categories={mockCategories}
        logoUrl="/logo.png"
        phone="(91) 98344-0880"
        segments={mockSegments}
        siteName="Comercial do Norte"
        tags={mockTags}
        whatsapp="5591983440880"
      />
    );

    expect(screen.getByRole("link", { name: /^Categorias$/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /^Segmentos$/i })).toBeDefined();
    expect(screen.getByRole("link", { name: /^Marcas$/i })).toBeDefined();

    // Antigos gatilhos no menu superior não devem mais aparecer como triggers de mega menu
    expect(screen.queryByRole("link", { name: /^Sacos & Sacolas$/i })).toBeNull();
  });

  it("abre o mega menu de Categorias ao passar o mouse e exibe categorias, subcategorias e tags", () => {
    render(
      <SiteHeader
        brands={mockBrands}
        categories={mockCategories}
        logoUrl="/logo.png"
        phone="(91) 98344-0880"
        segments={mockSegments}
        siteName="Comercial do Norte"
        tags={mockTags}
        whatsapp="5591983440880"
      />
    );

    const categoriasTrigger = screen.getByRole("link", { name: /^Categorias$/i });
    fireEvent.mouseEnter(categoriasTrigger.parentElement!);

    const menu = screen.getByRole("menu", { name: "Menu expandido de Categorias" });
    expect(menu).toBeDefined();
    expect(screen.getByText("Caixas para Pizza")).toBeDefined();
    expect(screen.getByText("Marmitas Térmicas")).toBeDefined();
    expect(screen.getByText("Biodegradável")).toBeDefined();

    // Troca preview ao passar o mouse em outra categoria sem subcategorias
    fireEvent.mouseEnter(screen.getByRole("link", { name: /Descartáveis/i }));
    expect(screen.getByText("Linha completa em Descartáveis")).toBeDefined();

    // Fecha ao clicar em um link dentro do mega menu
    fireEvent.click(screen.getByRole("link", { name: /Ver catálogo completo/i }));
    expect(
      screen.queryByRole("menu", { name: "Menu expandido de Categorias" })
    ).toBeNull();
  });

  it("abre o mega menu de Segmentos ao passar o mouse e atualiza o preview ao focar/hoverar segmento", () => {
    render(
      <SiteHeader
        brands={mockBrands}
        categories={mockCategories}
        logoUrl="/logo.png"
        phone="(91) 98344-0880"
        segments={mockSegments}
        siteName="Comercial do Norte"
        tags={mockTags}
        whatsapp="5591983440880"
      />
    );

    const segmentosTrigger = screen.getByRole("link", { name: /^Segmentos$/i });
    fireEvent.mouseEnter(segmentosTrigger.parentElement!);

    expect(
      screen.getByRole("menu", { name: "Menu expandido de Segmentos" })
    ).toBeDefined();
    const deliveryLink = screen.getByRole("link", { name: /Delivery/i });
    expect(deliveryLink.getAttribute("href")).toBe("/segmento/delivery");

    fireEvent.mouseEnter(deliveryLink);
    expect(screen.getByText("Sacolas kraft, lacres e marmitas.")).toBeDefined();
  });

  it("abre o mega menu de Marcas com marcas em destaque, catálogo adicional e submarcas no hover", () => {
    render(
      <SiteHeader
        brands={mockBrands}
        categories={mockCategories}
        logoUrl="/logo.png"
        phone="(91) 98344-0880"
        segments={mockSegments}
        siteName="Comercial do Norte"
        tags={mockTags}
        whatsapp="5591983440880"
      />
    );

    const marcasTrigger = screen.getByRole("link", { name: /^Marcas$/i });
    fireEvent.mouseEnter(marcasTrigger.parentElement!);

    expect(
      screen.getByRole("menu", { name: "Menu expandido de Marcas" })
    ).toBeDefined();

    const fasapelLink = screen.getByRole("link", { name: /Fasapel/i });
    expect(fasapelLink.getAttribute("href")).toBe("/marca/fasapel");
    expect(screen.getByRole("link", { name: /Galvanotek/i })).toBeDefined();

    // Hover na marca exibe suas submarcas no painel direito
    fireEvent.mouseEnter(fasapelLink);
    expect(
      screen.getByRole("link", { name: "Guardanapos & Toalhas" }).getAttribute("href")
    ).toBe("/marca/fasapel-guardanapos-toalhas");

    // Tecla Escape fecha o mega menu
    fireEvent.keyDown(marcasTrigger.closest("div.relative")!.parentElement!, {
      key: "Escape",
    });
    expect(
      screen.queryByRole("menu", { name: "Menu expandido de Marcas" })
    ).toBeNull();
  });
});
