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
  EventReceiveArg,
  EventResizeDoneArg,
} from "@fullcalendar/interaction";
import { motion } from 'framer-motion';

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
import { Spinner } from "@phosphor-icons/react";

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
  const [isPrevious, setIsPrevious] = useState(false);
  const [isNext, setIsNext] = useState(false);
  const isNewEvent = selected?.extendedProps.event.id === "new";
  const queryClient = useQueryClient();
  const view = useScheduleCalendar((state) => state.view);
  const date = useScheduleCalendar((state) => state.date);
  const { isLoading } = useScheduleCalendarEvents(schedule.id);
  const showWeekends = useScheduleCalendar((state) => state.showWeekends);
  const events = useCalendarEvents(schedule.id, view, date);
  const ref = useRef<FullCalendar>(null);

  const reset = async (anchor?: HTMLDivElement, selected?: EventImpl) => {
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
    queueMicrotask(() => {
      if (ref.current) {
        ref.current.getApi().changeView(view);
      }
    });
  }, [view]);

  useEffect(() => {
    queueMicrotask(() => {
      if (ref.current) {
        const current = ref.current.getApi().getDate();
        ref.current.getApi().gotoDate(date);
        if (date < current) {
          setIsPrevious(true);
          setTimeout(() => {
            setIsPrevious(false);
          }, 1);
        }
        if (date > current) {
          setIsNext(true);
          setTimeout(() => {
            setIsNext(false);
          }, 1);
        }
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

  const onEventAction = (info: EventResizeDoneArg | EventReceiveArg | EventDropArg) => {
    const event = info.event.extendedProps.event as ScheduleCalendarEvent;
    queryClient.setQueryData(
      ["schedule-events", schedule.id],
      (events: ScheduleEvent[]) => {
        return events.map((e) => {
          console.log(info.event.start, info.event.end)
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
        <motion.div
          key={isPrevious ? "previous" : isNext ? "next" : "current"}
          className="w-full h-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
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
                return [];
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
            eventReceive={(info) => onEventAction(info)}
            eventDidMount={(info) => {
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
        </motion.div>
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

  if (props.isMirror) {
    return (
      <div className="flex flex-col">
        <p className="font-semibold text-[0.8rem]">
          {base.title === "" ? "(No Title)" : base.title}
        </p>
        <p className="text-xs">
          {format(base.start!, "hh:mm a")}
          {base.end ? ` - ${format(base.end!, "hh:mm a")} ` : ""}
        </p>
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
        <p className="text-xs">
          {format(base.start!, "hh:mm a")} -{" "}
          {format(base.end!, "hh:mm a")}, {extended.building}{" "}
          {extended.room}
        </p>
      </div>
    );
  }

  const height = extended.height;
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
        {format(base.start!, "hh:mm a")}
        {base.end ? ` - ${format(base.end, "hh:mm a")}` : ""}
      </p>
    </div>
  );
}
