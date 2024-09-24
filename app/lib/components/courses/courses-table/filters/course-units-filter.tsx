import { Column } from "@tanstack/react-table";

import { FacetedFilter } from "./faceted-filter";
import { UNITS_DICTIONARY } from "@/lib/uci/courses/types";

type CourseUnitsFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export function CourseUnitsFilter<TData, TValue>({
  column,
}: CourseUnitsFilterProps<TData, TValue>) {
  return (
    <FacetedFilter
      column={column}
      title="Units"
      options={Object.entries(UNITS_DICTIONARY).map(([key, value]) => ({
        label: value,
        value: parseInt(key),
      }))}
      width="200px"
    />
  );
}
