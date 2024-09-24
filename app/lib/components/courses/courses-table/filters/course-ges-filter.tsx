import { Column } from "@tanstack/react-table";

import { FacetedFilter } from "./faceted-filter";
import { GE_DICTIONARY } from "@/lib/uci/courses/types";

type CourseBreadthFilterProps<TData, TValue> = {
  column: Column<TData, TValue>;
};

export function CourseGEsFilter<TData, TValue>({
  column,
}: CourseBreadthFilterProps<TData, TValue>) {
  return (
    <FacetedFilter
      column={column}
      title="GE"
      options={Object.entries(GE_DICTIONARY).map(([key, value]) => ({
        label: `(${key}) ${value}`,
        value: key,
      }))}
      width="350px"
    />
  );
}
