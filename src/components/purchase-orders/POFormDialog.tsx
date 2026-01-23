import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
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
import { Plus, Trash2 } from 'lucide-react';
import { MaterialOut } from '@/api/types/material.types';

const poSchema = z.object({
  po_reference_number: z.string().min(1, 'PO reference is required').max(50),
  seller_name: z.string().min(2, 'Seller name is required').max(100),
  seller_mobile: z.string().min(10, 'Valid mobile number required').max(15).regex(/^[0-9+\-\s]+$/, 'Invalid mobile format'),
  seller_aadhaar: z.string().length(12, 'Aadhaar must be 12 digits').regex(/^\d+$/, 'Aadhaar must be numeric'),
  validity_start_date: z.string().min(1, 'Start date is required'),
  validity_end_date: z.string().min(1, 'End date is required'),
  units: z.string().min(1, 'Units required'),
  materials: z.array(z.object({
    material_id: z.number().min(1, 'Select a material'),
    needed_qty: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one material is required'),
});

type POFormData = z.infer<typeof poSchema>;

interface POFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: POFormData) => void;
  isSubmitting: boolean;
  materials: MaterialOut[];
}

export function POFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  materials,
}: POFormDialogProps) {
  const form = useForm<POFormData>({
    resolver: zodResolver(poSchema),
    defaultValues: {
      po_reference_number: '',
      seller_name: '',
      seller_mobile: '',
      seller_aadhaar: '',
      validity_start_date: '',
      validity_end_date: '',
      units: 'MT',
      materials: [{ material_id: 0, needed_qty: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'materials',
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const handleSubmit = (data: POFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Enter purchase order details and assign materials
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* PO Reference */}
            <FormField
              control={form.control}
              name="po_reference_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PO Reference Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PO-2024-0001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seller Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Seller Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="seller_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seller Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter seller name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seller_mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="seller_aadhaar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="12-digit Aadhaar number" maxLength={12} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Validity Period */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Validity Period</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="validity_start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="validity_end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Units */}
            <FormField
              control={form.control}
              name="units"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Units *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select units" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MT">Metric Tons (MT)</SelectItem>
                      <SelectItem value="KG">Kilograms (KG)</SelectItem>
                      <SelectItem value="QTL">Quintals (QTL)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Materials */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-muted-foreground">Materials *</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ material_id: 0, needed_qty: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Material
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 items-end p-4 rounded-lg border bg-muted/30">
                  <FormField
                    control={form.control}
                    name={`materials.${index}.material_id`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Material</FormLabel>
                        <Select 
                          onValueChange={(v) => field.onChange(parseInt(v))} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {materials.map((mat) => (
                              <SelectItem key={mat.id} value={mat.id.toString()}>
                                {mat.name} {mat.grade && `(${mat.grade})`}
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
                    name={`materials.${index}.needed_qty`}
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Purchase Order'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
