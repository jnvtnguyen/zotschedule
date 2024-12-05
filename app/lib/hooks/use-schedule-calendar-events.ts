import { FetchQueryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import superjson from "superjson";

import { CustomScheduleEvent, CourseScheduleEvent } from "@/lib/database/types";
import { database } from "@/lib/database";
import { getWebSocInfoBySectionCodes } from "@/lib/uci/offerings";
import {
  WebSocCourse,
  WebSocDepartment,
  WebSocSection,
} from "@/lib/uci/offerings/types";
import { isCourseScheduleEvent } from "@/lib/types/event";

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

const getScheduleCalendarCustomEvents = createServerFn(
  "POST",
  async (scheduleId: string) => {
    const events = await database
      .selectFrom("customScheduleEvents")
      .where("scheduleId", "=", scheduleId)
      .selectAll()
      .execute();

    return superjson.stringify(events);
  },
);

const getScheduleCalendarCourseEvents = createServerFn(
  "POST",
  async (scheduleId: string) => {
    const events = await database
      .selectFrom("courseScheduleEvents")
      .where("scheduleId", "=", scheduleId)
      .selectAll()
      .execute();
    return superjson.stringify(events);
  },
);

export const isCourseScheduleCalendarEvent = (
  event: ScheduleCalendarEvent,
): event is CourseScheduleCalendarEvent => {
  return "info" in event;
};

export const getScheduleCalendarCourseEventsQuery = (
  scheduleId: string,
): FetchQueryOptions<CourseScheduleCalendarEvent[]> => ({
  queryKey: ["schedule-course-events", scheduleId],
  queryFn: async () => {
    const events = superjson.parse<CourseScheduleCalendarEvent[]>(
      await getScheduleCalendarCourseEvents(scheduleId),
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
      })
      .filter((event) => event !== undefined);
  },
});

export const getScheduleCalendarCustomEventsQuery = (
  scheduleId: string,
): FetchQueryOptions<CustomScheduleCalendarEvent[]> => ({
  queryKey: ["schedule-custom-events", scheduleId],
  queryFn: async () => {
    const events = superjson.parse<CustomScheduleCalendarEvent[]>(
      await getScheduleCalendarCustomEvents(scheduleId),
    );
    return events;
  },
});

export const useScheduleCalendarCourseEvents = (scheduleId: string) => {
  const query = useQuery(getScheduleCalendarCourseEventsQuery(scheduleId));
  return query;
};

export const useScheduleCalendarCustomEvents = (scheduleId: string) => {
  const query = useQuery(getScheduleCalendarCustomEventsQuery(scheduleId));
  return query;
};
