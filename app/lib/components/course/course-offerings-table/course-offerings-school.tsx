import { WebSocSchool } from "@/lib/uci/offerings/types";
import { CourseOfferingsDepartment } from "./course-offerings-department";

type CourseOfferingsSchoolProps = {
  school: WebSocSchool;
};

export function CourseOfferingsSchool({ school }: CourseOfferingsSchoolProps) {
  return (
    <>
      {school.departments.map((department) => (
        <CourseOfferingsDepartment
          key={department.code}
          department={department}
        />
      ))}
    </>
  );
}
