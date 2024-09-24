import { Table } from "@tanstack/react-table";
import { Cross2Icon } from "@radix-ui/react-icons";

import { Course } from "@/lib/database/types";
import { Button } from "@/lib/components/ui/button";
import { CourseDepartmentsFilter } from "./course-departments-filter";
import { CourseSearchFilter } from "./course-search-filter";
import { CourseGEsFilter } from "./course-ges-filter";
import { CourseUnitsFilter } from "./course-units-filter";
import { CoursePagination } from "./course-pagination";

type CourseFiltersProps = {
  table: Table<Course>;
};

export function CourseFilters({ table }: CourseFiltersProps) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex sticky top-[-1px] bg-white py-5 border-b items-start flex-col gap-4">
      <div className="flex flex-row flex-wrap gap-2">
        {table.getColumn("search") && (
          <CourseSearchFilter
            value={
              (table.getColumn("search")!.getFilterValue() as string) ?? ""
            }
            onChange={(search: string) => {
              table.getColumn("search")!.setFilterValue(search);
            }}
          />
        )}
        {table.getColumn("department") && (
          <CourseDepartmentsFilter column={table.getColumn("department")!} />
        )}
        {table.getColumn("ges") && (
          <CourseGEsFilter column={table.getColumn("ges")!} />
        )}
        {table.getColumn("units") && (
          <CourseUnitsFilter column={table.getColumn("units")!} />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <CoursePagination table={table} />
    </div>
  );
}
