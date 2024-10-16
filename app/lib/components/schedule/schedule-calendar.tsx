import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import {
  DateSelectArg,
  DayHeaderContentArg,
  EventClickArg,
  EventContentArg,
  EventDropArg,
  SlotLabelContentArg,
} from "@fullcalendar/core";
import { EventImpl } from "@fullcalendar/core/internal";
import {
  addHours,
  format,
  isEqual,
  roundToNearestHours,
} from "date-fns";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin, {
  DateClickArg,
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import { Spinner } from "@phosphor-icons/react";
import { Controller, animated } from "@react-spring/web";

import { useScheduleCalendar } from "@/lib/hooks/use-schedule-calendar";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { ScheduleEvent } from "@/lib/database/types";
import { DEFAULT_EVENT_COLOR } from "@/lib/uci/events/types";
import { useCalendarEvents } from "./use-calendar-events";
import { NewEventPopover } from "./new-event-popover";
import {
  isCourseScheduleCalendarEvent,
  ScheduleCalendarEvent,
  useScheduleCalendarEvents,
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
  const [anchor, setAnchor] = useState<HTMLDivElement | undefined>();
  const [selected, setSelected] = useState<EventImpl | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const animations = new Controller({
    opacity: 0,
    transform: "translateY(10px)",
  })
  const isNewEvent = selected?.extendedProps.event.id === "new";
  const queryClient = useQueryClient();
  const view = useScheduleCalendar((state) => state.view);
  const date = useScheduleCalendar((state) => state.date);
  const showWeekends = useScheduleCalendar((state) => state.showWeekends);
  const { events, isLoading } = useCalendarEvents(schedule.id, view, date);
  const ref = useRef<FullCalendar>(null);

  const reset = async (anchor?: HTMLDivElement, selected?: EventImpl) => { 
    setAnchor(anchor);
    setSelected(selected); 
    if (isNewEvent) {
      queryClient.setQueryData(
        ["schedule-events", schedule.id],
        (events: ScheduleEvent[]) => {
          return events.filter((event) => event.id !== "new");
        },
      );
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      if (ref.current) {
        ref.current.getApi().changeView(view);
      }
    });
  }, [view]);

  useEffect(() => {
    queueMicrotask(() => {
      if (ref.current) {
        ref.current.getApi().gotoDate(date);
        animations.start({
          opacity: 1,
          transform: "translateY(0)",
        });
      }
    });
  }, [date]);

  useEffect(() => {
    queueMicrotask(() => {
      if (ref.current) {
        ref.current.getApi().updateSize();
      }
    });
  }, [width]);

  useEffect(() => {
    queueMicrotask(() => {
      if (ref.current) {
        ref.current.getApi().unselect();
      }
    });
  }, [isNewEvent]);

  useEffect(() => {
    animations.start({
      opacity: 1,
      transform: "translateY(0)",
    });
  }, [isLoading])

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

  const onEventAction = (info: EventResizeDoneArg | EventDropArg) => {
    const event = info.event.extendedProps.event as ScheduleCalendarEvent;
    queryClient.setQueryData(
      ["schedule-events", schedule.id],
      (events: ScheduleEvent[]) => {
        return events.map((e) => {
          if (e.id === event.id && !isCourseScheduleCalendarEvent(event)) {
            return {
              ...e,
              start: info.event.start,
              end: isEqual(event.start, event.end) ? info.event.start : info.event.end,
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
    reset(info.el.parentElement as HTMLDivElement, info.event);
  };

  return (
    <div className="flex flex-col w-full h-full space-y-2">
      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <Spinner className="w-10 h-10 animate-spin" />
        </div>
      ) : (
        <animated.div className="w-full h-full" style={animations.springs}>
          <FullCalendar
            height="100%"
            initialDate={date}
            initialView={view}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            ref={ref}
            events={events}
            allDaySlot={false}
            headerToolbar={false}
            eventContent={EventContent}
            weekends={showWeekends}
            selectMinDistance={5}
            selectMirror={true}
            slotDuration={{
              hours: 1
            }}
            snapDuration={{
              minutes: 15,
            }}
            slotMinTime={{
              hours: 2
            }}
            slotMaxTime={{
              hours: 26
            }}
            expandRows={true}
            selectable={!anchor}
            editable={true}
            droppable={true}
            select={onSelect}
            dateClick={onClick}
            eventClick={onEventClick}
            eventClassNames={(event) => {
              if (event.isDragging) {
                return ["dragging"];
              }
              if (event.isMirror) {
                return ["mirror"];
              }
              if (event.event.extendedProps.event.id === "new") {
                return ["new-event"];
              }
              return [];
            }}
            eventResizeStart={() => setIsDragging(true)}
            eventResizeStop={() => {
              setIsDragging(false);
              setAnchor(
                document.querySelector(".fc-event.new-event")?.parentElement as HTMLDivElement,
              );
            }}
            eventResize={(info) => onEventAction(info)}
            eventDragStart={() => setIsDragging(true)}
            eventDragStop={() => {
              setIsDragging(false);
              setAnchor(
                document.querySelector(".fc-event.new-event")?.parentElement as HTMLDivElement,
              );
            }}
            eventDrop={(info) => onEventAction(info)}
            eventDidMount={(info) => {
              info.event.setExtendedProp("height", info.el.clientHeight);
              setTimeout(() => {
                info.event.setExtendedProp("height", info.el.clientHeight);
              }, 1);
              if (info.isMirror) {
                return;
              }
              const event = info.event.extendedProps.event as ScheduleCalendarEvent;
              if (event.id === "new") {
                setAnchor(info.el.parentElement as HTMLDivElement);
                setSelected(info.event);
                return;
              }
              if (event.id === selected?.extendedProps.event.id) {
                setAnchor(info.el.parentElement as HTMLDivElement);
                setSelected(info.event);
              }
            }}
            dayHeaderContent={DayHeaderContent}
            slotLabelContent={SlotLabelContent}
          />
        </animated.div>
      )}
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

const getFormattedRange = (start: Date, end: Date | null) => {
  const formatted = {
    start: '',
    end: ''
  }

  const meridiems = {
    start: format(start, 'a'),
    end: end ? format(end, 'a') : ''
  };

  if (start.getMinutes() === 0) {
    if (meridiems.start === meridiems.end) {
      formatted.start = format(start, 'h');
    } else {
      formatted.start = format(start, "h a");
    }
  } else {
    if (meridiems.start === meridiems.end) {
      formatted.start = format(start, "h:mm");
    } else {
      formatted.start = format(start, "h:mm a");
    }
  }

  if (!end) {
    return formatted;
  }

  if (end.getMinutes() === 0) {
    formatted.end = format(end, "h a");
  } else {
    formatted.end = format(end, "h:mm a");
  }

  return formatted;
}

function SlotLabelContent(props: SlotLabelContentArg) {
  return <p className="text-[0.8rem]">{format(props.date, "hh:mm a")}</p>;
}

function DayHeaderContent(props: DayHeaderContentArg) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-[0.8rem]">{format(props.date, "EEEE")}</p>
      <p className="text-[0.8rem]">{format(props.date, "d")}</p>
    </div>
  );
}

function EventContent(props: EventContentArg) {
  const base = props.event;
  const extended = props.event.extendedProps;
  const event = extended.event as ScheduleCalendarEvent;
  const formatted = getFormattedRange(base.start!, base.end);
  const height = props.isMirror ?
    document.querySelector(".fc-event-mirror")?.clientHeight : 
    base.extendedProps.height

  const classes = {
    container: cn("flex flex-col", {
      "flex-row gap-1 w-full": height < 30
    }),
    title: cn("font-semibold text-[0.8rem] truncate", {
      "text-xs": height < 40,
      "text-[0.64rem]": height < 20
    }),
  }

  const content = {
    title: height < 30 ? (
      <p className={classes.title}>
        {base.title === "" ? "(No Title)" : base.title}, {" "}
        {formatted.start}
        {base.end ? ` - ${formatted.end}` : ""}
      </p>
    ) : (
      <>
        <p className={classes.title}>
          {base.title === "" ? "(No Title)" : base.title}
        </p>
        <p className="text-xs">
          {formatted.start}
          {base.end ? ` - ${formatted.end}` : ""}
        </p> 
      </>
    )
  };

  if (props.isMirror) {
    return (
      <div className={classes.container}>
        {content.title}
      </div>
    );
  }

  if (isCourseScheduleCalendarEvent(event)) {
    return (
      <div className="flex flex-col">
        <div className="flex flex-row items-center justify-between text-[0.8rem]">
          <p className="font-semibold">
            {event.info.department.code} {event.info.course.number}
          </p>
          <p>{event.info.section.type}</p>
        </div>
        <p className="text-xs truncate">
          {formatted.start} -{" "}
          {formatted.end}, {extended.building}{" "}
          {extended.room}
        </p>
      </div>
    );
  }

  return (
    <div
      className={classes.container}
    >
      {content.title}
    </div>
  );
}
