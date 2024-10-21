import { useEffect, useState } from "react";
import { createServerFn } from "@tanstack/start";
import { format, isEqual } from "date-fns";
import { EventImpl } from "@fullcalendar/core/internal";
import { EventApi } from "@fullcalendar/core";
import { DotFilledIcon } from "@radix-ui/react-icons";
import { Frequency } from "rrule";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { FREQUENCY_TO_LABEL } from "@/lib/uci/events/types";
import {
  isCourseScheduleCalendarEvent,
  ScheduleCalendarEvent,
  useScheduleCalendarCustomEvents,
} from "@/lib/hooks/use-schedule-calendar-events";
import { SECTION_TYPE_TO_LABEL } from "@/lib/uci/offerings/types";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { EventPopover, EventPopoverProps } from "./event-popover";
import { EventColorPicker } from "./schedule-actions-panel/event/event-color-picker";
import { RemoveEventButton } from "./schedule-actions-panel/event/remove-event-button";
import { RRULE_DAYS_TO_LABEL } from "./use-calendar-events";
import { EditEventButton } from "./edit-event-button";
import { Button } from "@/lib/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { database } from "@/lib/database";
import { CourseScheduleEvent } from "@/lib/database/types";

const setDeclineStatus = createServerFn(
  "POST",
  async ({
    event,
    declined,
    start,
  }: {
    event: ScheduleCalendarEvent;
    declined: boolean;
    start: Date;
  }) => {
    const updates = declined
      ? // @ts-expect-error
        event.declined.concat(start)
      : // @ts-expect-error
        event.declined.filter((date) => date !== start);

    if (isCourseScheduleCalendarEvent(event)) {
      await database
        .updateTable("courseScheduleEvents")
        .where("id", "=", event.id)
        .set({
          declined: updates,
        })
        .executeTakeFirstOrThrow();
    } else {
      await database
        .updateTable("customScheduleEvents")
        .where("id", "=", event.id)
        .set({
          declined: updates,
        })
        .executeTakeFirstOrThrow();
    }
  },
);

export type EventInfoPopoverProps = Omit<
  EventPopoverProps,
  "title" | "children" | "anchor"
> & {
  event: EventImpl | EventApi;
};

export function EventInfoPopover({
  event: base,
  onClose,
  isDragging,
}: EventInfoPopoverProps) {
  const schedule = useSchedule((state) => state.schedule);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  if (!schedule) {
    return;
  }
  const event = base.extendedProps.event as ScheduleCalendarEvent;
  const isCourseEvent = isCourseScheduleCalendarEvent(event);
  const events = useScheduleCalendarCustomEvents(schedule.id);
  const selector = `.event-${event.id}-${base.extendedProps.occurence}`;
  const [anchor, setAnchor] = useState(
    document.querySelector(selector)?.parentElement as HTMLDivElement,
  );
  const setDeclinedStatusMutation = useMutation<{
    event: ScheduleCalendarEvent;
    declined: boolean;
  }, unknown, {
    event: ScheduleCalendarEvent;
    declined: boolean;
  }>({
    mutationFn: async ({
      event,
      declined,
    }) => {
      await setDeclineStatus({
        event: event,
        declined: declined,
        start: base.start!,
      });
      return {
        event,
        declined
      };
    },
    onMutate: async ({
      event,
      declined
    }) => {
      onClose();
      queryClient.setQueryData(
        ["schedule-course-events", schedule.id],
        (events: CourseScheduleEvent[]) => {
          return events.map((e) => {
            if (e.id === event.id) {
              return {
                ...e,
                declined: declined
                  // @ts-expect-error
                  ? e.declined.concat(base.start!)
                  // @ts-expect-error
                  : e.declined.filter((date) => !isEqual(date, base.start!)),
              };
            }
            return e;
          })
        }
      );
    },
    onError: () => {
      toast({
        title: "Uh oh! Something went wrong.",
        description:
          "Something went wrong while trying to change the declined status.",
        variant: "destructive",
      });
    },
    onSuccess: async ({ declined, event }) => {
      if (isCourseScheduleCalendarEvent(event)) {
        toast({
          description: `Going to "${event.info.department.code} ${event.info.course.number} ${SECTION_TYPE_TO_LABEL[event.info.section.type]}" has been ${declined ? "declined" : "accepted"}.`,
        });
      } else {
        toast({
          description: `Going to "${event.title}" has been ${declined ? "declined" : "accepted"}.`,
        });
      }
    },
    onSettled: async (data) => {
      if (data) {
        if (isCourseScheduleCalendarEvent(data.event)) {
          await queryClient.invalidateQueries({
            queryKey: ["schedule-course-events", schedule.id],
          });
        } else {
          await queryClient.invalidateQueries({
            queryKey: ["schedule-custom-events", schedule.id],
          });
        }
        return;
      }
      await queryClient.invalidateQueries({
        queryKey: ["schedule-course-events", schedule.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["schedule-custom-events", schedule.id],
      });
    },
  })

  useEffect(() => {
    setAnchor(
      document.querySelector(selector)?.parentElement as HTMLDivElement,
    );
  }, [events.data]);

  const footer = () => {
    if (!base.extendedProps.frequency) {
      return;
    }

    // @ts-expect-error
    const declined = event.declined.some((date) => isEqual(date, base.start!));
    return (
      <div className="flex flex-row justify-between items-center px-4 py-2">
        <p className="text-sm">Going?</p>
        <div className="flex flex-row gap-2">
          <Button
            size="sm"
            variant={declined ? "outline" : "default"}
            onClick={() => {
              if (declined) {
                setDeclinedStatusMutation.mutate({
                  event: event,
                  declined: false,
                });
              }
            }}
          >
            Yes
          </Button>
          <Button
            size="sm"
            variant={!declined ? "outline" : "default"}
            onClick={() => {
              if (!declined) {
                setDeclinedStatusMutation.mutate({
                  event: event,
                  declined: true,
                });
              }
            }}
          >
            No
          </Button>
        </div>
      </div>
    );
  };

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
      footer={footer()}
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
          {!isCourseEvent && <EditEventButton event={event} />}
          <RemoveEventButton event={event} onRemove={onClose} />
        </div>
      </div>
    </EventPopover>
  );
}
