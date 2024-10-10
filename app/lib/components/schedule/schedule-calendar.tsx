import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { EventImpl } from "@fullcalendar/core/internal";
import { addMinutes, subMinutes } from "date-fns";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, {
  EventReceiveArg,
  EventResizeDoneArg,
} from "@fullcalendar/interaction";

import { useScheduleCalendar } from "@/lib/hooks/use-schedule-calendar";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { ScheduleEvent } from "@/lib/database/types";
import { DEFAULT_EVENT_COLOR } from "@/lib/uci/events/types";
import { useCalendarEvents } from "./use-calendar-events";
import { NewEventPopover } from "./new-event-popover";
import {
  isCourseScheduleCalendarEvent,
  ScheduleCalendarEvent,
} from "@/lib/hooks/use-schedule-calendar-events";
import { cn } from "@/lib/utils/style";
import { EventInfoPopover } from "./event-info-popover";

type ScheduleCalendarProps = {
  width: number;
};

export function ScheduleCalendar({ width }: ScheduleCalendarProps) {
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }
  const [anchor, setAnchor] = useState<HTMLAnchorElement | undefined>();
  const [selected, setSelected] = useState<EventImpl | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const isNewEvent = selected?.extendedProps.event.id === "new";
  const queryClient = useQueryClient();
  const view = useScheduleCalendar((state) => state.view);
  const date = useScheduleCalendar((state) => state.date);
  const showWeekends = useScheduleCalendar((state) => state.showWeekends);
  const events = useCalendarEvents(schedule.id);
  const ref = useRef<FullCalendar>(null);

  const reset = async (anchor?: HTMLAnchorElement, selected?: EventImpl) => {
    if (isNewEvent) {
      queryClient.setQueryData(
        ["schedule-events", schedule.id],
        (events: ScheduleEvent[]) => {
          return events.filter((event) => event.id !== "new");
        },
      );
    }
    setAnchor(anchor);
    setSelected(selected);
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.getApi().changeView(view);
    }
  }, [view]);

  useEffect(() => {
    if (ref.current) {
      ref.current.getApi().gotoDate(date);
    }
  }, [date]);

  useEffect(() => {
    if (ref.current) {
      ref.current.getApi().updateSize();
    }
  }, [width]);

  const onSelect = (info: DateSelectArg) => {
    if (selected) {
      reset();
      return;
    }
    let start = info.start;
    let end = info.end;
    if (subMinutes(info.end, 15).getTime() === info.start.getTime()) {
      start = info.start;
      end = addMinutes(info.end, 45);
    }
    queryClient.setQueryData(
      ["schedule-events", schedule.id],
      (events: ScheduleEvent[]) => {
        return [
          ...events,
          {
            id: "new",
            title: "",
            description: "",
            start: start,
            end: end,
            color: DEFAULT_EVENT_COLOR,
          },
        ];
      },
    );
  };

  const onEventAction = (info: EventResizeDoneArg | EventReceiveArg) => {
    const event = info.event.extendedProps.event as ScheduleCalendarEvent;
    queryClient.setQueryData(
      ["schedule-events", schedule.id],
      (events: ScheduleEvent[]) => {
        return events.map((e) => {
          if (e.id === event.id) {
            return {
              ...e,
              start: info.event.start,
              end: info.event.end,
            };
          }
          return e;
        });
      },
    );
  };

  const onEventClick = (info: EventClickArg) => {
    const event = info.event.extendedProps.event as ScheduleCalendarEvent;
    if (event.id === "new") {
      return;
    }
    reset(info.el as HTMLAnchorElement, info.event);
  };

  return (
    <div className="flex flex-col w-full h-full space-y-2">
      <FullCalendar
        height="100%"
        initialDate={date}
        initialView={view}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        ref={ref}
        events={events}
        allDaySlot={false}
        headerToolbar={false}
        slotMinTime={"02:00:00"}
        slotMaxTime={"25:00:00"}
        timeZone="local"
        eventContent={EventContent}
        weekends={showWeekends}
        slotDuration={{
          hours: 1,
        }}
        snapDuration={{
          minutes: 15,
        }}
        expandRows={true}
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          omitZeroMinute: false,
          meridiem: "short",
        }}
        dayHeaderFormat={{
          weekday: "short",
          day: "2-digit",
          omitCommas: true,
        }}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          omitZeroMinute: false,
          meridiem: "short",
        }}
        selectable={!anchor}
        editable={true}
        droppable={true}
        select={onSelect}
        eventClick={onEventClick}
        eventClassNames={(event) => {
          if (event.event.extendedProps.event.id === "new") {
            return ["new-event"];
          }
          return [];
        }}
        eventResizeStart={() => setIsDragging(true)}
        eventResizeStop={() => {
          setIsDragging(false);
          setAnchor(
            document.querySelector(".fc-event.new-event") as HTMLAnchorElement,
          );
        }}
        eventResize={(info) => onEventAction(info)}
        eventDragStart={() => setIsDragging(true)}
        eventDragStop={() => {
          setIsDragging(false);
          setAnchor(
            document.querySelector(".fc-event.new-event") as HTMLAnchorElement,
          );
        }}
        eventReceive={(info) => onEventAction(info)}
        eventDidMount={(info) => {
          const event = info.event.extendedProps.event as ScheduleCalendarEvent;
          if (event.id === "new") {
            setAnchor(info.el as HTMLAnchorElement);
            setSelected(info.event);
            return;
          }
          if (event.id === selected?.extendedProps.event.id) {
            setAnchor(info.el as HTMLAnchorElement);
            setSelected(info.event);
          }
        }}
      />
      {anchor && selected && isNewEvent && (
        <NewEventPopover
          event={selected}
          anchor={anchor}
          isDragging={isDragging}
          onClose={reset}
        />
      )}
      {anchor && selected && !isNewEvent && (
        <EventInfoPopover
          event={selected}
          anchor={anchor}
          isDragging={isDragging}
          onClose={reset}
        />
      )}
    </div>
  );
}

function EventContent(props: EventContentArg) {
  const event = props.event.extendedProps.event as ScheduleCalendarEvent;

  if (isCourseScheduleCalendarEvent(event)) {
    return (
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-between text-[0.8rem]">
          <p className="font-semibold">
            {event.info.department.code} {event.info.course.number}
          </p>
          <p>{event.info.section.type}</p>
        </div>
        <p className="text-xs">
          {props.timeText}, {props.event.extendedProps.building}{" "}
          {props.event.extendedProps.room}
        </p>
      </div>
    );
  }

  const height = props.event.extendedProps.height;
  return (
    <div
      className={cn("flex flex-col", {
        "flex-row items-center gap-1": height < 30,
      })}
    >
      <p className="font-semibold text-[0.8rem]">
        {event.title === "" ? "(No Title)" : event.title}
      </p>
      <p className="text-xs">{props.timeText}</p>
    </div>
  );
}
