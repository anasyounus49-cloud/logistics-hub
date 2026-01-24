import { TripStage } from '@/api/types/common.types';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface TripStageProgressProps {
  currentStage: TripStage;
  isCompleted?: boolean;
  className?: string;
}

const stages: { key: TripStage; label: string }[] = [
  { key: 'ENTRY_GATE', label: 'Entry' },
  { key: 'GROSS_WEIGHT', label: 'Gross' },
  { key: 'UNLOADING', label: 'Unload' },
  { key: 'TARE_WEIGHT', label: 'Tare' },
  { key: 'EXIT_GATE', label: 'Exit' },
];

export function TripStageProgress({ currentStage, isCompleted = false, className }: TripStageProgressProps) {
  const currentIndex = stages.findIndex((s) => s.key === currentStage);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {stages.map((stage, index) => {
        // If trip is completed and we're at EXIT_GATE, mark it as completed
        const isCompletedStage = index < currentIndex || (isCompleted && stage.key === 'EXIT_GATE' && index === currentIndex);
        const isCurrent = index === currentIndex && !isCompletedStage;
        const isPending = index > currentIndex;

        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center transition-all',
                  isCompletedStage && 'bg-success text-success-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                  isPending && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompletedStage ? (
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
                  (index < currentIndex || (isCompleted && index === currentIndex)) ? 'bg-success' : 'bg-muted'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}