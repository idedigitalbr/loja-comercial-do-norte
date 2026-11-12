import { Check, ChevronRight } from 'lucide-react';
import { cn } from '@commerce/ui/web';

export type QuoteFlowStep = 1 | 2 | 3;

type QuoteFlowStepperProps = {
  currentStep: QuoteFlowStep;
  itemsCount?: number;
  className?: string;
};

type StepConfig = {
  step: QuoteFlowStep;
  title: string;
  subtitle: string;
  doneSubtitle: string;
  activeBadge: string;
};

/**
 * Barra de progresso horizontal do fluxo de cotação (Itens -> Loja & Contato -> Proposta Comercial).
 * Garante linha única em desktop/tablet com conectores direcionais e leitura vertical limpa no mobile.
 */
export function QuoteFlowStepper({ currentStep, itemsCount, className }: QuoteFlowStepperProps) {
  const itemsTitle = itemsCount && itemsCount > 0 ? `Itens (${itemsCount})` : 'Itens';

  const steps: StepConfig[] = [
    {
      step: 1,
      title: itemsTitle,
      subtitle: 'Selecione os produtos',
      doneSubtitle: currentStep === 3 ? 'Lista enviada' : 'Lista selecionada',
      activeBadge: 'Atual',
    },
    {
      step: 2,
      title: 'Loja & Contato',
      subtitle: 'Unidade e seus dados',
      doneSubtitle: 'Dados confirmados',
      activeBadge: 'Etapa atual',
    },
    {
      step: 3,
      title: 'Proposta Comercial',
      subtitle: 'Retorno no WhatsApp',
      doneSubtitle: 'Solicitação enviada',
      activeBadge: 'Em análise',
    },
  ];

  return (
    <ol
      aria-label="Etapas da cotação"
      className={cn('flex flex-col md:flex-row md:items-center', className)}
    >
      {steps.map((item, idx) => {
        const isCompleted = item.step < currentStep;
        const isCurrent = item.step === currentStep;
        const isFinalConfirmation = currentStep === 3 && isCurrent;
        const isLast = idx === steps.length - 1;
        const nextStepIsCurrent = item.step + 1 === currentStep;

        return (
          <li
            aria-current={isCurrent ? 'step' : undefined}
            className={cn(
              'flex flex-col',
              isLast ? 'md:shrink-0 md:flex-row md:items-center' : 'md:flex-1 md:flex-row md:items-center',
            )}
            key={item.step}
          >
            <div
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-all',
                isCompleted && 'border-emerald-200/90 bg-emerald-50/80',
                isCurrent &&
                  !isFinalConfirmation &&
                  'border-[#004CB1]/40 bg-white shadow-[0_4px_14px_rgba(0,76,177,0.10)] ring-2 ring-[#004CB1]/10',
                isFinalConfirmation &&
                  'border-emerald-300 bg-white shadow-[0_4px_14px_rgba(16,185,129,0.12)] ring-2 ring-emerald-500/15',
                !isCompleted && !isCurrent && 'border-slate-200/90 bg-white/75',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold',
                  isCompleted && 'bg-emerald-600 text-white shadow-2xs',
                  isCurrent && !isFinalConfirmation && 'bg-[#004CB1] text-white ring-4 ring-blue-50',
                  isFinalConfirmation && 'bg-emerald-600 text-white ring-4 ring-emerald-50',
                  !isCompleted && !isCurrent && 'border border-slate-300 bg-slate-100 text-slate-500',
                )}
              >
                {isCompleted || isFinalConfirmation ? (
                  <Check className="size-4 stroke-[2.75]" />
                ) : (
                  item.step
                )}
              </span>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span
                    className={cn(
                      'text-xs tracking-tight sm:text-[13px]',
                      isCompleted && 'font-bold text-emerald-900',
                      isCurrent && !isFinalConfirmation && 'font-extrabold text-[#004CB1]',
                      isFinalConfirmation && 'font-extrabold text-emerald-800',
                      !isCompleted && !isCurrent && 'font-bold text-slate-600',
                    )}
                  >
                    {item.title}
                  </span>

                  {isCurrent && (
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide md:hidden lg:inline-flex',
                        isFinalConfirmation
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-[#004CB1]',
                      )}
                    >
                      {item.activeBadge}
                    </span>
                  )}
                </div>

                <p
                  className={cn(
                    'whitespace-nowrap text-[11px] leading-tight',
                    isCompleted && 'font-medium text-emerald-700/90',
                    isCurrent && !isFinalConfirmation && 'font-medium text-slate-500',
                    isFinalConfirmation && 'font-medium text-emerald-700',
                    !isCompleted && !isCurrent && 'text-slate-400',
                  )}
                >
                  {isCompleted ? item.doneSubtitle : item.subtitle}
                </p>
              </div>
            </div>

            {!isLast && (
              <>
                {/* Conector horizontal direcional (tablet e desktop) */}
                <div aria-hidden="true" className="hidden flex-1 items-center px-2 md:flex">
                  <span
                    className={cn(
                      'block flex-1',
                      isCompleted
                        ? nextStepIsCurrent && currentStep !== 3
                          ? 'h-[3px] rounded-full bg-gradient-to-r from-emerald-500 to-[#004CB1]'
                          : 'h-[3px] rounded-full bg-emerald-500'
                        : 'h-0 border-t-2 border-dashed border-slate-300',
                    )}
                  />
                  <ChevronRight
                    className={cn(
                      '-ml-1.5 size-4 shrink-0',
                      isCompleted
                        ? nextStepIsCurrent && currentStep !== 3
                          ? 'text-[#004CB1]'
                          : 'text-emerald-600'
                        : 'text-slate-400',
                    )}
                  />
                </div>

                {/* Conector vertical (mobile) */}
                <div aria-hidden="true" className="flex items-center py-1 pl-6 md:hidden">
                  <span
                    className={cn(
                      'block h-3.5',
                      isCompleted
                        ? 'w-0.5 rounded-full bg-emerald-400'
                        : 'border-l-2 border-dashed border-slate-300',
                    )}
                  />
                </div>
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}
