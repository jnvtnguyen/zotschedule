import { WebSocSection } from "@/lib/uci/offerings/types";
import { TableCell, TableRow } from "@/lib/components/ui/table";
import { CourseOfferingsSectionStatus } from "./course-offerings-section-status";
import { CourseOfferingsSectionRestrictions } from "./course-offerings-section-restrictions";
import { CourseOfferingsSectionEnrollment } from "./course-offerings-section-enrollment";
import { CourseOfferingsSectionInstructors } from "./course-offerings-section-instructors";

type CourseOfferingsSectionProps = {
  section: WebSocSection;
};

export function CourseOfferingsSection({
  section,
}: CourseOfferingsSectionProps) {
  return (
    <TableRow>
      <TableCell>{section.code}</TableCell>
      <TableCell>{section.type}</TableCell>
      <TableCell>
        <CourseOfferingsSectionInstructors instructors={section.instructors} />
      </TableCell>
      <TableCell>
        {section.meetings.map((meeting) => (
          <div key={meeting.days}>
            {meeting.days} {meeting.time}
          </div>
        ))}
      </TableCell>
      <TableCell>
        {section.meetings.map((meeting) => (
          <div key={meeting.building}>
            {meeting.building} {meeting.room}
          </div>
        ))}
      </TableCell>
      <TableCell>
        <CourseOfferingsSectionEnrollment enrollment={section.enrollment} />
      </TableCell>
      <TableCell>
        <CourseOfferingsSectionRestrictions
          restrictions={section.restrictions}
        />
      </TableCell>
      <TableCell>
        <CourseOfferingsSectionStatus status={section.status} />
      </TableCell>
    </TableRow>
  );
}
