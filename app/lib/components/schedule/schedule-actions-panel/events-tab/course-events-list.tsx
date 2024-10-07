import { useMemo } from "react";

import { ScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { ScheduleActionsPanelCourseEventsListCourseEvent } from "./course-event";
import { Schedule } from "@/lib/database/types";
import { groupBy } from "@/lib/utils/general";
import { SECTION_TYPE_ORDER } from "@/lib/uci/offerings/types";
import { isCourseScheduleEvent } from "@/lib/uci/events/types";

type ScheduleActionsPanelCourseEventsListProps = {
  events: ScheduleCalendarEvent[];
  schedule: Schedule;
};

export function ScheduleActionsPanelCourseEventsList({
  events,
  schedule,
}: ScheduleActionsPanelCourseEventsListProps) {
  const grouped = useMemo(() => {
    return groupBy(
      events.filter((event) => isCourseScheduleEvent(event)),
      (event) => `${event.info.department.code} ${event.info.course.number}`,
    );
  }, [events]);

  return (
    <div className="flex flex-col space-y-2">
      {Object.entries(grouped).map(([course, events]) => {
        return (
          <div key={course} className="space-y-2">
            <div className="flex items-center space-x-2 text-lg">
              <p className="font-bold">{course}</p>
              <p>|</p>
              <p>{events[0].info.course.title}</p>
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
              {events
                .sort(
                  (a, b) =>
                    SECTION_TYPE_ORDER.indexOf(a.info.section.type) -
                    SECTION_TYPE_ORDER.indexOf(b.info.section.type),
                )
                .map((event) => (
                  <ScheduleActionsPanelCourseEventsListCourseEvent
                    key={event.id}
                    event={event}
                  />
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
