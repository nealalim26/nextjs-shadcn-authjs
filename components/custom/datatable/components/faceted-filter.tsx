import React from "react";
import { cn } from "@/lib/utils";
import { CirclePlus, CircleX, Check, Calendar } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface DataTableFacetedFilterProps {
  table: any;
  column: any;
  title: string;
  options: Option[];
}

const DataTableFacetedFilter = ({
  table,
  column,
  title,
  options
}: DataTableFacetedFilterProps) => {
  const facets = column?.getFacetedUniqueValues();
  const filterValue = column?.getFilterValue();

  // Ensure we handle the filter value correctly
  let initialValues = [];
  if (Array.isArray(filterValue)) {
    initialValues = filterValue;
  } else if (filterValue !== undefined && filterValue !== null) {
    initialValues = [filterValue];
  }

  const selectedValues = new Set(initialValues);
  const isFiltered = table.getState().columnFilters.length > 0;

  // If options are empty but we have data in the table, try to extract options from the data
  const effectiveOptions = options.length
    ? options
    : Array.from(facets?.keys() || []).map(key => ({
      label: String(key),
      value: String(key),
      icon: undefined,
      count: facets?.get(key) || 0
    }));

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed max-w-full">
            <CirclePlus className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{title}</span>
            {selectedValues?.size > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4 flex-shrink-0" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal sm:hidden flex-shrink-0">
                  {selectedValues.size}
                </Badge>
                <div className="hidden sm:flex space-x-1 overflow-hidden">
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal flex-shrink-0">
                      {selectedValues.size} selected
                    </Badge>
                  ) : (
                    effectiveOptions
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="rounded-sm px-1 font-normal flex-shrink-0">
                          {option.icon && (
                            <option.icon className="mr-1 h-3 w-3 text-muted-foreground" />
                          )}
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[90vw] sm:w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder={title} />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {effectiveOptions.map((option) => {
                  const isSelected = selectedValues.has(option.value);
                  // Use the option count if provided, otherwise use the facet count
                  const count = option.count !== undefined ? option.count : facets?.get(option.value) || 0;

                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        if (isSelected) {
                          selectedValues.delete(option.value);
                        } else {
                          selectedValues.add(option.value);
                        }
                        const filterValues = Array.from(selectedValues);

                        // Standard filter handling for all columns
                        if (filterValues.length === 0) {
                          column?.setFilterValue(undefined);
                        } else {
                          // Always pass the array for consistent handling
                          column?.setFilterValue(filterValues);
                        }
                      }}>
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}>
                        <Check className="h-4 w-4" />
                      </div>
                      {option.icon && (
                        <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                      )}
                      <span>{option.label}</span>
                      {count > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-muted font-mono text-xs">
                          {count}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
              {selectedValues.size > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => column?.setFilterValue(undefined)}
                      className="justify-center text-center">
                      Clear filters
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};

interface DataTableDateFilterProps {
  table: any;
  column: any;
  title: string;
}

const DataTableDateFilter = ({
  table,
  column,
  title
}: DataTableDateFilterProps) => {
  const selectedDate = column?.getFilterValue();

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      column?.setFilterValue(undefined);
      return;
    }

    // Create a date range object that covers the entire day
    // This will match any datetime within the selected day
    const dateRange = {
      from: new Date(date.setHours(0, 0, 0, 0)).toISOString(),
      to: new Date(date.setHours(23, 59, 59, 999)).toISOString()
    };

    column?.setFilterValue(dateRange);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed max-w-full">
          <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate">{title}</span>
          {selectedDate && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4 flex-shrink-0" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal truncate max-w-[100px] sm:max-w-none">
                {selectedDate.from
                  ? format(new Date(selectedDate.from), "PPP")
                  : "Select date"}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={selectedDate?.from ? new Date(selectedDate.from) : undefined}
          onSelect={(date) => handleDateSelect(date)}
          initialFocus
        />
        {selectedDate && (
          <div className="flex items-center justify-center p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column?.setFilterValue(undefined)}
              className="text-center">
              Clear date
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export { DataTableFacetedFilter, DataTableDateFilter };
export default DataTableFacetedFilter;
