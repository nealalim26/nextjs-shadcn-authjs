"use client"

import { useState, useEffect, useMemo } from "react"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Trash2, GripVertical, ArrowUpDown, Check, ChevronsUpDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
  DropResult
} from '@hello-pangea/dnd'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface DataTableSortControlsProps<TData> {
  table: Table<TData>
}

export default function DataTableSortControls<TData>({
  table
}: DataTableSortControlsProps<TData>) {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState<Record<number, boolean>>({})
  const [sorts, setSorts] = useState<{ id: string; desc: boolean }[]>(() => {
    // Initialize with the table's current sorting state
    return table.getState().sorting
  })

  // Sync with table sorting when it changes externally
  useEffect(() => {
    const tableSorting = table.getState().sorting
    if (JSON.stringify(tableSorting) !== JSON.stringify(sorts)) {
      setSorts(tableSorting)
    }
  }, [table.getState().sorting, sorts])

  const allColumns = table.getAllColumns().filter(
    column => column.getCanSort()
  )

  // Get a list of columns that are not already being used for sorting
  const getAvailableColumns = (currentIndex: number) => {
    const usedColumnIds = sorts.map(sort => sort.id);
    // Only filter out columns if they're used in other sort criteria (not the current one)
    return allColumns.filter(column => {
      // Always include the currently selected column for this sort criterion
      if (sorts[currentIndex] && column.id === sorts[currentIndex].id) {
        return true;
      }
      // Filter out columns used in other sort criteria
      return !usedColumnIds.includes(column.id);
    });
  };

  const resetSorting = () => {
    table.resetSorting()
    setSorts([])
  }

  const addSort = () => {
    // Get columns not already used in sorting
    const availableColumns = allColumns.filter(
      column => !sorts.some(sort => sort.id === column.id)
    )

    if (availableColumns.length === 0) return

    const newSort = {
      id: availableColumns[0].id,
      desc: false
    }

    const newSorts = [...sorts, newSort]
    setSorts(newSorts)

    // Apply the sorting to the table
    table.setSorting(newSorts)
  }

  const updateSort = (index: number, columnId: string, desc: boolean) => {
    const newSorts = [...sorts]
    newSorts[index] = { id: columnId, desc }
    setSorts(newSorts)

    // Apply the sorting to the table
    table.setSorting(newSorts)

    // Close the dropdown
    setDropdownOpen({ ...dropdownOpen, [index]: false })
  }

  const removeSort = (index: number) => {
    const newSorts = [...sorts]
    newSorts.splice(index, 1)
    setSorts(newSorts)

    // Apply the sorting to the table
    table.setSorting(newSorts)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(sorts)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setSorts(items)
    table.setSorting(items)
  }

  // Format column display name to remove underscores and apply proper capitalization
  const formatColumnDisplay = (columnId: string) => {
    // Replace underscores with spaces and capitalize first letter of each word
    return columnId
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Check if we should show the Add Sort button (only if there are available columns)
  const hasAvailableColumnsForSort = useMemo(() => {
    const usedColumnIds = sorts.map(sort => sort.id);
    return allColumns.some(column => !usedColumnIds.includes(column.id));
  }, [allColumns, sorts]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort
          {sorts.length > 0 && (
            <span className="ml-1 rounded-full bg-primary w-5 h-5 text-xs flex items-center justify-center text-primary-foreground">
              {sorts.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] sm:w-[400px] p-0" align="end">
        <div className="p-4">
          <h4 className="font-medium mb-4">Sort by</h4>
          {sorts.length > 0 ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sort-criteria">
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {sorts.map((sort, index) => (
                      <Draggable key={index} draggableId={`sort-${index}`} index={index}>
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="flex h-4 w-4 items-center justify-center mb-1 sm:mb-0"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex flex-1 flex-col sm:flex-row w-full sm:w-auto gap-2">
                              <Popover open={dropdownOpen[index]} onOpenChange={(open) =>
                                setDropdownOpen({ ...dropdownOpen, [index]: open })
                              }>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="flex-1 justify-between h-9 w-full sm:min-w-[200px]"
                                  >
                                    {formatColumnDisplay(sort.id)}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[250px] sm:w-[300px] p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Search column..." className="h-9" />
                                    <CommandEmpty>No column found.</CommandEmpty>
                                    <CommandGroup className="max-h-[300px] overflow-auto">
                                      {getAvailableColumns(index).map((column) => (
                                        <CommandItem
                                          key={column.id}
                                          value={column.id}
                                          onSelect={() => updateSort(index, column.id, sort.desc)}
                                          className="flex items-center justify-between py-2 px-2 cursor-pointer"
                                        >
                                          <span className="text-sm">{formatColumnDisplay(column.id)}</span>
                                          {column.id === sort.id && <Check className="h-4 w-4 text-primary" />}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={sort.desc ? "desc" : "asc"}
                                  onValueChange={(value) => updateSort(index, sort.id, value === "desc")}
                                >
                                  <SelectTrigger className="w-full sm:w-[100px] h-9">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="asc">Asc</SelectItem>
                                    <SelectItem value="desc">Desc</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSort(index)}
                                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="text-sm text-muted-foreground py-2">No sort criteria applied.</div>
          )}
          <div className="flex justify-between mt-4">
            {hasAvailableColumnsForSort && (
              <Button size="sm" className="text-xs" onClick={addSort}>
                Add Sort
              </Button>
            )}
            {sorts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto text-xs"
                onClick={resetSorting}
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 
