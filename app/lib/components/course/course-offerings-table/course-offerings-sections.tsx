import { WebSocSection } from "@/lib/uci/offerings/types";
import { CourseOfferingsSection } from "./course-offerings-section";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/components/ui/table";

type CourseOfferingsSectionProps = {
  sections: WebSocSection[];
};

export function CourseOfferingsSections({
  sections,
}: CourseOfferingsSectionProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Instructors</TableHead>
            <TableHead>Times</TableHead>
            <TableHead>Places</TableHead>
            <TableHead>Enrollment</TableHead>
            <TableHead>Restrictions</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => (
            <CourseOfferingsSection key={section.code} section={section} />
          ))}
        </TableBody>
      </Table>
    </>
  );
}
