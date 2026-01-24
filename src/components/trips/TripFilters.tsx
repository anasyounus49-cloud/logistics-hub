import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { TripStatus, TripStage } from '@/api/types/common.types';

interface TripFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  stageFilter: TripStage | 'all';
  onStageFilterChange: (value: TripStage | 'all') => void;
}

const stages: { value: TripStage | 'all'; label: string }[] = [
  { value: 'all', label: 'All Stages' },
  { value: 'ENTRY_GATE', label: 'Entry Gate' },
  { value: 'GROSS_WEIGHT', label: 'Gross Weight' },
  { value: 'UNLOADING', label: 'Unloading' },
  { value: 'TARE_WEIGHT', label: 'Tare Weight' },
  { value: 'EXIT_GATE', label: 'Exit Gate' },
];

export function TripFilters({
  search,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
}: TripFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by trip ID, vehicle, or driver..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={stageFilter} onValueChange={(v) => onStageFilterChange(v as TripStage | 'all')}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by stage" />
        </SelectTrigger>
        <SelectContent>
          {stages.map((stage) => (
            <SelectItem key={stage.value} value={stage.value}>
              {stage.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
