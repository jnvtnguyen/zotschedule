import React, { useEffect, useState } from "react";
import {
  Calendar,
  SlotInfo,
  dateFnsLocalizer,
  HeaderProps,
  Views,
  Event,
} from "react-big-calendar";
import withDragAndDrop, { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import enUS from "date-fns/locale/en-US";

import { useScheduleCalendar } from "@/lib/hooks/use-schedule-calendar";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { ScheduleEvent } from "@/lib/database/types";
import {
  DEFAULT_EVENT_COLOR,
  isCourseScheduleEvent,
} from "@/lib/uci/events/types";
import { ScheduleToolbar } from "./schedule-toolbar";
import { useCalendarEvents } from "./use-calendar-events";
import { NewEventPopover } from "./new-event-popover";

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    "en-US": enUS,
  },
});

const DragAndDropCalendar = withDragAndDrop(Calendar);

export function ScheduleCalendar() {
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }
  const queryClient = useQueryClient();
  const view = useScheduleCalendar((state) => state.view);
  const date = useScheduleCalendar((state) => state.date);
  const [newEvent, setNewEvent] = useState<{
    anchor: HTMLDivElement;
    event: Event;
  }>();
  const [isDragging, setIsDragging] = useState(false);
  const events = useCalendarEvents(schedule.id);

  const resetNewEvent = () => {
    setNewEvent(undefined);
    queryClient.setQueryData(
      ["schedule-events", schedule.id],
      (events: ScheduleEvent[]) => {
        return events.filter((event) => event.id !== "new");
      },
    );
  };

  const onSelectSlot = (slot: SlotInfo) => {
    if (newEvent) {
      resetNewEvent();
      if (slot.action !== "select") {
        return;
      }
    }
    queryClient.setQueryData(
      ["schedule-events", schedule.id],
      (events: ScheduleEvent[]) => {
        return [
          ...events,
          {
            id: "new",
            start: slot.start,
            end: slot.end,
            color: DEFAULT_EVENT_COLOR,
            title: "",
          },
        ];
      },
    );
  };

  useEffect(() => {
    const newEvent = events.find((event) => event.resource.event.id === "new");
    if (newEvent) {
      setNewEvent({
        anchor: document.querySelector(
          ".rbc-event.new-event",
        ) as HTMLDivElement,
        event: newEvent,
      });
    }
  }, [events]);

  const onEventDrop = (data: EventInteractionArgs<Event>) => {
    setIsDragging(false);
    if (data.event.resource.event.id === "new") {
      queryClient.setQueryData(
        ["schedule-events", schedule.id],
        (events: ScheduleEvent[]) => {
          return events.map((event) => {
            if (event.id === "new") {
              return {
                ...event,
                start: data.start,
                end: data.end,
              };
            }
            return event;
          });
        },
      );
    }
  };

  const onEventResize = (data: EventInteractionArgs<Event>) => {
    setIsDragging(false);
    if (data.event.resource.event.id === "new") {
      queryClient.setQueryData(
        ["schedule-events", schedule.id],
        (events: ScheduleEvent[]) => {
          return events.map((event) => {
            if (event.id === "new") {
              return {
                ...event,
                start: data.start,
                end: data.end,
              };
            }
            return event;
          });
        },
      );
    }
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  return (
    <div className="flex flex-col w-full h-full space-y-2">
      <ScheduleToolbar />
      <DragAndDropCalendar
        date={date}
        events={events}
        formats={{
          timeGutterFormat: "h a",
        }}
        localizer={localizer}
        toolbar={false}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        view={view}
        min={new Date(0, 0, 0, 7, 0)}
        max={new Date(0, 0, 0, 23, 0)}
        eventPropGetter={(event: Event) => {
          return {
            style: {
              backgroundColor: event.resource.color,
            },
            className:
              event.resource.event.id === "new" ? "new-event" : undefined,
          };
        }}
        components={{
          week: {
            header: WeekHeader,
          },
          month: {
            header: MonthHeader,
          },
          //@ts-expect-error
          timeSlotWrapper: TimeSlotWrapper,
          event: EventComponent,
        }}
        onEventResize={onEventResize}
        onSelectSlot={onSelectSlot}
        draggableAccessor={(event: Event) => {
          if (isCourseScheduleEvent(event.resource.event)) {
            return false;
          }
          return true;
        }}
        resizableAccessor={(event: Event) => {
          if (isCourseScheduleEvent(event.resource.event)) {
            return false;
          }
          return true;
        }}
        selectable
        resizable={false}
        onDragStart={onDragStart}
        onEventDrop={onEventDrop}
      />
      {newEvent && (
        <NewEventPopover
          anchor={newEvent.anchor}
          event={newEvent.event}
          onClose={resetNewEvent}
          isDragging={isDragging}
        />
      )}
    </div>
  );
}

function EventComponent({ event }: { event: Event }) {
  return <div className="flex flex-col">{event.title}</div>;
}

function TextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-normal uppercase text-[0.84rem]">{children}</span>
  );
}

function MonthHeader(props: HeaderProps) {
  return (
    <TextWrapper>{props.localizer.format(props.date, "EEEE")}</TextWrapper>
  );
}

function WeekHeader(props: HeaderProps) {
  return (
    <TextWrapper>{props.localizer.format(props.date, "EEE d")}</TextWrapper>
  );
}

function TimeSlotWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TextWrapper>
      <div className="min-w-[65px]">{children}</div>
    </TextWrapper>
  );
}
