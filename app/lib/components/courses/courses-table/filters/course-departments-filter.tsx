import { Column } from "@tanstack/react-table";

import { useDepartments } from "@/lib/hooks/departments";
import { FacetedFilter } from "./faceted-filter";

type DepartmentsFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export function CourseDepartmentsFilter<TData, TValue>({
  column,
}: DepartmentsFilterProps<TData, TValue>) {
  const { data: departments, status } = useDepartments();

  if (status === "pending") {
    return <></>;
  }

  if (status === "error") {
    return <></>;
  }

  return (
    <FacetedFilter
      column={column}
      title="Department"
      options={departments.map((department) => ({
        label: department.title + " (" + department.code + ")",
        value: department.code,
      }))}
      width="350px"
    />
  );
}
