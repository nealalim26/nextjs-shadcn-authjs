import React, { useState } from "react"
import { Table } from "@tanstack/react-table";
import { Settings2, Search } from "lucide-react"

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

const DataTableViewOptions = <TData,>({ table }: DataTableViewOptionsProps<TData>) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSearchQuery(e.target.value);
  };

  // Prevent clicks on the input from closing the dropdown
  const handleInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex">
          <Settings2 className="mr-2 h-5 w-5" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <div className="flex items-center px-1 border-b" onClick={(e) => e.stopPropagation()}>
          <Search className="h-4 w-4 mx-1 opacity-50" />
          <input
            type="text"
            placeholder="Search columns..."
            value={searchQuery}
            onChange={handleSearch}
            onClick={handleInputClick}
            onKeyDown={(e) => e.stopPropagation()}
            className="h-7 w-full outline-none border-none bg-transparent px-0 py-2 text-sm"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" &&
              column.getCanHide() &&
              column.id.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                {column.id.split("_").join(" ")}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default DataTableViewOptions
