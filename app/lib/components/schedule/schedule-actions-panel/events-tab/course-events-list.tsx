import { useMemo } from "react";

import { CourseScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { groupBy } from "@/lib/utils/general";
import { SECTION_TYPE_ORDER } from "@/lib/uci/offerings/types";
import { ScheduleActionsPanelEventsListEvent } from "./event";

type ScheduleActionsPanelCourseEventsListProps = {
  events: CourseScheduleCalendarEvent[];
};

export function ScheduleActionsPanelCourseEventsList({
  events,
}: ScheduleActionsPanelCourseEventsListProps) {
  if (events.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="max-w-xl text-center space-y-2">
          <h3 className="text-lg font-semibold">No Course Events</h3>
          <p className="text-sm">
            Looks like you haven't saved any course events yet. Search for a
            course in the search tab above and add it to your schedule to see
            the course here.
          </p>
        </div>
      </div>
    );
  }

  const grouped = useMemo(() => {
    return groupBy(
      events,
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
                  <ScheduleActionsPanelEventsListEvent
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
