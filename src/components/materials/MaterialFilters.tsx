import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface MaterialFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  unitFilter?: string;
  onUnitFilterChange?: (value: string) => void;
}

export function MaterialFilters({
  search,
  onSearchChange,
  unitFilter,
  onUnitFilterChange,
}: MaterialFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by name, grade..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Unit Filter */}
      {onUnitFilterChange && (
        <div className="w-full sm:w-[200px]">
          <Label htmlFor="unit-filter" className="sr-only">
            Filter by Unit
          </Label>
          <Select value={unitFilter} onValueChange={onUnitFilterChange}>
            <SelectTrigger id="unit-filter">
              <SelectValue placeholder="All Units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Units</SelectItem>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="liters">Liters</SelectItem>
              <SelectItem value="pieces">Pieces</SelectItem>
              <SelectItem value="meters">Meters</SelectItem>
              <SelectItem value="tons">Tons</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
