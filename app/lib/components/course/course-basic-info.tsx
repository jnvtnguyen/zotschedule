import { Course } from "@/lib/database/types";
import { getUnitsFromRange } from "@/lib/utils";

type CourseBasicInfoProps = {
  course: Course;
};

export function CourseBasicInfo({ course }: CourseBasicInfoProps) {
  return (
    <>
      <h1 className="text-2xl flex gap-2 flex-wrap">
        <p className="font-semibold">
          ({course.department.code} {course.number})
        </p>
        {course.title}
      </h1>
      <p>{course.description}</p>
      <div>
        {course.units && (
          <>
            <span className="font-semibold">Units: </span>
            {getUnitsFromRange(course.units)}
          </>
        )}
        {course.ges.length > 0 && (
          <>
            <span className="font-semibold ml-2">GE: </span>
            {course.ges.toString()}
          </>
        )}
      </div>
    </>
  );
}
