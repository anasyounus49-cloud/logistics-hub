import React from 'react';
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
import { MaterialOut, MaterialCreate } from '@/api/types/material.types';

const materialSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  grade: z.string().max(50).optional().nullable(),
  unit: z.string().min(1, 'Unit is required').max(20, 'Unit is too long'),
});

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: MaterialOut | null;
  onSubmit: (data: MaterialCreate) => void;
  isLoading?: boolean;
}

export function MaterialFormDialog({
  open,
  onOpenChange,
  material,
  onSubmit,
  isLoading,
}: MaterialFormDialogProps) {
  const form = useForm<MaterialCreate>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: material?.name || '',
      grade: material?.grade || '',
      unit: material?.unit || '',
    },
  });

  // Reset form when material changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: material?.name || '',
        grade: material?.grade || '',
        unit: material?.unit || '',
      });
    }
  }, [material, open, form]);

  const handleSubmit = (data: MaterialCreate) => {
    onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{material ? 'Edit Material' : 'Add Material'}</DialogTitle>
          <DialogDescription>
            {material
              ? 'Update the material information below.'
              : 'Enter the details for the new material.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Steel, Concrete, Sand" {...field} />
                  </FormControl>
                  <FormDescription>The name of the material</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grade Field */}
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., A36, Grade 60"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional grade or quality specification
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit Field */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., kg, liters, pieces" {...field} />
                  </FormControl>
                  <FormDescription>Unit of measurement</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : material ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
