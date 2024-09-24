import { WebSocResponse } from "@/lib/uci/offerings/types";
import { CourseOfferingsSchool } from "./course-offerings-school";

type CourseOfferingsListProps = {
  offerings: WebSocResponse;
};

export function CourseOfferingsList({ offerings }: CourseOfferingsListProps) {
  return (
    <>
      {offerings.schools.map((school) => (
        <CourseOfferingsSchool key={school.name} school={school} />
      ))}
    </>
  );
}
