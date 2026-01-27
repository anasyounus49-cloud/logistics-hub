import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface UnloadingFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  qualityFilter: string;
  onQualityChange: (value: string) => void;
  materialFilter: string;
  onMaterialChange: (value: string) => void;
  materials: string[];
  onClearFilters: () => void;
}

export function UnloadingFilters({
  searchTerm,
  onSearchChange,
  qualityFilter,
  onQualityChange,
  materialFilter,
  onMaterialChange,
  materials,
  onClearFilters,
}: UnloadingFiltersProps) {
  const hasActiveFilters = searchTerm || qualityFilter !== 'all' || materialFilter !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by trip ID, material..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <Select value={qualityFilter} onValueChange={onQualityChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Quality" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Quality</SelectItem>
          <SelectItem value="excellent">Excellent (0%)</SelectItem>
          <SelectItem value="good">Good (&lt;5%)</SelectItem>
          <SelectItem value="fair">Fair (5-15%)</SelectItem>
          <SelectItem value="poor">Poor (&gt;15%)</SelectItem>
        </SelectContent>
      </Select>

      <Select value={materialFilter} onValueChange={onMaterialChange}>
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Material" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Materials</SelectItem>
          {materials.map((material) => (
            <SelectItem key={material} value={material}>
              {material}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="icon" onClick={onClearFilters} title="Clear filters">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
