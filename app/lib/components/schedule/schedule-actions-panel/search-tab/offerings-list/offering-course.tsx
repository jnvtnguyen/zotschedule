import { WebSocCourse, WebSocDepartment } from "@/lib/uci/offerings/types";
import { CourseOfferingsSections } from "@/lib/components/course/course-offerings-table/course-offerings-sections";
import { ScheduleActionsPanelOfferingCourseSectionActions } from "./offering-course-section-actions";

type ScheduleActionsPanelOfferingCourseProps = {
  course: WebSocCourse;
  department: WebSocDepartment;
};

export function ScheduleActionsPanelOfferingCourse({
  course,
  department,
}: ScheduleActionsPanelOfferingCourseProps) {
  return (
    <div className="flex flex-col space-y-2 rounded-lg border p-3">
      <div className="flex items-center space-x-2 text-lg p-1">
        <p className="font-bold">
          {department.code} {course.number}
        </p>
        <p>|</p>
        <p>{course.title}</p>
      </div>
      <CourseOfferingsSections
        sections={course.sections}
        Actions={ScheduleActionsPanelOfferingCourseSectionActions}
      />
    </div>
  );
}
