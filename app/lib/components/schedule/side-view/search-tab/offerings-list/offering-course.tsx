import { WebSocCourse, WebSocDepartment } from "@/lib/uci/offerings/types";
import { SideViewOfferingCourseSection } from "./offering-course-section";

type SideViewOfferingCourseProps = {
  course: WebSocCourse;
  department: WebSocDepartment;
};

export function SideViewOfferingCourse({
  course,
  department,
}: SideViewOfferingCourseProps) {
  return (
    <div className="flex flex-col space-y-2 bg-primary-foreground rounded-lg border p-3">
      <div className="flex items-center space-x-2 text-lg">
        <p className="font-bold">
          {department.code} {course.number}
        </p>
        <p>|</p>
        <p>{course.title}</p>
      </div>
      {course.sections.map((section) => (
        <SideViewOfferingCourseSection key={section.code} section={section} />
      ))}
    </div>
  );
}
