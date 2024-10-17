import { CustomScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { getFormattedRange } from "@/lib/components/schedule/schedule-calendar";

type ScheduleActionsPanelEventsListCustomEventContentProps = {
  event: CustomScheduleCalendarEvent;
}


export function ScheduleActionsPanelEventsListCustomEventContent({
  event,
}: ScheduleActionsPanelEventsListCustomEventContentProps) {
  const range = getFormattedRange(event.start, event.end);

  return (
    <div>
      <h3 className="text-md font-semibold">{event.title}</h3>
      <p className="text-sm italic">
        {range.start} - {range.end}
      </p>
    </div>
  );
}
