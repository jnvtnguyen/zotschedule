import React from "react";

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
  Actions?: React.ComponentType<{ section: WebSocSection }>;
};

export function CourseOfferingsSections({
  sections,
  Actions,
}: CourseOfferingsSectionProps) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {Actions && <TableHead className="w-[4%]"></TableHead>}
            <TableHead className="w-[6%]">Code</TableHead>
            <TableHead className="w-[8%]">Type</TableHead>
            <TableHead className="w-[15%]">Instructors</TableHead>
            <TableHead className="w-[12%]">Times</TableHead>
            <TableHead className="w-[12%]">Places</TableHead>
            <TableHead className="w-[10%]">Enrollment</TableHead>
            <TableHead className="w-[4%]">Restrictions</TableHead>
            <TableHead className="w-[10%]">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => (
            <CourseOfferingsSection
              key={section.code}
              section={section}
              Actions={Actions}
            />
          ))}
        </TableBody>
      </Table>
    </>
  );
}
