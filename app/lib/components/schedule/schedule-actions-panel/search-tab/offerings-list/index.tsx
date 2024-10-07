import { WebSocResponse } from "@/lib/uci/offerings/types";
import { ScheduleActionsPanelOfferingSchool } from "./offering-school";

type ScheduleActionsPanelOfferingsListProps = {
  offerings: WebSocResponse;
};

export function ScheduleActionsPanelOfferingsList({
  offerings,
}: ScheduleActionsPanelOfferingsListProps) {
  return (
    <div className="space-y-1">
      {offerings.schools.map((school) => (
        <ScheduleActionsPanelOfferingSchool key={school.name} school={school} />
      ))}
    </div>
  );
}
