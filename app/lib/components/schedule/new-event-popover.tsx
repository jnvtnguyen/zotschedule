import { useQueryClient } from "@tanstack/react-query";
import { EventImpl } from "@fullcalendar/core/internal";
import { isSameDay, isSameMonth, isSameWeek } from "date-fns";

import { useSchedule } from "@/lib/hooks/use-schedule";
import {
  CustomScheduleCalendarEvent,
  ScheduleCalendarEvent,
} from "@/lib/hooks/use-schedule-calendar-events";
import { useScheduleCalendar } from "@/lib/hooks/use-schedule-calendar";
import { NewEventForm } from "./new-event-form";
import { EventPopover, EventPopoverProps } from "./event-popover";

type NewEventPopoverProps = Omit<EventPopoverProps, "title" | "children"> & {
  event: EventImpl;
};

export function NewEventPopover({
  anchor,
  event,
  onClose,
  isDragging,
}: NewEventPopoverProps) {
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }
  const queryClient = useQueryClient();
  const view = useScheduleCalendar((state) => state.view);
  const date = useScheduleCalendar((state) => state.date);
  const setDate = useScheduleCalendar((state) => state.setDate);

  const onEventChange = ({
    start,
    ...rest
  }: Partial<CustomScheduleCalendarEvent>) => {
    if (start) {
      queryClient.setQueryData(
        ["schedule-events", schedule.id],
        (events: ScheduleCalendarEvent[]) => {
          return events.map((e) => {
            if (e.id === "new") {
              return {
                ...e,
                start,
              };
            }
            return e;
          });
        },
      );

      if (view === "timeGridDay" && !isSameDay(date, start)) {
        setDate(start);
      } else if (view === "timeGridWeek" && !isSameWeek(date, start)) {
        setDate(start);
      } else if (view === "dayGridMonth" && !isSameMonth(date, start)) {
        setDate(start);
      }
    }
    if (rest) {
      queryClient.setQueryData(
        ["schedule-events", schedule.id],
        (events: ScheduleCalendarEvent[]) => {
          return events.map((e) => {
            if (e.id === "new") {
              return {
                ...e,
                ...rest,
              };
            }
            return e;
          });
        },
      );
    }
  };

  return (
    <EventPopover
      anchor={anchor}
      title="Create Event"
      onClose={onClose}
      isDragging={isDragging}
    >
      <NewEventForm
        event={event}
        schedule={schedule}
        onEventChange={onEventChange}
        onClose={onClose}
      />
    </EventPopover>
  );
}
