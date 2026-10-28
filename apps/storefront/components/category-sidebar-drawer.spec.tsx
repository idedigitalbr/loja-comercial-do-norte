/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { CategorySidebarDrawer } from "./category-sidebar-drawer";
import type { ApiCategory, ApiSegment, ApiTag } from "@/lib/types";

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const mockCategories: ApiCategory[] = [
  {
    id: "cat-1",
    publicId: "cat-1",
    name: "Descartáveis",
    slug: "descartaveis",
    parentId: null,
    imagePath: null,
    sortOrder: 1,
    children: [
      {
        id: "cat-1-1",
        publicId: "cat-1-1",
        name: "Copos",
        slug: "copos",
        parentId: "cat-1",
        imagePath: null,
        sortOrder: 1,
      },
    ],
  },
  {
    id: "cat-2",
    publicId: "cat-2",
    name: "Embalagens",
    slug: "embalagens",
    parentId: null,
    imagePath: null,
    sortOrder: 2,
    children: [],
  },
  {
    id: "cat-3",
    publicId: "cat-3",
    name: "Artigos para Festa",
    slug: "artigos-para-festa",
    parentId: null,
    imagePath: null,
    sortOrder: 3,
    children: [],
  },
  {
    id: "cat-4",
    publicId: "cat-4",
    name: "Doces e Bomboniere",
    slug: "doces-e-bomboniere",
    parentId: null,
    imagePath: null,
    sortOrder: 4,
    children: [],
  },
  {
    id: "cat-5",
    publicId: "cat-5",
    name: "Produtos de Limpeza",
    slug: "produtos-de-limpeza",
    parentId: null,
    imagePath: null,
    sortOrder: 5,
    children: [],
  },
];

const mockSegments: ApiSegment[] = [
  { id: "seg-1", name: "Lanchonetes & Hamburguerias", slug: "lanchonete" },
  { id: "seg-2", name: "Pizzarias & Esfiharias", slug: "pizzaria" },
  { id: "seg-3", name: "Padarias & Confeitarias", slug: "padaria" },
  { id: "seg-4", name: "Festas & Eventos", slug: "loja-de-festas" },
  { id: "seg-5", name: "Bares & Distribuidoras", slug: "bar-distribuidora" },
];

const mockTags: ApiTag[] = [
  { id: "tag-1", name: "Biodegradável", slug: "biodegradavel" },
  { id: "tag-2", name: "Térmico", slug: "termico" },
  { id: "tag-3", name: "Kraft", slug: "kraft" },
  { id: "tag-4", name: "Reforçado", slug: "reforcado" },
];

describe("CategorySidebarDrawer", () => {
  it("não renderiza nada quando open é false", () => {
    const { container } = render(
      <CategorySidebarDrawer
        categories={mockCategories}
        onClose={vi.fn()}
        open={false}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renderiza busca, tags com ver mais, apenas 2 categorias iniciais e todos os segmentos", () => {
    const onClose = vi.fn();
    render(
      <CategorySidebarDrawer
        categories={mockCategories}
        onClose={onClose}
        open={true}
        segments={mockSegments}
        tags={mockTags}
      />
    );

    // Verifica títulos principais dos cards
    expect(screen.getByText("Categorias")).toBeDefined();
    expect(screen.getByText("Segmentos")).toBeDefined();

    // Verifica campo de busca
    const searchInput = screen.getByPlaceholderText("Buscar produtos, categorias...");
    expect(searchInput).toBeDefined();

    // Verifica tags iniciais (3 primeiras) e botão +1 mais
    expect(screen.getByText("Biodegradável")).toBeDefined();
    expect(screen.getByText("Térmico")).toBeDefined();
    expect(screen.getByText("Kraft")).toBeDefined();
    expect(screen.queryByText("Reforçado")).toBeNull();

    // Verifica que todos os segmentos aparecem sem botão Ver Menos e direcionam para /segmento/[slug]
    expect(screen.getByText("Lanchonetes & Hamburguerias")).toBeDefined();
    expect(screen.getByText("Bares & Distribuidoras")).toBeDefined();
    const lanchoneteLink = screen.getByText("Lanchonetes & Hamburguerias").closest("a");
    expect(lanchoneteLink?.getAttribute("href")).toBe("/segmento/lanchonete");
    const padariaLink = screen.getByText("Padarias & Confeitarias").closest("a");
    expect(padariaLink?.getAttribute("href")).toBe("/segmento/padaria");

    // Expande tags
    const expandTagsBtn = screen.getByText("+1 mais");
    fireEvent.click(expandTagsBtn);
    expect(screen.getByText("Reforçado")).toBeDefined();

    // Verifica apenas 2 categorias iniciais (Descartáveis e Embalagens)
    expect(screen.getByText("Descartáveis")).toBeDefined();
    expect(screen.getByText("Embalagens")).toBeDefined();
    expect(screen.queryByText("Artigos para Festa")).toBeNull();

    // Clicar no botão da categoria abre o accordion da subcategoria
    const rowButton = screen.getByRole("button", { name: /Descartáveis/i });
    fireEvent.click(rowButton);
    expect(screen.getByText("Copos")).toBeDefined();

    // Testa botão Ver Mais em Categorias para exibir as demais
    const verMaisBtn = screen.getByText("Ver Mais");
    fireEvent.click(verMaisBtn);
    expect(screen.getByText("Artigos para Festa")).toBeDefined();
    expect(screen.getByText("Produtos de Limpeza")).toBeDefined();

    // Botão inferior do catálogo
    expect(screen.getByText("Ver Catálogo Completo")).toBeDefined();

    // Fecha ao clicar no botão fechar (toggle flutuante)
    const closeBtn = screen.getAllByLabelText("Fechar menu lateral")[0];
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("filtra itens dinamicamente pelo campo de busca", () => {
    render(
      <CategorySidebarDrawer
        categories={mockCategories}
        onClose={vi.fn()}
        open={true}
        segments={mockSegments}
        tags={mockTags}
      />
    );

    const searchInput = screen.getByPlaceholderText("Buscar produtos, categorias...");
    fireEvent.change(searchInput, { target: { value: "pizza" } });

    // Deve exibir o segmento Pizzarias e ocultar Lanchonetes
    expect(screen.getByText("Pizzarias & Esfiharias")).toBeDefined();
    expect(screen.queryByText("Lanchonetes & Hamburguerias")).toBeNull();
  });

  it("fecha com a tecla Escape", () => {
    const onClose = vi.fn();
    render(
      <CategorySidebarDrawer
        categories={mockCategories}
        onClose={onClose}
        open={true}
      />
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("trava completamente a página principal (body e html com overflow hidden) enquanto aberto e restaura ao desmontar", () => {
    const { unmount } = render(
      <CategorySidebarDrawer
        categories={mockCategories}
        onClose={vi.fn()}
        open={true}
        segments={mockSegments}
        tags={mockTags}
      />
    );

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).not.toBe("hidden");
    expect(document.documentElement.style.overflow).not.toBe("hidden");
  });
});
