import { Injectable } from '@nestjs/common';

export type EmailTemplateSource = {
  subject: string;
  html: string;
  text: string;
};

export type EmailTemplateVariables = Record<string, string | number | boolean | null | undefined>;

export const EMAIL_TEMPLATE_VARIABLES = [
  'siteName',
  'customerName',
  'email',
  'loginUrl',
  'orderId',
  'orderUrl',
  'total',
  'totalCents',
  'status',
  'paymentId',
  'paymentStatus',
  'shippingMethod',
  'shippingAddress',
  'trackingCode',
  'expiresAt',
  'resetUrl',
  'supportUrl',
] as const;

const allowedVariables = new Set<string>(EMAIL_TEMPLATE_VARIABLES);
const variablePattern = /{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g;

function valueFor(name: string, variables: EmailTemplateVariables): string {
  const value = variables[name];
  return value === null || value === undefined ? '' : String(value);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

@Injectable()
export class EmailRenderer {
  render(template: EmailTemplateSource, variables: EmailTemplateVariables): { subject: string; html: string; text: string } {
    const sources = [template.subject, template.html, template.text];
    for (const source of sources) {
      for (const match of source.matchAll(variablePattern)) {
        if (!allowedVariables.has(match[1])) throw new Error('EMAIL_VARIABLE_NOT_ALLOWED');
      }
    }

    const interpolate = (source: string, escape: boolean) => source.replace(variablePattern, (_match, name: string) => {
      const value = valueFor(name, variables);
      return escape ? escapeHtml(value) : value;
    });

    return {
      subject: interpolate(template.subject, false),
      html: interpolate(template.html, true),
      text: interpolate(template.text, false),
    };
  }
}
