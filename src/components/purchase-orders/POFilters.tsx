import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { POStatus } from '@/api/types/common.types';

interface POFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: POStatus | 'all';
  onStatusChange: (value: POStatus | 'all') => void;
}

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
}: POFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by PO reference, seller name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as POStatus | 'all')}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
