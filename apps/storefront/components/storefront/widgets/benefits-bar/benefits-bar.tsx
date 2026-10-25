import { Clock, Package, ShieldCheck, Store, Tag, Truck } from 'lucide-react';
import type { BenefitItem, BenefitsBarProps } from '@/lib/storefront/widget-types';

const iconMap = {
  truck: Truck,
  store: Store,
  tag: Tag,
  shield: ShieldCheck,
  package: Package,
  clock: Clock,
};

export function BenefitsBarWidget({ items }: BenefitsBarProps) {
  if (!items || items.length === 0) return null;

  return (
    <section aria-label="Benefícios Comerciais" className="border-y border-line bg-surface py-5 shadow-xs">
      <div className="cn-container grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
        {items.map((item: BenefitItem) => {
          const Icon = iconMap[item.iconName] ?? ShieldCheck;
          return (
            <div className="flex items-center gap-3" key={item.title}>
              <span className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Icon aria-hidden className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold leading-tight text-ink">{item.title}</p>
                <p className="mt-0.5 text-xs text-muted leading-snug">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
