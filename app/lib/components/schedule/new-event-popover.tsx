import { useEffect, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { EventImpl } from "@fullcalendar/core/internal";
import { EventApi } from "@fullcalendar/core";
import { isSameDay, isSameMonth, isSameWeek } from "date-fns";

import { useSchedule } from "@/lib/hooks/use-schedule";
import {
  CustomScheduleCalendarEvent,
  ScheduleCalendarEvent,
  useScheduleCalendarCustomEvents,
} from "@/lib/hooks/use-schedule-calendar-events";
import { useScheduleCalendar } from "@/lib/components/schedule/context";
import { NewEventForm } from "./new-event-form";
import { EventPopover, EventPopoverProps } from "./event-popover";

type NewEventPopoverProps = Omit<
  EventPopoverProps,
  "title" | "children" | "anchor"
> & {
  event: EventImpl | EventApi;
};

export function NewEventPopover({
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
  const editing = useScheduleCalendar((state) => state.editing);
  const events = useScheduleCalendarCustomEvents(schedule.id);
  const selector = `.event-${event.extendedProps.event.id}-${event.extendedProps.occurence}`;
  const [anchor, setAnchor] = useState(
    document.querySelector(selector)?.parentElement as HTMLDivElement,
  );

  useEffect(() => {
    setAnchor(
      document.querySelector(selector)?.parentElement as HTMLDivElement,
    );
  }, [events.data]);

  const onEventChange = ({
    start,
    ...rest
  }: Partial<CustomScheduleCalendarEvent>) => {
    if (start) {
      queryClient.setQueryData(
        ["schedule-custom-events", schedule.id],
        (events: ScheduleCalendarEvent[]) => {
          return events.map((e) => {
            if (e.id === event.extendedProps.event.id) {
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
        ["schedule-custom-events", schedule.id],
        (events: ScheduleCalendarEvent[]) => {
          return events.map((e) => {
            if (e.id === event.extendedProps.event.id) {
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
      title={editing ? "Edit Event" : "New Event"}
      onClose={onClose}
      isDragging={isDragging}
    >
      <NewEventForm
        event={event.extendedProps.event}
        schedule={schedule}
        onEventChange={onEventChange}
        onClose={onClose}
      />
    </EventPopover>
  );
}
