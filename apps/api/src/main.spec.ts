import { vi, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';

const { helmetSpy } = vi.hoisted(() => ({ helmetSpy: vi.fn(() => vi.fn()) }));
vi.mock('helmet', () => ({ default: helmetSpy }));

import { configureApp } from './main';

describe('API security headers', () => {
  it('allows the original salon media and the YouTube embeds used by the storefront', () => {
    const app = {
      getHttpAdapter: () => ({ getInstance: () => ({ use: vi.fn() }) }),
      setGlobalPrefix: vi.fn(),
      use: vi.fn(),
      useGlobalPipes: vi.fn(),
      useGlobalInterceptors: vi.fn(),
      useGlobalFilters: vi.fn(),
    } as unknown as INestApplication;

    configureApp(app);

    expect(helmetSpy).toHaveBeenCalledWith(expect.objectContaining({
      contentSecurityPolicy: expect.objectContaining({
        directives: expect.objectContaining({
          imgSrc: expect.arrayContaining(["'self'", 'data:', 'https://jonaselivaldohair.com.br']),
          frameSrc: expect.arrayContaining(["'self'", 'https://www.youtube.com', 'https://www.youtube-nocookie.com']),
        }),
      }),
    }));
  });
});
