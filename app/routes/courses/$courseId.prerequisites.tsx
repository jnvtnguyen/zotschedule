import { createFileRoute } from "@tanstack/react-router";

import { CoursePrerequisitesGraph } from "@/lib/components/course/course-prerequisites-graph";

export const Route = createFileRoute("/courses/$courseId/prerequisites")({
  meta: () => [
    {
      title: "Course Prerequisites",
    },
  ],
  component: CoursePrerequisites,
  beforeLoad: async ({ context: { course } }) => {
    return {
      course,
    };
  },
});

function CoursePrerequisites() {
  const { course } = Route.useRouteContext();

  return (
    <>
      <CoursePrerequisitesGraph prerequisiteTree={course.prerequisiteTree} />
    </>
  );
}
