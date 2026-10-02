import { SmtpSecurity } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import { EmailSender } from './email-sender';

describe('EmailSender', () => {
  it('builds a TLS SMTP transport from runtime settings without exposing credentials', async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'message-1' });
    const createTransport = vi.fn().mockReturnValue({ sendMail });
    const sender = new EmailSender({ getRuntimeSmtpConfig: vi.fn().mockResolvedValue({
      host: 'smtp.example.com',
      port: 587,
      username: 'mailer@example.com',
      password: 'smtp-secret',
      security: SmtpSecurity.STARTTLS,
      fromEmail: 'loja@example.com',
      fromName: 'Loja JE',
      replyTo: 'reply@example.com',
      enabled: true,
    }) } as never, createTransport);

    await sender.send({ to: 'cliente@example.com', subject: 'Pedido', html: '<p>Olá</p>', text: 'Olá' });

    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: 'smtp.example.com', port: 587, secure: false, requireTLS: true }));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ to: 'cliente@example.com', from: { name: 'Loja JE', address: 'loja@example.com' }, replyTo: 'reply@example.com' }));
    expect(JSON.stringify(sendMail.mock.calls)).not.toContain('smtp-secret');
  });

  it('maps transport failures to a safe error code', async () => {
    const sender = new EmailSender({ getRuntimeSmtpConfig: vi.fn().mockResolvedValue({
      host: 'smtp.example.com', port: 465, username: 'mailer', password: 'smtp-secret', security: SmtpSecurity.SSL_TLS, fromEmail: 'loja@example.com', fromName: 'Loja', replyTo: null, enabled: true,
    }) } as never, vi.fn().mockReturnValue({ sendMail: vi.fn().mockRejectedValue(new Error('password=smtp-secret')) }));

    await expect(sender.send({ to: 'cliente@example.com', subject: 'Pedido', html: '', text: '' })).rejects.toThrow('SMTP_SEND_FAILED');
  });

  it('classifies SMTP authentication failures without exposing transport details', async () => {
    const sender = new EmailSender({ getRuntimeSmtpConfig: vi.fn().mockResolvedValue({
      host: 'smtp.example.com', port: 465, username: 'mailer', password: 'smtp-secret', security: SmtpSecurity.SSL_TLS, fromEmail: 'loja@example.com', fromName: 'Loja', replyTo: null, enabled: true,
    }) } as never, vi.fn().mockReturnValue({ sendMail: vi.fn().mockRejectedValue(Object.assign(new Error('Invalid login: 535 5.7.8'), { code: 'EAUTH', responseCode: 535 })) }));

    await expect(sender.send({ to: 'cliente@example.com', subject: 'Teste', html: '', text: '' })).rejects.toThrow('SMTP_AUTH_FAILED');
  });
});
