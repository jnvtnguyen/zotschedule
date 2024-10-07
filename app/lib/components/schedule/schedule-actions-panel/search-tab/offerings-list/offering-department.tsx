import { WebSocDepartment } from "@/lib/uci/offerings/types";
import { ScheduleActionsPanelOfferingCollapsible } from "./offering-collapsible";
import { ScheduleActionsPanelOfferingCourse } from "./offering-course";

type ScheduleActionsPanelOfferingDepartmentProps = {
  department: WebSocDepartment;
};

export function ScheduleActionsPanelOfferingDepartment({
  department,
}: ScheduleActionsPanelOfferingDepartmentProps) {
  return (
    <div className="space-y-1">
      <ScheduleActionsPanelOfferingCollapsible
        title={department.name}
        comments={department.comment}
      />
      {department.courses.map((course, index) => (
        <ScheduleActionsPanelOfferingCourse
          key={index}
          course={course}
          department={department}
        />
      ))}
    </div>
  );
}
