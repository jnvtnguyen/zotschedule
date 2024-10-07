import { WebSocSchool } from "@/lib/uci/offerings/types";
import { ScheduleActionsPanelOfferingDepartment } from "./offering-department";
import { ScheduleActionsPanelOfferingCollapsible } from "./offering-collapsible";

type ScheduleActionsPanelOfferingSchoolProps = {
  school: WebSocSchool;
};

export function ScheduleActionsPanelOfferingSchool({
  school,
}: ScheduleActionsPanelOfferingSchoolProps) {
  return (
    <div className="space-y-1">
      <ScheduleActionsPanelOfferingCollapsible
        title={school.name}
        comments={school.comment}
      />
      {school.departments.map((department) => (
        <ScheduleActionsPanelOfferingDepartment
          key={department.name}
          department={department}
        />
      ))}
    </div>
  );
}
