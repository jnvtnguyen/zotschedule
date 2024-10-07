import { useEffect, useState } from "react";
import { Event } from "react-big-calendar";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "@phosphor-icons/react";
import {
  autoPlacement,
  autoUpdate,
  offset,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";
import { isSameDay, isSameMonth, isSameWeek } from "date-fns";

import { Button } from "@/lib/components/ui/button";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { ScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { NewEventForm } from "./new-event-form";
import { useScheduleCalendar } from "@/lib/hooks/use-schedule-calendar";

type NewEventPopoverProps = {
  anchor: HTMLDivElement;
  event: Event;
  onClose: () => void;
  isDragging: boolean;
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
  const [isOpen, setIsOpen] = useState(true);
  const { refs, floatingStyles, context, update } = useFloating({
    strategy: "fixed",
    elements: {
      reference: anchor,
    },
    middleware: [
      offset({
        mainAxis: 5,
      }),
      autoPlacement({
        crossAxis: true,
        boundary: document.querySelector(".rbc-calendar") as HTMLElement,
      })
    ],
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context, {
    outsidePress: (e: MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest(".rbc-event.new-event") ||
          e.target.closest(".rbc-time-view") ||
          e.target.closest(".rbc-month-view"))
      ) {
        return false;
      }
      onClose();
      return true;
    },
  });
  const { getFloatingProps } = useInteractions([dismiss]);
  const { isMounted, styles } = useTransitionStyles(context);

  useEffect(() => {
    refs.setReference(anchor);
    update();
  }, [anchor]);

  const view = useScheduleCalendar((state) => state.view);
  const date = useScheduleCalendar((state) => state.date);
  const setDate = useScheduleCalendar((state) => state.setDate);

  const onEventChange = ({
    title,
    start,
    end
  }: Partial<Event>) => {
    if (start && end) {
      queryClient.setQueryData(
        ["schedule-events", schedule.id],
        (events: ScheduleCalendarEvent[]) => {
          console.log(events)
          return events.map((e) => {
            if (e.id === "new") {
              return {
                ...e,
                start,
                end,
              };
            }
            return e;
          });
        },
      );

      if (view === "day" && !isSameDay(date, start)) {
        setDate(start);
      } else if (view === "week" && !isSameWeek(date, start)) {
        setDate(start);
      } else if (view === "month" && !isSameMonth(date, start)) {
        setDate(start);
      }
    }
    if (title !== undefined) {
      queryClient.setQueryData(
        ["schedule-events", schedule.id],
        (events: ScheduleCalendarEvent[]) => {
          return events.map((e) => {
            if (e.id === "new") {
              return {
                ...e,
                title,
              };
            }
            return e;
          });
        },
      );
    }
  };

  if (!isOpen || isDragging || !isMounted) {
    return;
  }

  return (
    <div
      ref={refs.setFloating}
      style={{
        ...floatingStyles,
        ...styles,
      }}
      {...getFloatingProps()}
      className="z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none w-80"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h3>Create Event</h3>
          <Button
            variant="ghost"
            size="icon"
            className="w-5 h-5"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
        <NewEventForm
          event={event}
          onEventChange={onEventChange}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
