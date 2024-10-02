import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";

import { database } from "@/lib/database";
import { department } from "@/lib/database/logic/courses";
import { CourseBreadcrumbs } from "@/lib/components/course/course-breadcrumbs";
import { CourseBasicInfo } from "@/lib/components/course/course-basic-info";
import { CourseTabs } from "@/lib/components/course/course-tabs";

const getCourseById = createServerFn("GET", async (courseId: string) => {
  const course = await database
    .selectFrom("courses")
    .where("id", "=", courseId)
    .selectAll()
    .select(({ ref }) => [department(ref("courses.departmentCode"))])
    .executeTakeFirst();
  return course;
});

export const Route = createFileRoute("/courses/$courseId")({
  meta: () => [
    {
      title: "Course Details",
    },
  ],
  beforeLoad: async ({ params }) => {
    const course = await getCourseById(params.courseId);
    if (!course) {
      throw notFound();
    }
    return {
      course,
    };
  },
  component: CourseDetails,
});

function CourseDetails() {
  const { course } = Route.useRouteContext();

  return (
    <div className="flex-col lg:p-16 p-4 flex space-y-4">
      <CourseBreadcrumbs course={course} />
      <div className="flex flex-col gap-2 max-w-[1280px]">
        <CourseBasicInfo course={course} />
        <CourseTabs course={course} />
        <Outlet />
      </div>
    </div>
  );
}
