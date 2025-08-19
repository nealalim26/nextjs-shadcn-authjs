import { ColumnDef } from "@tanstack/react-table";

export interface DataTableProps<TData, TValue> {
  tableName: string;
  columns: ColumnDef<TData, TValue>[];
  apiUrl: string;
  orderBy: any[];
  searchColumns?: any[];
  searchable?: boolean;
}
