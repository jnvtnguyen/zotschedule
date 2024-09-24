import { WebSocResponse } from "@/lib/uci/offerings/types";
import { Course } from "@/lib/database/types";
import { CourseOfferingsFilters } from "./filters";
import { CourseOfferingsList } from "./course-offerings-list";
import { useCallback, useEffect, useState } from "react";

type CourseOfferingsTableProps = {
  offerings: WebSocResponse;
  course: Course;
  search: CourseOfferingsFilters;
  onFiltersChange: (filters: CourseOfferingsFilters) => void;
};

export function CourseOfferingsTable({
  offerings,
  course,
  search,
  onFiltersChange,
}: CourseOfferingsTableProps) {
  const [filters, setFilters] = useState(search);

  const handleFiltersChange = useCallback(
    (filters: CourseOfferingsFilters) => {
      onFiltersChange(filters);
    },
    [onFiltersChange],
  );

  useEffect(() => {
    handleFiltersChange(filters);
  }, [filters]);

  return (
    <>
      <CourseOfferingsFilters
        course={course}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <CourseOfferingsList offerings={offerings} />
    </>
  );
}
