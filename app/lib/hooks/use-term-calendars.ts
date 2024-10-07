import { createServerFn } from "@tanstack/start";
import { FetchQueryOptions, useQuery } from "@tanstack/react-query";

import { database } from "@/lib/database";
import { TermCalendar } from "@/lib/database/types";

export const getTermCalendars = createServerFn(
  "GET",
  async (): Promise<TermCalendar[]> => {
    const calendars = await database
      .selectFrom("termCalendars")
      .selectAll()
      .execute();
    return calendars;
  },
);

export const getTermCalendarsQuery: FetchQueryOptions<TermCalendar[]> = {
  queryKey: ["term-calendars"],
  queryFn: async () => {
    // TODO: Revamp this when server functions can serialize dates.
    const calendars = await getTermCalendars();
    return calendars.map((calendar) => {
      return {
        term: calendar.term,
        scheduleOfClassesAvailable: new Date(
          // @ts-expect-error
          calendar.scheduleOfClassesAvailable,
        ),
        // @ts-expect-error
        instructionBegins: new Date(calendar.instructionBegins),
        // @ts-expect-error
        instructionEnds: new Date(calendar.instructionEnds),
        // @ts-expect-error
        finalsBegin: new Date(calendar.finalsBegin),
        // @ts-expect-error
        finalsEnd: new Date(calendar.finalsEnd),
      };
    });
  },
};

export const useTermCalendars = () => {
  const query = useQuery(getTermCalendarsQuery);
  return query;
};
