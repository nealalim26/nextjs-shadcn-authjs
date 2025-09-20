import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ChevronDown, Trash2, Download, Edit, Archive, X } from 'lucide-react';
import { toast } from 'sonner';

export interface BulkOperationsProps {
  selectedItems: string[];
  onClearSelection: () => void;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkExport: (ids: string[]) => Promise<void>;
  onBulkEdit?: (ids: string[]) => void;
  onBulkArchive?: (ids: string[]) => Promise<void>;
}

export function BulkOperations({ selectedItems, onClearSelection, onBulkDelete, onBulkExport, onBulkEdit, onBulkArchive }: BulkOperationsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  const handleBulkDelete = async () => {
    setIsLoading(true);
    try {
      await onBulkDelete(selectedItems);
      setDeleteDialogOpen(false);
      onClearSelection();
      toast.success(`Successfully deleted ${selectedItems.length} items`);
    } catch (error) {
      toast.error('Failed to delete selected items');
      console.error('Bulk delete error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkExport = async () => {
    setIsLoading(true);
    try {
      await onBulkExport(selectedItems);
      toast.success(`Successfully exported ${selectedItems.length} items`);
    } catch (error) {
      toast.error('Failed to export selected items');
      console.error('Bulk export error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkArchive = async () => {
    if (!onBulkArchive) return;

    setIsLoading(true);
    try {
      await onBulkArchive(selectedItems);
      onClearSelection();
      toast.success(`Successfully archived ${selectedItems.length} items`);
    } catch (error) {
      toast.error('Failed to archive selected items');
      console.error('Bulk archive error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedItems.length}
          </Badge>
          <span className="text-sm text-blue-800">{selectedItems.length === 1 ? 'item' : 'items'} selected</span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={onClearSelection} className="text-gray-600">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={isLoading}>
                Actions
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleBulkExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </DropdownMenuItem>

              {onBulkEdit && (
                <DropdownMenuItem onClick={() => onBulkEdit(selectedItems)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Bulk Edit
                </DropdownMenuItem>
              )}

              {onBulkArchive && (
                <DropdownMenuItem onClick={handleBulkArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Selected
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600 focus:text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Hook for managing bulk selection state
export function useBulkSelection<T extends { uid: string }>(data: T[] = []) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedItems(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedItems(prev => (prev.length === data.length ? [] : data.map(item => item.uid)));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const isSelected = (id: string) => selectedItems.includes(id);
  const isAllSelected = data.length > 0 && selectedItems.length === data.length;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  return {
    selectedItems,
    toggleItem,
    toggleAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectedCount: selectedItems.length,
  };
}
