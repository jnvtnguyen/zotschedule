import { FetchQueryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import superjson from 'superjson';

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
  async (scheduleId: string) => {
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
    return superjson.stringify([...courseEvents, ...customEvents]);
  },
);

export const isCourseScheduleCalendarEvent = (
  event: ScheduleCalendarEvent,
): event is CourseScheduleCalendarEvent => {
  return "info" in event;
};

export const getScheduleCalendarEventsQuery = (
  scheduleId: string,
): FetchQueryOptions<ScheduleCalendarEvent[]> => ({
  queryKey: ["schedule-events", scheduleId],
  queryFn: async () => {
    const events = superjson.parse<BaseScheduleEvent[]>(await getScheduleCalendarEvents(scheduleId));
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
