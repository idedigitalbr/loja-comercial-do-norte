import { Injectable } from '@nestjs/common';
import { PricingContext, PromotionEngine } from '../promotions/promotion-engine';

@Injectable()
export class PricingService {
  constructor(private readonly engine = new PromotionEngine()) {}

  quote(context: PricingContext) {
    return this.engine.quote(context);
  }
}
