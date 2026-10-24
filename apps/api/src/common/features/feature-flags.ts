import { CanActivate, ExecutionContext, Inject, Injectable, NotFoundException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Feature flags de escopo comercial (roadmap E1).
 *
 * A fase 1 é catálogo + cotação: checkout, pagamentos e treinamentos ficam
 * isolados e inacessíveis por padrão. Nada é apagado: módulos, tabelas e testes
 * continuam no repositório e podem ser reativados por configuração.
 */
export const FEATURE_FLAGS = {
  CHECKOUT: 'FEATURE_CHECKOUT',
  TRAININGS: 'FEATURE_TRAININGS',
  PAYMENTS: 'FEATURE_PAYMENTS',
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

const FEATURE_KEY = 'required_feature';

export const RequireFeature = (flag: FeatureFlag) => SetMetadata(FEATURE_KEY, flag);

/** Desligado por padrão: só habilita com a variável exatamente `true`. */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return process.env[FEATURE_FLAGS[flag]]?.trim().toLowerCase() === 'true';
}

export function featureFlagsSnapshot(): { checkout: boolean; payments: boolean; trainings: boolean } {
  return {
    checkout: isFeatureEnabled('CHECKOUT'),
    payments: isFeatureEnabled('PAYMENTS'),
    trainings: isFeatureEnabled('TRAININGS'),
  };
}

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const flag = this.reflector.getAllAndOverride<FeatureFlag>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!flag) return true;
    if (isFeatureEnabled(flag)) return true;
    // 404 evita revelar a existência de um recurso desligado.
    throw new NotFoundException({
      code: 'FEATURE_NOT_AVAILABLE',
      message: 'Recurso não disponível nesta fase do projeto.',
    });
  }
}
