import { Module } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { DatabaseModule } from '../database/database.module';
import { SecurityModule } from '../../common/security/security.module';
import { SettingsService } from '../settings/settings.service';
import { EmailRenderer } from './email-renderer';
import { EmailSender, NODEMAILER_CREATE_TRANSPORT, type TransportFactory } from './email-sender';
import { NotificationsService } from './notifications.service';

const nodemailerFactory: TransportFactory = (options) => nodemailer.createTransport(options as never) as never;

@Module({
  imports: [DatabaseModule, SecurityModule],
  providers: [
    EmailRenderer,
    EmailSender,
    NotificationsService,
    SettingsService,
    { provide: NODEMAILER_CREATE_TRANSPORT, useValue: nodemailerFactory },
  ],
  exports: [NotificationsService, EmailSender],
})
export class NotificationsModule {}
