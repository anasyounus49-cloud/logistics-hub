// src/components/vehicles/VehicleFilters.tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApprovalStatus } from '@/api/types/common.types';

interface VehicleFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: ApprovalStatus | 'all';
  onStatusFilterChange: (value: ApprovalStatus | 'all') => void;
  vehicleTypeFilter: string;
  onVehicleTypeFilterChange: (value: string) => void;
}

export const VehicleFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  vehicleTypeFilter,
  onVehicleTypeFilterChange,
}: VehicleFiltersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Search by Registration Number */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Registration</Label>
        <Input
          id="search"
          placeholder="Search by registration number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter by Status */}
      <div className="space-y-2">
        <Label htmlFor="status-filter">Approval Status</Label>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter by Vehicle Type */}
      <div className="space-y-2">
        <Label htmlFor="type-filter">Vehicle Type</Label>
        <Select value={vehicleTypeFilter} onValueChange={onVehicleTypeFilterChange}>
          <SelectTrigger id="type-filter">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="truck">Truck</SelectItem>
            <SelectItem value="trailer">Trailer</SelectItem>
            <SelectItem value="tanker">Tanker</SelectItem>
            <SelectItem value="van">Van</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};