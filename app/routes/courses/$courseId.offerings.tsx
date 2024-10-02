import { createFileRoute } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";

import {
  courseOfferingsFiltersSchema,
  getCourseOfferingsQuery,
  useCourseOfferings,
} from "@/lib/hooks/use-course-offerings";
import { CourseOfferingsTable } from "@/lib/components/course/course-offerings-table";

export const Route = createFileRoute("/courses/$courseId/offerings")({
  meta: () => [
    {
      title: "Course Offerings",
    },
  ],
  component: CourseOfferings,
  validateSearch: zodSearchValidator(courseOfferingsFiltersSchema),
  beforeLoad: async ({ context: { course, queryClient }, search }) => {
    if (course.terms.length === 0) {
      return {
        course,
      };
    }
    if (search.term && !course.terms.includes(search.term)) {
      delete search.term;
    }
    const filters = {
      term: search.term ?? course.terms[0],
    };
    const query = getCourseOfferingsQuery(course, filters.term);
    await queryClient.prefetchQuery(query);
    return {
      course,
      search: filters,
    };
  },
  loaderDeps: ({ search }) => search,
});

function CourseOfferings() {
  const { course, search } = Route.useRouteContext();
  if (course.terms.length === 0 || !search) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-muted-foreground font-semibold">
          No Offerings Found
        </p>
      </div>
    );
  }
  const { data: offerings, status } = useCourseOfferings(course, search.term);
  const navigate = Route.useNavigate();

  if (status === "pending") {
    return <></>;
  }

  if (status === "error") {
    return <></>;
  }

  return (
    <>
      <CourseOfferingsTable
        course={course}
        offerings={offerings}
        search={search}
        onFiltersChange={(filters) => {
          if (filters.term === course.terms[0]) {
            navigate({
              search: {
                ...filters,
                term: undefined,
              },
            });
          } else {
            navigate({
              search: filters,
            });
          }
        }}
      />
    </>
  );
}
