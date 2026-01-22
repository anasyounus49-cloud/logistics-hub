import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Staff, StaffCreate, StaffUpdate } from '@/api/types/auth.types';
import { UserRole, Department } from '@/api/types/common.types';
import { Loader2 } from 'lucide-react';

const createStaffSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50),
  full_name: z.string().trim().max(100).optional(),
  role: z.enum(['super admin', 'admin', 'security', 'operator', 'user'] as const),
  department: z.enum(['HR', 'purchase', 'finance'] as const),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  is_superuser: z.boolean().default(false),
});

const updateStaffSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255).optional(),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50).optional(),
  full_name: z.string().trim().max(100).optional().nullable(),
  role: z.enum(['super admin', 'admin', 'security', 'operator', 'user'] as const).optional(),
  department: z.enum(['HR', 'purchase', 'finance'] as const).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  is_active: z.boolean().optional(),
  is_superuser: z.boolean().optional(),
});

type CreateFormData = z.infer<typeof createStaffSchema>;
type UpdateFormData = z.infer<typeof updateStaffSchema>;

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: Staff | null;
  onSubmit: (data: StaffCreate | StaffUpdate) => void;
  isLoading: boolean;
}

const roles: { value: UserRole; label: string }[] = [
  { value: 'super admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'security', label: 'Security' },
  { value: 'operator', label: 'Operator' },
  { value: 'user', label: 'User' },
];

const departments: { value: Department; label: string }[] = [
  { value: 'HR', label: 'HR' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'finance', label: 'Finance' },
];

export function StaffFormDialog({
  open,
  onOpenChange,
  staff,
  onSubmit,
  isLoading,
}: StaffFormDialogProps) {
  const isEditing = !!staff;

  const form = useForm<CreateFormData | UpdateFormData>({
    resolver: zodResolver(isEditing ? updateStaffSchema : createStaffSchema),
    defaultValues: {
      email: '',
      username: '',
      full_name: '',
      role: 'user',
      department: 'purchase',
      password: '',
      is_superuser: false,
      ...(isEditing && { is_active: true }),
    },
  });

  useEffect(() => {
    if (staff) {
      form.reset({
        email: staff.email,
        username: staff.username,
        full_name: staff.full_name || '',
        role: staff.role,
        department: staff.department,
        password: '',
        is_active: staff.is_active,
        is_superuser: staff.is_superuser,
      });
    } else {
      form.reset({
        email: '',
        username: '',
        full_name: '',
        role: 'user',
        department: 'purchase',
        password: '',
        is_superuser: false,
      });
    }
  }, [staff, form]);

  const handleSubmit = (data: CreateFormData | UpdateFormData) => {
    if (isEditing) {
      // Only send changed fields for update
      const updateData: StaffUpdate = {};
      if (data.email && data.email !== staff?.email) updateData.email = data.email;
      if (data.username && data.username !== staff?.username) updateData.username = data.username;
      if (data.full_name !== staff?.full_name) updateData.full_name = data.full_name || null;
      if (data.role && data.role !== staff?.role) updateData.role = data.role;
      if (data.department && data.department !== staff?.department) updateData.department = data.department;
      if (data.password) updateData.password = data.password;
      if ('is_active' in data && data.is_active !== staff?.is_active) updateData.is_active = data.is_active;
      if (data.is_superuser !== staff?.is_superuser) updateData.is_superuser = data.is_superuser;
      onSubmit(updateData);
    } else {
      onSubmit(data as StaffCreate);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Staff Member' : 'Add New Staff'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update staff member details. Leave password blank to keep unchanged.'
              : 'Create a new staff account with role and department assignment.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>{isEditing ? 'New Password (optional)' : 'Password'}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={isEditing ? 'Leave blank to keep unchanged' : 'Enter password'}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-2 space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="is_superuser"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Super User</FormLabel>
                        <FormDescription>
                          Grant elevated system privileges
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {isEditing && (
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>
                            Inactive users cannot log in
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create Staff'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
