import { CourseScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { SECTION_TYPE_TO_LABEL } from "@/lib/uci/offerings/types";

type ScheduleActionsPanelEventsListCourseEventContentProps = {
  event: CourseScheduleCalendarEvent;
};

export function ScheduleActionsPanelEventsListCourseEventContent({
  event,
}: ScheduleActionsPanelEventsListCourseEventContentProps) {
  return (
    <div>
      <h3 className="text-md font-semibold">
        {SECTION_TYPE_TO_LABEL[event.info.section.type]}
      </h3>
      <p className="text-sm italic">
        {event.info.section.meetings.map((meeting, index) => (
          <span key={`${event.info.section.code}-meeting-${index}`}>
            {meeting.days} {meeting.time} - {meeting.building} {meeting.room}
          </span>
        ))}
      </p>
    </div>
  );
}
