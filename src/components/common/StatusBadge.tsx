import { cn } from '@/lib/utils';

export type StatusType = 'active' | 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'expired' | 'closed';

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  completed: 'bg-info/10 text-info border-info/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
  expired: 'bg-muted text-muted-foreground border-muted-foreground/20',
  closed: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const styles = statusStyles[normalizedStatus] || statusStyles.pending;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles,
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
    </span>
  );
}
