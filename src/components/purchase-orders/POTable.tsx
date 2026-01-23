import { useState } from 'react';
import { POOut } from '@/api/types/purchaseOrder.types';
import { StatusBadge } from '@/components/common/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Eye, Trash2, Package } from 'lucide-react';
import { format } from 'date-fns';

interface POTableProps {
  purchaseOrders: POOut[];
  isLoading: boolean;
  onView: (po: POOut) => void;
  onDelete: (id: number) => void;
}

export function POTable({ purchaseOrders, isLoading, onView, onDelete }: POTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const getStatusVariant = (status: string): 'active' | 'pending' | 'approved' | 'rejected' | 'completed' => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'active';
      case 'expired':
        return 'rejected';
      case 'closed':
        return 'completed';
      default:
        return 'pending';
    }
  };

  const handleConfirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (purchaseOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No purchase orders found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>PO Reference</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead className="hidden md:table-cell">Validity</TableHead>
              <TableHead className="hidden lg:table-cell">Materials</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders.map((po) => (
              <TableRow key={po.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <p className="font-medium">{po.po_reference_number}</p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {po.seller_name}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div>
                    <p className="font-medium">{po.seller_name}</p>
                    {po.seller_mobile && (
                      <p className="text-xs text-muted-foreground">{po.seller_mobile}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {po.validity_start_date && po.validity_end_date ? (
                    <div className="text-sm">
                      <p>{format(new Date(po.validity_start_date), 'dd MMM yyyy')}</p>
                      <p className="text-muted-foreground">
                        to {format(new Date(po.validity_end_date), 'dd MMM yyyy')}
                      </p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {po.materials.slice(0, 2).map((mat, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted"
                      >
                        {mat.received_qty || 0}/{mat.needed_qty}
                      </span>
                    ))}
                    {po.materials.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{po.materials.length - 2} more
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={getStatusVariant(po.status)} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(po)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(po.id)}
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

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the purchase order
              and all associated data.
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
