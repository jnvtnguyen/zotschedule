import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFacetedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useState } from "react";

import { Course } from "@/lib/database/types";
import { CourseFiltersSchema } from "@/lib/hooks/courses";
import { CourseList } from "./course-list";
import { CourseFilters } from "./filters";
import { CoursePagination } from "./filters/course-pagination";

const columns: ColumnDef<Course>[] = [
  {
    id: "title",
    accessorFn: (row) => row.title,
  },
  {
    id: "course",
    accessorFn: (row) => row,
  },
  {
    id: "search",
    accessorFn: (row) => `${row.number} ${row.title}`,
    filterFn: "includesString",
  },
  {
    id: "ges",
    accessorFn: (row) => row.ges,
    filterFn: (row, id, value) => {
      return value.some((v: string) =>
        (row.getValue(id) as string[]).includes(v),
      );
    },
  },
  {
    id: "units",
    accessorFn: (row) => row.units,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "department",
    accessorFn: (row) => row.department.code,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];

type CoursesTableProps = {
  search: CourseFiltersSchema;
  courses: Course[];
  onFiltersChange: (filters: CourseFiltersSchema) => void;
};

const getFiltersFromSearch = (
  search: CourseFiltersSchema,
): ColumnFiltersState => {
  return Object.entries(search).map(([key, value]) => {
    return {
      id: key,
      value,
    };
  });
};

const getColumnFilterById = (filters: ColumnFiltersState, id: string) => {
  return filters.find((filter) => filter.id === id);
};

const getSearchFromilters = (
  filters: ColumnFiltersState,
): CourseFiltersSchema => {
  return {
    search: getColumnFilterById(filters, "search")?.value as string,
    department: getColumnFilterById(filters, "department")?.value as string[],
    breadth: getColumnFilterById(filters, "breadth")?.value as string[],
    units: getColumnFilterById(filters, "units")?.value as number[],
  };
};

export function CoursesTable({
  search,
  courses,
  onFiltersChange,
}: CoursesTableProps) {
  const [filters, setFilters] = useState<ColumnFiltersState>(
    getFiltersFromSearch(search),
  );

  const table = useReactTable({
    data: courses,
    columns,
    state: {
      columnFilters: filters,
    },
    onColumnFiltersChange: setFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
  });

  const handleFiltersChange = useCallback(
    (columnFilters: ColumnFiltersState) => {
      const filters = getSearchFromilters(columnFilters);
      onFiltersChange(filters);
    },
    [onFiltersChange],
  );

  useEffect(() => {
    handleFiltersChange(filters);
  }, [filters]);

  return (
    <div className="space-y-4">
      <CourseFilters table={table} />
      <CourseList table={table} />
      <CoursePagination table={table} />
    </div>
  );
}
