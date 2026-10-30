/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { defaultHomeComposition } from '@/lib/storefront/home-configuration';
import { ElementorEditorProvider, useElementor } from './elementor-editor-context';

vi.mock('@/components/auth-provider', () => ({
  useAuth: () => ({ user: { isAdmin: true }, ready: true }),
}));

afterEach(() => { cleanup(); localStorage.clear(); });

it('shows the published home to an admin until editing starts, preserving the draft', () => {
  const draft = { ...defaultHomeComposition, widgets: [] };
  localStorage.setItem('cdn_home_composition_v6', JSON.stringify(draft));
  function View() {
    const { composition, isEditing, setIsEditing, discardDraft } = useElementor();
    return <><span data-testid="count">{composition.widgets.length}</span><button onClick={() => setIsEditing(!isEditing)}>Alternar editor</button><button onClick={discardDraft}>Apagar rascunho</button></>;
  }
  render(<ElementorEditorProvider initialComposition={defaultHomeComposition}><View /></ElementorEditorProvider>);
  expect(screen.getByTestId('count').textContent).toBe(String(defaultHomeComposition.widgets.length));
  fireEvent.click(screen.getByText('Alternar editor'));
  expect(screen.getByTestId('count').textContent).toBe('0');
  fireEvent.click(screen.getByText('Alternar editor'));
  expect(screen.getByTestId('count').textContent).toBe(String(defaultHomeComposition.widgets.length));
  expect(localStorage.getItem('cdn_home_composition_v6')).toBe(JSON.stringify(draft));
  fireEvent.click(screen.getByText('Alternar editor'));
  const confirmation = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
  fireEvent.click(screen.getByText('Apagar rascunho'));
  expect(screen.getByTestId('count').textContent).toBe('0');
  fireEvent.click(screen.getByText('Apagar rascunho'));
  expect(screen.getByTestId('count').textContent).toBe(String(defaultHomeComposition.widgets.length));
  expect(localStorage.getItem('cdn_home_composition_v6')).toBeNull();
  confirmation.mockRestore();
});
