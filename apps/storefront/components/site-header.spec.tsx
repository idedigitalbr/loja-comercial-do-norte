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
  default: ({ fill, priority, ...props }: any) => <img {...props} />,
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
    children: [],
  },
];

const mockBrands: ApiBrand[] = [];
const mockSegments: ApiSegment[] = [
  { id: "seg-1", name: "Pizzarias", slug: "pizzaria" },
];
const mockTags: ApiTag[] = [
  { id: "tag-1", name: "Biodegradável", slug: "biodegradavel" },
];

describe("SiteHeader - Floating Toggle Button & Drawer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
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
});
