import { Module } from '@nestjs/common';
import { AdminShellController } from './admin-shell.controller';

/**
 * Apenas o painel administrativo (React/Vite) é servido pela API.
 * A loja pública roda em Next.js como serviço separado — o antigo shell do
 * storefront e o renderer de SEO foram removidos (roadmap D6/R07).
 */
@Module({ controllers: [AdminShellController] })
export class PublicShellModule {}
