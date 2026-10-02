import { describe, expect, it, vi } from 'vitest';
import { ApiExceptionFilter } from './api-exception.filter';

describe('ApiExceptionFilter', () => {
  it('returns an actionable safe response for SMTP authentication failures', () => {
    const json = vi.fn();
    const response = { status: vi.fn().mockReturnValue({ json }), setHeader: vi.fn() };
    const host = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
        getResponse: () => response,
      }),
    } as never;

    new ApiExceptionFilter().catch(new Error('SMTP_AUTH_FAILED'), host);

    expect(response.status).toHaveBeenCalledWith(502);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'SMTP_AUTH_FAILED',
      message: 'O usuário ou a senha do SMTP foram rejeitados pelo servidor.',
      requestId: expect.stringMatching(/^req_/),
    }));
  });
});
