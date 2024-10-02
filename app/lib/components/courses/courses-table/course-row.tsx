import { Course } from "@/lib/database/types";
import { Link } from "@tanstack/react-router";

import { getUnitsFromRange } from "@/lib/uci/courses";

type CourseRowProps = {
  course: Course;
};

export function CourseRow({ course }: CourseRowProps) {
  return (
    <div className="flex flex-col items-start gap-2 border p-3 text-left text-sm">
      <div className="flex w-full flex-col gap-1">
        <Link to={`/courses/${course.id}`}>
          <h1 className="text-lg flex lg:items-center lg:flex-row lg:gap-2 flex-col gap-0">
            <p className="font-semibold">
              ({course.department.code} {course.number})
            </p>
            {course.title}
          </h1>
        </Link>
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
              <span className="ml-2 font-semibold">GE: </span>
              {course.ges.toString()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
