import { WebSocDepartment } from "@/lib/uci/offerings/types";
import { CourseOfferingsCourse } from "./course-offerings-course";

type CourseOfferingsDepartmentProps = {
  department: WebSocDepartment;
};

export function CourseOfferingsDepartment({
  department,
}: CourseOfferingsDepartmentProps) {
  return (
    <>
      {department.courses.map((course) => (
        <CourseOfferingsCourse key={course.number} course={course} />
      ))}
    </>
  );
}
