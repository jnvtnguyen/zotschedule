import { CourseScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { RemoveEventButton } from "@/lib/components/schedule/schedule-actions-panel/event/remove-event-button";
import { EventColorPicker } from "@/lib/components/schedule/schedule-actions-panel/event/event-color-picker";
import { SECTION_TYPE_TO_LABEL } from "@/lib/uci/offerings/types";

type ScheduleActionsPanelCourseEventsListCourseEventProps = {
  event: CourseScheduleCalendarEvent;
};

export function ScheduleActionsPanelCourseEventsListCourseEvent({
  event,
}: ScheduleActionsPanelCourseEventsListCourseEventProps) {
  return (
    <div
      className="p-2 text-white rounded-md flex flex-col justify-between"
      style={{ backgroundColor: event.color }}
    >
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
      <div className="flex justify-end gap-1">
        <EventColorPicker event={event} />
        <RemoveEventButton event={event} />
      </div>
    </div>
  );
}
