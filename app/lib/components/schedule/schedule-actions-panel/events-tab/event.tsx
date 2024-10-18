import { useState } from "react";
import { NotePencil } from "@phosphor-icons/react";

import { ScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { RemoveEventButton } from "@/lib/components/schedule/schedule-actions-panel/event/remove-event-button";
import { EventColorPicker } from "@/lib/components/schedule/schedule-actions-panel/event/event-color-picker";
import { isCourseScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { ScheduleActionsPanelEventsListCourseEventContent } from "./event-course-content";
import { ScheduleActionsPanelEventsListCustomEventContent } from "./event-custom-content";
import { Button } from "@/lib/components/ui/button";
import { EditEventDialog } from "./edit-event-dialog";

type ScheduleActionsPanelEventsListEventProps = {
  event: ScheduleCalendarEvent;
};

export function ScheduleActionsPanelEventsListEvent({
  event,
}: ScheduleActionsPanelEventsListEventProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isCourseEvent = isCourseScheduleCalendarEvent(event);

  return (
    <div
      className="p-2 text-white rounded-md flex flex-col justify-between"
      style={{ backgroundColor: event.color }}
    >
      {isCourseEvent ? (
        <ScheduleActionsPanelEventsListCourseEventContent event={event} />
      ) : (
        <ScheduleActionsPanelEventsListCustomEventContent event={event} />
      )}
      <div className="flex justify-end gap-1">
        <EventColorPicker event={event} />
        {!isCourseEvent && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <NotePencil className="w-5 h-5" />
          </Button>
        )}
        <RemoveEventButton event={event} />
      </div>
      {isEditing && !isCourseEvent && (
        <EditEventDialog
          event={event}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
