import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { POStatus } from '@/api/types/common.types';

interface POFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;

  statusFilter: POStatus | 'all';
  onStatusChange: (value: POStatus | 'all') => void;

  /**
   * Called when the search input matches a PO reference ID.
   * Passes the reference string, or null if not a reference.
   */
  onReferenceDetected?: (reference: string | null) => void;
}

/**
 * Adjust this regex to match your real PO reference format.
 * Examples matched:
 *  - PO123
 *  - PO-12345
 *  - po 9876
 */
const PO_REFERENCE_REGEX = /^PO[-_\s]?\d+$/i;

const STATUS_OPTIONS: { value: POStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Closed', label: 'Closed' },
];

export function POFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onReferenceDetected,
}: POFiltersProps) {
  const isReferenceId = (value: string) =>
    PO_REFERENCE_REGEX.test(value.trim());

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

        <Input
          placeholder="Search by PO reference, seller name..."
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;

            onSearchChange(value);

            if (onReferenceDetected) {
              onReferenceDetected(
                isReferenceId(value) ? value.trim() : null
              );
            }
          }}
          className="pl-10"
        />

        {isReferenceId(searchQuery) && (
          <p className="mt-1 text-xs text-muted-foreground">
            Reference detected — fetching directly ✨
          </p>
        )}
      </div>

      {/* Status filter */}
      <Select
        value={statusFilter}
        onValueChange={(v) =>
          onStatusChange(v as POStatus | 'all')
        }
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
