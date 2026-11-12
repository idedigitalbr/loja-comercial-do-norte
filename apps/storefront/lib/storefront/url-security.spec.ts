import { describe, expect, it } from 'vitest';
import {
  isSafeRelativePath,
  isValidImageUrl,
  isValidLinkUrl,
  isValidMapEmbedUrl,
  resolveSafeRedirectUrl,
  sanitizeCompositionProps,
  sanitizeImageUrl,
  sanitizeLinkUrl,
  sanitizeMapEmbedUrl,
  stripUnsafeKeys,
} from './url-security';

describe('url-security', () => {
  describe('link URLs', () => {
    it('permite caminhos relativos seguros, hashes e protocolos web seguros', () => {
      expect(isValidLinkUrl('/busca?q=botina')).toBe(true);
      expect(isValidLinkUrl('/assets/HOME Vitrine/Banner 1 (Desktop).webp')).toBe(true);
      expect(isValidLinkUrl('#produtos')).toBe(true);
      expect(isValidLinkUrl('https://wa.me/5591999999999')).toBe(true);
      expect(isValidLinkUrl('mailto:contato@comercialdonorte.com.br')).toBe(true);
      expect(isValidLinkUrl('tel:+559132000000')).toBe(true);
    });

    it('bloqueia javascript:, data:, vbscript:, //protocol-relative e path traversal', () => {
      expect(sanitizeLinkUrl('javascript:alert(1)')).toBe('#');
      expect(sanitizeLinkUrl('  JaVaScRiPt:alert(document.cookie)  ')).toBe('#');
      expect(sanitizeLinkUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
      expect(sanitizeLinkUrl('vbscript:msgbox(1)')).toBe('#');
      expect(sanitizeLinkUrl('//evil.com/phish')).toBe('#');
      expect(sanitizeLinkUrl('/assets/../etc/passwd')).toBe('#');
      expect(isSafeRelativePath('/assets/%2e%2e/secret')).toBe(false);
    });
  });

  describe('image URLs', () => {
    it('aceita imagens locais e https, bloqueando SVG data URL e scripts', () => {
      expect(sanitizeImageUrl('/storage/uploads/banner.webp')).toBe('/storage/uploads/banner.webp');
      expect(sanitizeImageUrl('/assets/HOME Vitrine/1 (1).png')).toBe('/assets/HOME Vitrine/1 (1).png');
      expect(sanitizeImageUrl('https://cdn.example.com/foto.jpg')).toBe('https://cdn.example.com/foto.jpg');
      expect(sanitizeImageUrl('http://localhost:3001/storage/uploads/b.png')).toBe('http://localhost:3001/storage/uploads/b.png');

      expect(sanitizeImageUrl('http://insecure.example.com/a.png')).toBe('');
      expect(sanitizeImageUrl('javascript:alert(1)')).toBe('');
      expect(
        sanitizeImageUrl('data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIj48L3N2Zz4=', '', {
          allowSafeRasterDataUrl: true,
        }),
      ).toBe('');
      expect(
        isValidImageUrl('data:image/png;base64,iVBORw0KGgo=', {
          allowSafeRasterDataUrl: true,
        }),
      ).toBe(true);
      expect(
        isValidImageUrl('data:image/png;base64,iVBORw0KGgo=', {
          allowSafeRasterDataUrl: false,
        }),
      ).toBe(false);
    });
  });

  describe('map embed URLs', () => {
    it('aceita apenas embeds https do Google Maps', () => {
      const valid = 'https://www.google.com/maps/embed?pb=!1m18!1m12';
      expect(sanitizeMapEmbedUrl(valid)).toBe(valid);
      expect(isValidMapEmbedUrl('https://maps.google.com/maps?q=Belem&output=embed')).toBe(true);

      expect(sanitizeMapEmbedUrl('javascript:alert(1)')).toBe('');
      expect(sanitizeMapEmbedUrl('https://evil.com/maps/embed')).toBe('');
      expect(sanitizeMapEmbedUrl('http://www.google.com/maps/embed')).toBe('');
    });
  });

  describe('prototype pollution & composition sanitization', () => {
    it('remove chaves __proto__, constructor e prototype e sanitiza URLs aninhadas', () => {
      const maliciousPayload = JSON.parse(
        '{"__proto__":{"polluted":true},"constructor":{"bad":1},"page":"home","version":1,"widgets":[{"id":"hero","type":"hero-carousel","enabled":true,"order":0,"props":{"linkUrl":"javascript:alert(1)","slides":[{"imageUrl":"data:image/svg+xml;base64,PHN2Zz4=","ctaUrl":"//evil.com/go","prototype":"x"}]}}]}',
      );

      const stripped = stripUnsafeKeys(maliciousPayload);
      expect(Object.prototype.hasOwnProperty.call(stripped, '__proto__')).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(stripped, 'constructor')).toBe(false);

      const sanitized = sanitizeCompositionProps(maliciousPayload);
      const props = sanitized.widgets[0].props as Record<string, unknown>;
      const slide = (props.slides as Array<Record<string, unknown>>)[0];
      expect(props.linkUrl).toBe('#');
      expect(slide.imageUrl).toBe('');
      expect(slide.ctaUrl).toBe('#');
      expect(Object.prototype.hasOwnProperty.call(slide, 'prototype')).toBe(false);
    });
  });

  describe('resolveSafeRedirectUrl', () => {
    it('permite caminhos internos e bloqueia open redirects externos', () => {
      expect(resolveSafeRedirectUrl('/orcamento?step=2')).toBe('/orcamento?step=2');
      expect(resolveSafeRedirectUrl('https://evil.com/phishing')).toBe('/');
      expect(resolveSafeRedirectUrl('//evil.com/phishing')).toBe('/');
      expect(resolveSafeRedirectUrl('javascript:alert(1)')).toBe('/');
      expect(
        resolveSafeRedirectUrl('https://loja.com.br/catalogo', {
          currentOrigin: 'https://loja.com.br',
        }),
      ).toBe('/catalogo');
      expect(
        resolveSafeRedirectUrl('/conta', {
          isAdmin: true,
          adminUrl: 'http://localhost:5174/admin/',
        }),
      ).toBe('http://localhost:5174/admin/');
      expect(
        resolveSafeRedirectUrl('https://evil.com', {
          isAdmin: true,
          adminUrl: 'http://localhost:5174/admin/',
        }),
      ).toBe('http://localhost:5174/admin/');
    });
  });
});
