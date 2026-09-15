import { describe, expect, it } from 'vitest';
import { EmailRenderer } from './email-renderer';

describe('EmailRenderer', () => {
  const renderer = new EmailRenderer();

  it('renders approved order variables in both HTML and text bodies', () => {
    const result = renderer.render(
      { subject: 'Pedido {{orderId}}', html: '<p>{{customerName}}</p>', text: 'Pedido {{orderId}}' },
      { orderId: 'JE-100', customerName: 'Ana' },
    );

    expect(result.subject).toBe('Pedido JE-100');
    expect(result.html).toContain('Ana');
    expect(result.text).toBe('Pedido JE-100');
  });

  it('escapes interpolated HTML values', () => {
    const result = renderer.render(
      { subject: 'Olá {{customerName}}', html: '<p>{{customerName}}</p>', text: '{{customerName}}' },
      { customerName: '<script>alert(1)</script>' },
    );

    expect(result.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(result.text).toContain('<script>alert(1)</script>');
  });

  it('rejects an undeclared variable instead of sending it literally', () => {
    expect(() => renderer.render({ subject: '{{secret}}', html: '', text: '' }, {})).toThrow('EMAIL_VARIABLE_NOT_ALLOWED');
  });
});
