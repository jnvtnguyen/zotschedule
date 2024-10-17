import { format } from "date-fns";
import { EventImpl } from "@fullcalendar/core/internal";
import { EventApi } from "@fullcalendar/core";
import { DotFilledIcon } from "@radix-ui/react-icons";
import { Frequency } from "rrule";

import { FREQUENCY_TO_LABEL } from "@/lib/uci/events/types";
import {
  isCourseScheduleCalendarEvent,
  ScheduleCalendarEvent,
} from "@/lib/hooks/use-schedule-calendar-events";
import { SECTION_TYPE_TO_LABEL } from "@/lib/uci/offerings/types";
import { EventPopover, EventPopoverProps } from "./event-popover";
import { EventColorPicker } from "./schedule-actions-panel/event/event-color-picker";
import { RemoveEventButton } from "./schedule-actions-panel/event/remove-event-button";
import { RRULE_DAYS_TO_LABEL } from "./use-calendar-events";
import { EditEventButton } from "./edit-event-button";

export type EventInfoPopoverProps = Omit<
  EventPopoverProps,
  "title" | "children"
> & {
  event: EventImpl | EventApi;
};

export function EventInfoPopover({
  anchor,
  event: base,
  onClose,
  isDragging,
}: EventInfoPopoverProps) {
  const event = base.extendedProps.event as ScheduleCalendarEvent;
  const isCourseEvent = isCourseScheduleCalendarEvent(event);

  return (
    <EventPopover
      anchor={anchor}
      onClose={onClose}
      isDragging={isDragging}
      title={
        isCourseEvent
          ? `${event.info.department.code} ${event.info.course.number} ${SECTION_TYPE_TO_LABEL[event.info.section.type]}`
          : event.title
      }
    >
      <div className="flex flex-col">
        <div className="flex flex-row gap-1 items-center">
          <p className="text-xs">{format(base.start!, "EEEE, MMMM d")}</p>
          <DotFilledIcon className="w-3 h-3" />
          <p className="text-xs">
            {format(base.start!, "h:mm a")}
            {base.end ? ` - ${format(base.end!, "h:mm a")}` : ""}
          </p>
        </div>
        {base.extendedProps.frequency && (
          <p className="text-xs">
            {FREQUENCY_TO_LABEL[base.extendedProps.frequency as Frequency]}
            {base.extendedProps.days?.length
              ? ` on ${base.extendedProps.days.map((day: number) => RRULE_DAYS_TO_LABEL[day]).join(", ")}`
              : ""}
            {base.extendedProps.until
              ? ` until ${format(base.extendedProps.until, "EEEE, MMMM d")}`
              : ""}
          </p>
        )}
      </div>
      <div>
        {isCourseEvent && (
          <div className="flex flex-col text-[0.84rem]">
            <p>
              Location: {base.extendedProps.building} {base.extendedProps.room}
            </p>
            <p>Instructors: {event.info.section.instructors.join(", ")}</p>
          </div>
        )}
        <div className="flex flex-row justify-end items-center">
          <EventColorPicker event={event} icon="circle" />
          {!isCourseEvent && (
            <EditEventButton event={event} />
          )}
          <RemoveEventButton event={event} onRemove={onClose} /> 
        </div>
      </div>
    </EventPopover>
  );
}
