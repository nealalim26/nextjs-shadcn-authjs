'use client';
import React, { useMemo, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, SortingState, getSortedRowModel, ColumnFiltersState } from '@tanstack/react-table';
import { Check, ChevronsUpDown, CircleX, RefreshCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

import { TriangleAlert } from 'lucide-react';
import DataTableFacetedFilter, { DataTableDateFilter } from '../components/faceted-filter';
import DataTableViewOptions from '../components/view-options';
import DataTablePagination from '../components/pagination';
import DataTableSortControls from '../components/sort-controls';
import FilterPresets from '../components/filter-presets';
import AdvancedFilter from '../components/advanced-filter';

// Define a custom filter option interface
interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

// Define a custom filter interface
interface CustomFilter {
  columnId: string;
  title: string;
  options: FilterOption[];
}

// Updated interface to support generic typing
export interface DataTableProps<TData> {
  tableName: string;
  columns: ColumnDef<TData, any>[];
  apiUrl?: string;
  orderBy?: [string, string];
  searchColumns?: string[];
  searchable?: boolean;
  enableClientSideFiltering?: boolean;
  customFilters?: CustomFilter[];
  enableDateFilter?: boolean;
  dateFilterColumn?: string;
  columnFilters?: Record<string, any>;
  debugCallback?: (data: TData[]) => void;
  onDataChange?: (data: TData[]) => void;
  additionalQueryParams?: Record<string, any>;
  /**
   * Controls initial column visibility by accessorKey. Example: { topics_id: false }
   */
  columnVisibility?: Record<string, boolean>;
}

const DataTable = forwardRef<{ handleReload: () => void }, any>(
  (
    {
      tableName,
      columns,
      apiUrl,
      orderBy,
      searchColumns,
      searchable = true,
      enableClientSideFiltering = true,
      customFilters,
      enableDateFilter = false,
      dateFilterColumn = 'created_at',
      columnFilters: initialColumnFilters,
      debugCallback,
      onDataChange,
      additionalQueryParams,
      columnVisibility: initialColumnVisibility,
    }: any,
    ref
  ) => {
    // Get queryClient instance
    const queryClient = useQueryClient();

    const defaultData = useMemo<any[]>(() => [], []);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({
      page: 1,
      pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
      if (!initialColumnFilters) return [];

      // Convert the initialColumnFilters object to the format expected by TanStack Table
      return Object.entries(initialColumnFilters).map(([id, value]) => ({
        id,
        value,
      }));
    });
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
      return initialColumnVisibility || {};
    });

    // Prepare column filters for API request
    const apiColumnFilters = useMemo(() => {
      return columnFilters.reduce(
        (acc, filter) => {
          // Handle date range objects for date filtering
          if (filter.value && typeof filter.value === 'object' && 'from' in filter.value && 'to' in filter.value) {
            // Pass date range as a special format the backend can understand
            acc[filter.id] = {
              type: 'dateRange',
              from: filter.value.from,
              to: filter.value.to,
            };
          } else {
            // Pass all other filters directly
            acc[filter.id] = filter.value;
          }
          return acc;
        },
        {} as Record<string, unknown>
      );
    }, [columnFilters]);

    // Handle applying filter presets
    const handleApplyPreset = (presetFilters: Record<string, any>) => {
      const newColumnFilters = Object.entries(presetFilters).map(([id, value]) => ({
        id,
        value,
      }));
      setColumnFilters(newColumnFilters);
    };

    const dataQuery = useQuery({
      queryKey: ['data', tableName, pagination, searchQuery, sorting, columnFilters],
      queryFn: async () => {
        console.log('DataTable query executing with filters:', columnFilters);
        console.log('API column filters:', apiColumnFilters);
        // Convert sorting state to backend-compatible format
        let sortingParam = orderBy;
        if (sorting.length > 0) {
          // Use just the first sort criterion in the format that was working before
          sortingParam = [sorting[0].id, sorting[0].desc ? 'desc' : 'asc'];
        }

        // Get the user ID from the cookie for authentication
        let userId = '';
        let userType = '';
        try {
          const userCookie = document.cookie.split('; ').find(row => row.startsWith('user='));
          if (userCookie) {
            const userJson = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
            userId = userJson.user_id || '';
            userType = userJson.type || ''; // Get the user type from the cookie
            console.log('User cookie information:', { userId, userType });
          }
        } catch (error) {
          console.error('Error parsing user cookie:', error);
        }

        const payload = {
          table: tableName,
          pageSize: pagination.pageSize,
          pageNumber: pagination.page,
          orderBy: sortingParam,
          multiSort:
            sorting.length > 1
              ? sorting.map(sort => ({
                  column: sort.id,
                  direction: sort.desc ? 'desc' : 'asc',
                }))
              : undefined,
          searchColumns,
          searchQuery,
          columnFilters: apiColumnFilters,
          additionalParams: additionalQueryParams || { showAll: 'true' },
        };

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Add user ID to headers if available
        if (userId) {
          headers['x-user-id'] = userId.toString();
        }

        // Add user type to headers if available
        if (userType) {
          headers['x-user-type'] = userType;
        }

        // For content_revision table, ensure admin privileges
        if (tableName === 'content_revision') {
          console.log('Enforcing admin access for content_revision table');
          headers['x-user-type'] = 'Admin'; // Force admin role for content table
          if (!headers['x-user-id']) {
            headers['x-user-id'] = '1'; // Default admin ID if none provided
          }
        }

        const response = await fetch(apiUrl!, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        console.log('DataTable API request sent:', {
          url: apiUrl,
          tableName,
          userId,
          userType,
          additionalParams: payload.additionalParams,
        });

        const data = await response.json();

        console.log('DataTable API response received:', {
          success: !!data?.data,
          recordCount: data?.data?.length || 0,
          pagination: data?.pagination,
        });

        return data;
      },
      placeholderData: keepPreviousData,
    });

    // Fetch suggestions
    const suggestionsQuery = useQuery({
      queryKey: ['suggestions', tableName],
      queryFn: async () => {
        const payload = {
          table: tableName,
          column: searchColumns?.[0] || 'title', // We'll get suggestions for the first search column
        };

        const response = await fetch(`${apiUrl?.replace('/pagination', '/pagination/suggestions')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        return data.suggestions || [];
      },
      enabled: !!apiUrl && !!searchColumns?.length,
    });

    useEffect(() => {
      if (suggestionsQuery.data) {
        setSuggestions(suggestionsQuery.data);
      }
    }, [suggestionsQuery.data]);

    // Call debug callback when data changes
    useEffect(() => {
      if (dataQuery.data?.data && debugCallback) {
        debugCallback(dataQuery.data.data);
      }
    }, [dataQuery.data, debugCallback]);

    // Call onDataChange callback when data changes
    useEffect(() => {
      if (dataQuery.data?.data && onDataChange) {
        onDataChange(dataQuery.data.data);
      }
    }, [dataQuery.data, onDataChange]);

    const isLoading = dataQuery.isFetching || dataQuery.isRefetching;

    const table = useReactTable({
      data: dataQuery.data?.data ?? defaultData,
      columns,
      manualPagination: true,
      manualSorting: !enableClientSideFiltering,
      manualFiltering: !enableClientSideFiltering,
      rowCount: dataQuery.data?.pagination?.totalDocs || 0,
      state: {
        pagination: {
          pageIndex: pagination.page - 1,
          pageSize: pagination.pageSize,
        },
        sorting,
        columnFilters,
        columnVisibility,
      },
      onPaginationChange: updater => {
        if (typeof updater === 'function') {
          const newPagination = updater({
            pageIndex: pagination.page - 1,
            pageSize: pagination.pageSize,
          });
          setPagination({
            page: newPagination.pageIndex + 1,
            pageSize: newPagination.pageSize,
          });
        } else {
          setPagination({
            page: updater.pageIndex + 1,
            pageSize: updater.pageSize,
          });
        }
      },
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      onColumnVisibilityChange: setColumnVisibility,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      enableSorting: true,
      enableMultiSort: true,
      enableColumnFilters: true,
    });

    const [refetching, setRefetching] = useState(false);

    const handleReload = async () => {
      console.log('DataTable reload triggered for table:', tableName);
      setRefetching(true);

      // Force invalidate the cache
      await queryClient.invalidateQueries({ queryKey: ['data', tableName] });

      // Refetch with fresh data
      const result = await dataQuery.refetch();

      console.log('DataTable reload complete:', {
        success: !!result.data?.data,
        recordCount: result.data?.data?.length || 0,
        error: result.error,
      });

      setRefetching(false);
    };

    // Expose handleReload to parent components
    useImperativeHandle(ref, () => ({
      handleReload,
    }));

    // Filter suggestions based on input
    const filteredSuggestions = searchQuery ? suggestions.filter(suggestion => suggestion.toLowerCase().includes(searchQuery.toLowerCase())) : suggestions;

    // Find columns by accessor key
    const getColumnByAccessorKey = (accessorKey: string) => {
      return columns.find((col: any) => 'accessorKey' in col && col.accessorKey === accessorKey);
    };

    const dateColumn = getColumnByAccessorKey(dateFilterColumn);

    // Determine which faceted filters to display based on provided options
    const facetedFilters: {
      columnId: string;
      title: string;
      options: FilterOption[];
    }[] = [];

    if (customFilters && customFilters.length) {
      customFilters.forEach((filter: any) => {
        facetedFilters.push({
          columnId: filter.columnId,
          title: filter.title,
          options: filter.options,
        });
      });
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {searchable && (
            <div className="flex flex-wrap items-center gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={open} className="w-full sm:w-[300px] justify-between">
                    {searchQuery || 'Search...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search..." value={searchQuery} onValueChange={setSearchQuery} />
                    <CommandList>
                      <CommandEmpty>{searchQuery ? `No results found for "${searchQuery}"` : `No ${searchColumns?.[0] ? searchColumns[0].replace('_', ' ') : 'items'} found.`}</CommandEmpty>
                      <CommandGroup>
                        {filteredSuggestions.map(suggestion => (
                          <CommandItem
                            key={suggestion}
                            value={suggestion}
                            onSelect={currentValue => {
                              setSearchQuery(currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check className={cn('mr-2 h-4 w-4', searchQuery === suggestion ? 'opacity-100' : 'opacity-0')} />
                            {suggestion}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <div className="flex flex-wrap items-center gap-2">
                {/* Render faceted filters dynamically based on provided options */}
                {facetedFilters.map(filter => {
                  // First try to get column by the exact columnId
                  let column = table.getColumn(filter.columnId);

                  // If not found, try to find by accessorKey (TanStack Table uses accessorKey as column id)
                  if (!column) {
                    const columnByAccessor = columns.find((col: any) => 'accessorKey' in col && col.accessorKey === filter.columnId);

                    if (columnByAccessor) {
                      // TanStack Table uses accessorKey as the column id when no explicit id is provided
                      column = table.getColumn(filter.columnId);
                    }
                  }

                  // If still not found, log warning and skip
                  if (!column) {
                    console.warn(
                      `Column with id '${filter.columnId}' does not exist in table. Available columns:`,
                      table.getAllColumns().map(col => col.id)
                    );
                    return null;
                  }

                  console.log(`Rendering filter for column: ${filter.columnId}`);
                  return <DataTableFacetedFilter key={filter.columnId} column={column} title={filter.title} options={filter.options} />;
                })}

                {enableDateFilter && dateColumn && <DataTableDateFilter column={table.getColumn(dateFilterColumn) || dateColumn} title="Created At" />}

                {/* Only show reset button when user-applied filters exist (not including initialColumnFilters) */}
                {table.getState().columnFilters.some(filter => {
                  // Check if this filter was not part of the initial filters
                  if (!initialColumnFilters) return true;

                  const initialValue = initialColumnFilters[filter.id];
                  // If filter exists but wasn't in initial filters, or if value is different
                  return initialValue === undefined || JSON.stringify(initialValue) !== JSON.stringify(filter.value);
                }) && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      // Reset to initial filters instead of clearing everything
                      if (initialColumnFilters) {
                        const initialFilters = Object.entries(initialColumnFilters).map(([id, value]) => ({
                          id,
                          value,
                        }));
                        setColumnFilters(initialFilters);
                      } else {
                        table.resetColumnFilters();
                      }
                    }}
                    className="h-8 px-2 lg:px-3"
                  >
                    Reset
                    <CircleX className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <FilterPresets tableName={tableName} onApplyPreset={handleApplyPreset} currentFilters={apiColumnFilters} />
            <AdvancedFilter columns={columns} onApplyFilters={handleApplyPreset} currentFilters={apiColumnFilters} />
            <Button className="h-8" variant="outline" size="sm" onClick={handleReload}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${refetching || isLoading ? 'animate-spin' : ''}`} />
              <span>Reload</span>
            </Button>
            <DataTableSortControls table={table} />
            <DataTableViewOptions table={table} />
          </div>
        </div>
        <div className="rounded-md border border-border">
          <div className="relative w-full overflow-auto">
            <Table className="border-collapse">
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => {
                  return (
                    <TableRow key={headerGroup.id} className="text-xs border-border">
                      {headerGroup.headers.map(header => {
                        const isFixed = (header.column.columnDef.meta as any)?.fixed === true;

                        // Find the last sticky column
                        const visibleColumns = headerGroup.headers.filter(h => h.column.getIsVisible()).filter(h => (h.column.columnDef.meta as any)?.fixed === true);

                        const isLastSticky = visibleColumns.length > 0 && visibleColumns[visibleColumns.length - 1].id === header.id;

                        return (
                          <TableHead
                            key={header.id}
                            className={cn(
                              isFixed &&
                                "md:sticky md:left-0 md:z-20 md:bg-background dark:md:bg-background md:border-r-[1px] md:border-r-border/70 border-b-border md:after:absolute md:after:top-0 md:after:right-0 md:after:bottom-0 md:after:w-[1px] md:after:bg-border md:after:content-['']",
                              isLastSticky && 'md:after:w-[2px]'
                            )}
                          >
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Skeleton loading state with 10 rows
                  Array(10)
                    .fill(0)
                    .map((_, index) => {
                      const isLastRow = index === 9; // Last row in skeleton state

                      return (
                        <TableRow key={`skeleton-${index}`} className="border-border">
                          {table.getVisibleFlatColumns().map((column, cellIndex) => {
                            const isFixed = (column.columnDef.meta as any)?.fixed === true;

                            // Find the last sticky column
                            const visibleColumns = table.getVisibleFlatColumns().filter(c => (c.columnDef.meta as any)?.fixed === true);

                            const isLastSticky = visibleColumns.length > 0 && cellIndex === visibleColumns.length - 1 && isFixed;

                            return (
                              <TableCell
                                key={`skeleton-cell-${index}-${cellIndex}`}
                                className={cn(
                                  isFixed &&
                                    "md:sticky md:left-0 md:z-20 md:bg-background dark:md:bg-background md:border-r-[1px] md:border-r-border/70 border-b-border md:after:absolute md:after:top-0 md:after:right-0 md:after:bottom-0 md:after:w-[1px] md:after:bg-border md:after:content-['']",
                                  isLastSticky && 'md:after:w-[2px]',
                                  isLastRow && !isFixed && 'border-b-border'
                                )}
                              >
                                <Skeleton className="h-5 w-full" />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, rowIndex) => {
                    const isLastRow = rowIndex === table.getRowModel().rows.length - 1;

                    return (
                      <TableRow key={row.id} className="border-border" data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map(cell => {
                          const isFixed = (cell.column.columnDef.meta as any)?.fixed === true;

                          // Find the last sticky column
                          const visibleCells = row.getVisibleCells().filter(c => (c.column.columnDef.meta as any)?.fixed === true);

                          const isLastSticky = visibleCells.length > 0 && visibleCells[visibleCells.length - 1].id === cell.id;

                          return (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                isFixed &&
                                  "md:sticky md:left-0 md:z-20 md:bg-background dark:md:bg-background md:border-r-[1px] md:border-r-border/70 border-b-border md:after:absolute md:after:top-0 md:after:right-0 md:after:bottom-0 md:after:w-[1px] md:after:bg-border md:after:content-['']",
                                isLastSticky && 'md:after:w-[2px]',
                                isLastRow && !isFixed && 'border-b-border'
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow className="border-border">
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex gap-4 justify-center items-center">
                        <TriangleAlert className="h-8 w-8 text-red-500" />
                        <span className="text-md">No record found.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* <ScrollBar orientation="horizontal" /> */}
        </div>
        <div className="w-full overflow-auto">
          <DataTablePagination table={table} totalDocs={dataQuery.data?.pagination?.totalDocs || 0} />
        </div>
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';

export default DataTable;
