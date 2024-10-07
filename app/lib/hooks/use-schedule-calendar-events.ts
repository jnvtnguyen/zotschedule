import { FetchQueryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";

import {
  ScheduleEvent as BaseScheduleEvent,
  CustomScheduleEvent,
  CourseScheduleEvent,
} from "@/lib/database/types";
import { database } from "@/lib/database";
import { getWebSocInfoBySectionCodes } from "@/lib/uci/offerings";
import {
  WebSocCourse,
  WebSocDepartment,
  WebSocSection,
} from "@/lib/uci/offerings/types";
import { isCourseScheduleEvent } from "@/lib/uci/events/types";

export type CourseScheduleCalendarEvent = {
  info: {
    section: WebSocSection;
    course: WebSocCourse;
    department: WebSocDepartment;
  };
} & CourseScheduleEvent;

export type CustomScheduleCalendarEvent = CustomScheduleEvent;

export type ScheduleCalendarEvent =
  | CourseScheduleCalendarEvent
  | CustomScheduleCalendarEvent;

const getScheduleCalendarEvents = createServerFn(
  "POST",
  async (scheduleId: string): Promise<BaseScheduleEvent[]> => {
    const courseEvents = await database
      .selectFrom("courseScheduleEvents")
      .where("scheduleId", "=", scheduleId)
      .selectAll()
      .execute();
    const customEvents = await database
      .selectFrom("customScheduleEvents")
      .where("scheduleId", "=", scheduleId)
      .selectAll()
      .execute();
    return [...courseEvents, ...customEvents];
  },
);

export const getScheduleCalendarEventsQuery = (
  scheduleId: string,
): FetchQueryOptions<ScheduleCalendarEvent[]> => ({
  queryKey: ["schedule-events", scheduleId],
  queryFn: async () => {
    // TODO: Revamp this when server functions can serialize dates.
    const events = (await getScheduleCalendarEvents(scheduleId)).map(
      (event) => {
        if ("sectionCode" in event) {
          return {
            ...event,
          };
        }
        return {
          ...event,
          // @ts-expect-error
          start: new Date(event.start),
          // @ts-expect-error
          end: new Date(event.end),
        };
      },
    );
    if (events.length === 0) {
      return [];
    }
    const information = await getWebSocInfoBySectionCodes(
      events.filter(isCourseScheduleEvent).map((event) => ({
        code: event.sectionCode,
        term: event.term,
      })),
    );
    return events
      .map((event) => {
        if (isCourseScheduleEvent(event)) {
          const info = information.find(
            (info) => info.section.code === event.sectionCode,
          );
          if (!info) {
            return;
          }
          return {
            ...event,
            info,
          };
        }
        return event;
      })
      .filter((event) => event !== undefined);
  },
});

export const useScheduleCalendarEvents = (scheduleId: string) => {
  const query = useQuery(getScheduleCalendarEventsQuery(scheduleId));
  return query;
};
