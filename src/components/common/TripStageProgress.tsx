import { TripStage } from '@/api/types/common.types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';

interface TripStageProgressProps {
  currentStage: TripStage;
  className?: string;
}

const stages: { key: TripStage; label: string }[] = [
  { key: 'ENTRY_GATE', label: 'Entry' },
  { key: 'GROSS_WEIGHT', label: 'Gross' },
  { key: 'UNLOADING', label: 'Unload' },
  { key: 'TARE_WEIGHT', label: 'Tare' },
  { key: 'EXIT_GATE', label: 'Exit' },
];

export function TripStageProgress({ currentStage, className }: TripStageProgressProps) {
  const currentIndex = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center transition-all',
                  isCompleted && 'bg-success text-success-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  isPending && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {stage.label}
              </span>
            </div>
            {index < stages.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-6 mx-1 mt-[-16px]',
                  index < currentIndex ? 'bg-success' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
