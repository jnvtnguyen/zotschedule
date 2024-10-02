import { WebSocDepartment } from "@/lib/uci/offerings/types";
import { SideViewOfferingCollapsible } from "./offering-collapsible";
import { SideViewOfferingCourse } from "./offering-course";

type SideViewOfferingDepartmentProps = {
  department: WebSocDepartment;
};

export function SideViewOfferingDepartment({
  department,
}: SideViewOfferingDepartmentProps) {
  return (
    <div className="space-y-1">
      <SideViewOfferingCollapsible
        title={department.name}
        comments={department.comment}
      />
      {department.courses.map((course, index) => (
        <SideViewOfferingCourse
          key={index}
          course={course}
          department={department}
        />
      ))}
    </div>
  );
}
