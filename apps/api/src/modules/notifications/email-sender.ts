import { SmtpSecurity } from '@prisma/client';
import { Inject, Injectable } from '@nestjs/common';
import { RuntimeSmtpConfig } from '../settings/settings.types';
import { SettingsService } from '../settings/settings.service';

export const NODEMAILER_CREATE_TRANSPORT = 'NODEMAILER_CREATE_TRANSPORT';

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type Transport = { sendMail(message: Record<string, unknown>): Promise<unknown> };
export type TransportFactory = (options: Record<string, unknown>) => Transport;
type SmtpSettingsSource = Pick<SettingsService, 'getRuntimeSmtpConfig'>;

function transportOptions(config: RuntimeSmtpConfig): Record<string, unknown> {
  return {
    host: config.host,
    port: config.port,
    secure: config.security === SmtpSecurity.SSL_TLS,
    ...(config.security === SmtpSecurity.STARTTLS ? { requireTLS: true } : {}),
    ...(config.username ? { auth: { user: config.username, pass: config.password ?? '' } } : {}),
  };
}

@Injectable()
export class EmailSender {
  constructor(
    @Inject(SettingsService) private readonly settings: SmtpSettingsSource,
    @Inject(NODEMAILER_CREATE_TRANSPORT) private readonly createTransport: TransportFactory,
  ) {}

  async send(message: EmailMessage): Promise<void> {
    const config = await this.settings.getRuntimeSmtpConfig();
    if (!config) throw new Error('SMTP_NOT_CONFIGURED');
    const transport = this.createTransport(transportOptions(config));
    try {
      await transport.sendMail({
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        from: config.fromName ? { name: config.fromName, address: config.fromEmail } : config.fromEmail,
        ...(config.replyTo ? { replyTo: config.replyTo } : {}),
      });
    } catch {
      throw new Error('SMTP_SEND_FAILED');
    }
  }
}
