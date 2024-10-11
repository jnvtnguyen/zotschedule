import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import {
  DateSelectArg,
  EventClickArg,
  EventContentArg,
} from "@fullcalendar/core";
import { EventImpl } from "@fullcalendar/core/internal";
import {
  addHours,
  addMinutes,
  format,
  roundToNearestHours,
  subMinutes,
} from "date-fns";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, {
  DateClickArg,
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
import { CustomScheduleEventRepeatability } from "@/lib/database/generated-types";
import { EventInfoPopover } from "./event-info-popover";

type ScheduleCalendarProps = {
  width: number;
};

const NEW_EVENT = (start: Date, end: Date) => ({
  id: "new",
  title: "",
  description: "",
  start: start,
  end: end,
  color: DEFAULT_EVENT_COLOR,
  repeatability: CustomScheduleEventRepeatability.NONE,
});

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
  const events = useCalendarEvents(schedule.id, view, date);
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
    let start = info.start;
    let end = info.end;
    queryClient.setQueryData(
      ["schedule-events", schedule.id],
      (events: ScheduleEvent[]) => {
        return [...events, NEW_EVENT(start, end)];
      },
    );
  };

  const onClick = (info: DateClickArg) => {
    let start = roundToNearestHours(info.date, { roundingMethod: "floor" });
    let end = addHours(start, 1);
    queryClient.setQueryData(
      ["schedule-events", schedule.id],
      (events: ScheduleEvent[]) => {
        return [...events, NEW_EVENT(start, end)];
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
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        ref={ref}
        events={events}
        allDaySlot={false}
        headerToolbar={false}
        slotMinTime={"02:00:00"}
        slotMaxTime={"25:00:00"}
        eventContent={EventContent}
        weekends={showWeekends}
        selectMinDistance={5}
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
        dateClick={onClick}
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
  const extended = props.event.extendedProps;
  const event = extended.event as ScheduleCalendarEvent;

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
          {format(props.event.start!, "hh:mm a")} - {format(props.event.end!, "hh:mm a")}, {extended.building}{" "}
          {extended.room}
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
      <p className="text-xs">
        {format(props.event.start!, "hh:mm a")} - {format(props.event.end!, "hh:mm a")}
      </p>
    </div>
  );
}
