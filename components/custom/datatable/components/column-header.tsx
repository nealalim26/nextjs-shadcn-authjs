'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { EyeOff, Funnel, ListFilter, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { Column } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const DataTableColumnHeader = <TData, TValue>({ title, column, className }: DataTableColumnHeaderProps<TData, TValue>) => {
  const [filterValue, setFilterValue] = useState<string>('');

  // Handle filter value change
  const handleFilterChange = (value: string) => {
    setFilterValue(value);
    if (value === '') {
      // Clear filter when input is empty
      column.setFilterValue('');
    }
  };

  // Apply filter when user presses Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      column.setFilterValue(filterValue);
      console.log('Filter applied:', filterValue, 'Faceted values:', column.getFacetedUniqueValues());
    }
  };

  // Check if column is filterable
  const canFilter = column.getCanFilter();

  // Check if filter is active
  const hasFilter = Boolean(column.getFilterValue());

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 data-[state=open]:bg-accent">
            <div className="text-xs font-medium">{title}</div>
            {/* <Funnel className="ml-2 h-4 w-4" /> */}
            {column.getIsSorted() === 'desc' ? (
              <ArrowDown className="ml-2 h-2 w-2" />
            ) : column.getIsSorted() === 'asc' ? (
              <ArrowUp className="ml-2 h-2 w-2" />
            ) : hasFilter ? (
              <Funnel className="ml-2 h-2 w-2" />
            ) : (
              <ListFilter className="ml-2 h-2 w-2" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px] p-0">
          {canFilter && (
            <div className="border-b">
              <div className="flex w-full items-center">
                <Search className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                <input
                  className="flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder={`Filter ${title}...`}
                  value={filterValue}
                  onChange={e => handleFilterChange(e.target.value)}
                  onKeyDown={e => handleKeyDown(e as unknown as React.KeyboardEvent<HTMLDivElement>)}
                />
              </div>

              {/* Temporarily hide "No results found" message until we fix the detection logic
              {searchSubmitted && filterValue && column.getFacetedUniqueValues().size === 0 && (
                <div className="py-1 px-2 text-sm text-center text-muted-foreground">
                  No results found.
                </div>
              )}
              */}

              {/* {hasFilter && (
                <div className="p-2 pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilter}
                    className="h-7 text-xs w-full"
                  >
                    Clear Filter
                  </Button>
                </div>
              )} */}
            </div>
          )}

          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DataTableColumnHeader;
