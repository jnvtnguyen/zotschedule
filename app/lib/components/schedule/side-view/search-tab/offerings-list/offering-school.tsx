import { WebSocSchool } from "@/lib/uci/offerings/types";
import { SideViewOfferingDepartment } from "./offering-department";
import { SideViewOfferingCollapsible } from "./offering-collapsible";

type SideViewOfferingSchoolProps = {
  school: WebSocSchool;
};

export function SideViewOfferingSchool({
  school,
}: SideViewOfferingSchoolProps) {
  return (
    <div className="space-y-1">
      <SideViewOfferingCollapsible
        title={school.name}
        comments={school.comment}
      />
      {school.departments.map((department) => (
        <SideViewOfferingDepartment
          key={department.name}
          department={department}
        />
      ))}
    </div>
  );
}
