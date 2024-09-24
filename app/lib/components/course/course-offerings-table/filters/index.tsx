import { Course } from "@/lib/database/types";
import { CourseOfferingsTermFilter } from "./course-offerings-term-filter";

export type CourseOfferingsFilters = {
  term: string;
};

type CourseOfferingsFiltersProps = {
  course: Course;
  filters: CourseOfferingsFilters;
  onFiltersChange: (filters: CourseOfferingsFilters) => void;
};

export function CourseOfferingsFilters({
  course,
  filters,
  onFiltersChange,
}: CourseOfferingsFiltersProps) {
  return (
    <div className="py-2">
      <CourseOfferingsTermFilter
        course={course}
        term={filters.term}
        onTermChange={(term) => onFiltersChange({ term })}
      />
    </div>
  );
}
