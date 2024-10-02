import { createFileRoute } from "@tanstack/react-router";
import { zodSearchValidator } from "@tanstack/router-zod-adapter";

import { CoursesTable } from "@/lib/components/courses/courses-table";
import { getDepartmentsQuery } from "@/lib/hooks/use-departments";
import {
  courseFiltersSchema,
  getCoursesQuery,
  useCourses,
} from "@/lib/hooks/use-courses";

export const Route = createFileRoute("/courses/")({
  meta: () => [
    {
      title: "Courses",
    },
  ],
  component: Courses,
  validateSearch: zodSearchValidator(courseFiltersSchema),
  beforeLoad: async ({ context: { queryClient }, search }) => {
    await queryClient.prefetchQuery(getDepartmentsQuery);
    await queryClient.prefetchQuery(getCoursesQuery);

    const departments = await queryClient.ensureQueryData(getDepartmentsQuery);
    if (
      search.department &&
      !search.department.some((department) =>
        departments.some((d) => d.code === department),
      )
    ) {
      delete search.department;
    }

    return {
      search,
    };
  },
  loaderDeps: ({ search }) => search,
});

function Courses() {
  const { search } = Route.useRouteContext();
  const navigate = Route.useNavigate();

  const { data: courses, status } = useCourses();

  if (status === "pending") {
    return <></>;
  }

  if (status === "error") {
    return <></>;
  }

  return (
    <div className="flex-col lg:p-16 p-4 flex">
      <h2 className="text-3xl font-bold">UCI Courses</h2>
      <CoursesTable
        courses={courses}
        search={search}
        onFiltersChange={(filters) => {
          navigate({
            search: filters,
          });
        }}
      />
    </div>
  );
}
