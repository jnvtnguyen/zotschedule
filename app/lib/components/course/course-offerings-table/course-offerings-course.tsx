import { WebSocCourse } from "@/lib/uci/offerings/types";
import { CourseOfferingsSections } from "./course-offerings-sections";

type CourseOfferingsCourseProps = {
  course: WebSocCourse;
};

export function CourseOfferingsCourse({ course }: CourseOfferingsCourseProps) {
  return (
    <>
      <CourseOfferingsSections sections={course.sections} />
    </>
  );
}
