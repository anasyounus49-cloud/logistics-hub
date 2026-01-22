import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserRole, Department } from '@/api/types/common.types';

interface StaffFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: UserRole | 'all';
  onRoleChange: (value: UserRole | 'all') => void;
  department: Department | 'all';
  onDepartmentChange: (value: Department | 'all') => void;
  onClearFilters: () => void;
}

const roles: { value: UserRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All Roles' },
  { value: 'super admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'security', label: 'Security' },
  { value: 'operator', label: 'Operator' },
  { value: 'user', label: 'User' },
];

const departments: { value: Department | 'all'; label: string }[] = [
  { value: 'all', label: 'All Departments' },
  { value: 'HR', label: 'HR' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'finance', label: 'Finance' },
];

export function StaffFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  department,
  onDepartmentChange,
  onClearFilters,
}: StaffFiltersProps) {
  const hasActiveFilters = search || role !== 'all' || department !== 'all';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, username..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={role} onValueChange={(v) => onRoleChange(v as UserRole | 'all')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={department} onValueChange={(v) => onDepartmentChange(v as Department | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
