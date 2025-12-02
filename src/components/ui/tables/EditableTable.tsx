"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { EditableCell, EditableNumberCell, EditableSelectCell } from "./EditableCell";
import {
  MoreHorizontal,
  RefreshCw,
  Plus,
  ChevronLeft,
  ChevronRight,
  Inbox,
  AlertCircle
} from "lucide-react";

interface EditableColumn<TData> {
  header: string;
  accessorKey: keyof TData;
  editable?: boolean;
  type?: "text" | "number" | "select";
  options?: Array<{ value: any; label: string }>;
  cell?: (row: TData) => React.ReactNode;
  onSave?: (rowId: string | number, field: keyof TData, value: any) => Promise<void> | void;
}

interface EditableTableProps<TData> {
  data: TData[];
  columns: EditableColumn<TData>[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onAdd?: () => void;
  onEdit?: (item: TData) => void;
  onDelete?: (item: TData) => void;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  className?: string;
  rowId?: (row: TData, index: number) => string | number;
}

export function EditableTable<TData extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error,
  onRefresh,
  onAdd,
  onEdit,
  onDelete,
  enableSorting = false,
  enableFiltering = true,
  enablePagination = true,
  pageSize = 10,
  emptyMessage = "No data available",
  className,
  rowId = (row, index) => index,
}: EditableTableProps<TData>) {
  const [sortField, setSortField] = useState<keyof TData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  // Filter data
  const filteredData = useMemo(() => {
    if (!filterText) return sortedData;
    const text = filterText.toLowerCase();
    return sortedData.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(text)
      )
    );
  }, [sortedData, filterText]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!enablePagination) return filteredData;
    const startIndex = currentPage * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize, enablePagination]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (field: keyof TData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = async (item: TData) => {
    if (onDelete && window.confirm("Are you sure you want to delete this item?")) {
      try {
        await onDelete(item);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleInlineSave = async (rowId: string | number, field: keyof TData, value: any) => {
    const column = columns.find(col => col.accessorKey === field);
    if (column?.onSave) {
      await column.onSave(rowId, field, value);
    }
  };

  const toggleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((_, index) => index)));
    }
  };

  const renderEditableCell = (column: EditableColumn<TData>, row: TData, rowIndex: number) => {
    if (!column.editable || !column.onSave) {
      return column.cell ? column.cell(row) : String(row[column.accessorKey] || '');
    }

    const currentRowId = rowId(row, rowIndex);
    const value = row[column.accessorKey];

    switch (column.type) {
      case "number":
        return (
          <EditableNumberCell
            value={value as number}
            onSave={(newValue) => handleInlineSave(currentRowId, column.accessorKey, newValue)}
            placeholder={`Enter ${column.header.toLowerCase()}`}
          />
        );
      case "select":
        return (
          <EditableSelectCell
            value={value}
            onSave={(newValue) => handleInlineSave(currentRowId, column.accessorKey, newValue)}
            options={column.options || []}
          />
        );
      default:
        return (
          <EditableCell
            value={value as string}
            onSave={(newValue) => handleInlineSave(currentRowId, column.accessorKey, newValue)}
            placeholder={`Enter ${column.header.toLowerCase()}`}
          />
        );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {enableFiltering && (
            <Input
              placeholder="Filter..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="max-w-sm"
            />
          )}
        </div>
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
          {onAdd && (
            <Button size="sm" onClick={onAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Checkbox header */}
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                  onCheckedChange={toggleAllRows}
                  aria-label="Select all"
                />
              </TableHead>
              {/* Column headers */}
              {columns.map((column) => (
                <TableHead key={String(column.accessorKey)}>
                  {enableSorting ? (
                    <button
                      onClick={() => handleSort(column.accessorKey)}
                      className="flex items-center space-x-1 font-medium hover:text-foreground"
                    >
                      {column.header}
                      {column.editable && (
                        <span className="text-xs text-blue-600">(editable)</span>
                      )}
                      {sortField === column.accessorKey && (
                        <span className="text-xs">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1">
                      {column.header}
                      {column.editable && (
                        <span className="text-xs text-blue-600">(editable)</span>
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
              {/* Actions header */}
              <TableHead className="w-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2 text-red-600">
                    <AlertCircle className="h-6 w-6" />
                    <span>{error}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <TableRow key={rowId(row, index)} data-selected={selectedRows.has(index)}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(index)}
                      onCheckedChange={() => toggleRowSelection(index)}
                      aria-label={`Select row ${index}`}
                    />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={String(column.accessorKey)}>
                      {renderEditableCell(column, row, index)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(row)}>
                            Edit (Modal)
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(row)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 2} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <Inbox className="h-12 w-12 mb-2" />
                    <span>{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && filteredData.length > pageSize && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-gray-500">
            Showing {selectedRows.size} of {paginatedData.length} row(s) selected.
          </div>
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Page {currentPage + 1} of {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}