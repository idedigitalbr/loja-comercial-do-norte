import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button', () => {
  it('exposes loading state and remains keyboard accessible', () => {
    render(<Button loading>Salvar</Button>);

    const button = screen.getByRole('button', { name: 'Salvar' });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });
});
