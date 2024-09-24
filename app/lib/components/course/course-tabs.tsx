import { FileTextIcon, HomeIcon, PersonIcon } from "@radix-ui/react-icons";

import { Course } from "@/lib/database/types";
import { CourseTab } from "./course-tab";

type CourseTabProps = {
  course: Course;
};

export function CourseTabs({ course }: CourseTabProps) {
  return (
    <div className="border mt-2">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-muted-foreground justify-center">
        <CourseTab
          to={`/courses/${course.id}`}
          title="Overview"
          icon={<HomeIcon />}
        />
        <CourseTab
          to={`/courses/${course.id}/prerequisites`}
          title="Prerequisites"
          icon={<FileTextIcon />}
        />
        <CourseTab
          to={`/courses/${course.id}/offerings`}
          title="Offerings"
          icon={<PersonIcon />}
        />
      </ul>
    </div>
  );
}
