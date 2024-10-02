import { FetchQueryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";

import { ScheduleEvent } from "@/lib/database/types";
import { database } from "@/lib/database";

const getScheduleEvents = createServerFn(
  "GET",
  async (scheduleId: string): Promise<ScheduleEvent[]> => {
    const events = await database
      .selectFrom("scheduleEvents")
      .where("scheduleId", "=", scheduleId)
      .selectAll()
      .execute();
    return events;
  },
);

export const getScheduleEventsQuery = (
  scheduleId: string,
): FetchQueryOptions<ScheduleEvent[]> => ({
  queryKey: ["schedule-events", scheduleId],
  queryFn: async () => await getScheduleEvents(scheduleId),
});

export const useScheduleEvents = (scheduleId: string) => {
  const query = useQuery(getScheduleEventsQuery(scheduleId));
  return query;
};
