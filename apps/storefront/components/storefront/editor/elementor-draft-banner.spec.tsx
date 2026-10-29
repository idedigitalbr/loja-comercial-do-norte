/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { ElementorDraftBanner } from './elementor-draft-banner';

const mockUseElementor = vi.fn();
vi.mock('./elementor-editor-context', () => ({
  useElementor: () => mockUseElementor(),
}));

afterEach(cleanup);

describe('ElementorDraftBanner', () => {
  it('não renderiza quando não há rascunho ativo', () => {
    mockUseElementor.mockReturnValue({
      hasDraft: false,
      isEditing: false,
      previewMode: false,
      setIsEditing: vi.fn(),
      setPreviewMode: vi.fn(),
      discardDraft: vi.fn(),
    });

    render(<ElementorDraftBanner />);
    expect(screen.queryByText(/Modo Rascunho/i)).toBeNull();
  });

  it('renderiza o aviso com botões de Abrir no Editor e Excluir Rascunho quando há rascunho', () => {
    const mockSetIsEditing = vi.fn();
    const mockSetPreviewMode = vi.fn();
    const mockDiscardDraft = vi.fn();

    mockUseElementor.mockReturnValue({
      hasDraft: true,
      isEditing: false,
      previewMode: false,
      setIsEditing: mockSetIsEditing,
      setPreviewMode: mockSetPreviewMode,
      discardDraft: mockDiscardDraft,
    });

    render(<ElementorDraftBanner />);

    expect(screen.getByText(/Modo Rascunho/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Abrir no Editor/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Excluir Rascunho/i })).toBeDefined();

    // Clica em "Abrir no Editor"
    fireEvent.click(screen.getByRole('button', { name: /Abrir no Editor/i }));
    expect(mockSetIsEditing).toHaveBeenCalledWith(true);
    expect(mockSetPreviewMode).toHaveBeenCalledWith(false);

    // Clica em "Excluir Rascunho"
    fireEvent.click(screen.getByRole('button', { name: /Excluir Rascunho/i }));
    expect(mockDiscardDraft).toHaveBeenCalledWith(true);
  });

  it('oculta o aviso quando o editor está ativo no modo de edição', () => {
    mockUseElementor.mockReturnValue({
      hasDraft: true,
      isEditing: true,
      previewMode: false,
      setIsEditing: vi.fn(),
      setPreviewMode: vi.fn(),
      discardDraft: vi.fn(),
    });

    render(<ElementorDraftBanner />);
    expect(screen.queryByText(/Modo Rascunho/i)).toBeNull();
  });
});
