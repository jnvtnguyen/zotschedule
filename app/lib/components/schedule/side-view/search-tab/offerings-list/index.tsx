import { WebSocResponse } from "@/lib/uci/offerings/types";
import { SideViewOfferingSchool } from "./offering-school";

type SideViewOfferingsListProps = {
  offerings: WebSocResponse;
};

export function SideViewOfferingsList({
  offerings,
}: SideViewOfferingsListProps) {
  return (
    <div>
      {offerings.schools.map((school) => (
        <SideViewOfferingSchool key={school.name} school={school} />
      ))}
    </div>
  );
}
