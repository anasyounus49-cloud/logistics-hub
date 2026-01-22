import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, Shield, ShieldCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Staff } from '@/api/types/auth.types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface StaffTableProps {
  staff: Staff[];
  isLoading: boolean;
  onEdit: (staff: Staff) => void;
  onDelete: (id: number) => void;
}

const roleColors: Record<string, string> = {
  'super admin': 'bg-primary/10 text-primary border-primary/20',
  'admin': 'bg-info/10 text-info border-info/20',
  'security': 'bg-warning/10 text-warning border-warning/20',
  'operator': 'bg-success/10 text-success border-success/20',
  'user': 'bg-muted text-muted-foreground border-muted-foreground/20',
};

const departmentColors: Record<string, string> = {
  'HR': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'purchase': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'finance': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

function getInitials(name: string | null, username: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  return username.slice(0, 2).toUpperCase();
}

export function StaffTable({ staff, isLoading, onEdit, onDelete }: StaffTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const handleDeleteClick = (staffMember: Staff) => {
    setStaffToDelete(staffMember);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (staffToDelete) {
      onDelete(staffToDelete.id);
    }
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
          <p className="mt-2 text-muted-foreground">Loading staff...</p>
        </div>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No Staff Found</h3>
          <p className="mt-2 text-muted-foreground">
            No staff members match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[300px]">Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(member.full_name, member.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {member.full_name || member.username}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn('gap-1', roleColors[member.role])}
                  >
                    {member.is_superuser && <ShieldCheck className="h-3 w-3" />}
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={departmentColors[member.department]}>
                    {member.department}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={member.is_active ? 'default' : 'secondary'}
                    className={
                      member.is_active
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                    }
                  >
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(member.created_at), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(member)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(member)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium text-foreground">
                {staffToDelete?.full_name || staffToDelete?.username}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
