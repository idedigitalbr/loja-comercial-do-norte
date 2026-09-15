import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Icon } from './icon';

describe('Icon', () => {
  it('renders a decorative Lucide icon with a stable semantic data name', () => {
    const { container } = render(<Icon name="map-pin" size={20} strokeWidth={1.75} />);
    const icon = container.querySelector('svg[data-icon="map-pin"]');

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('lucide', 'lucide-map-pin');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).toHaveAttribute('focusable', 'false');
    expect(icon).toHaveAttribute('width', '20');
    expect(icon).toHaveAttribute('stroke-width', '1.75');
  });
});
