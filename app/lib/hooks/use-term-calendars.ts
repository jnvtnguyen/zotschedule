import { createServerFn } from "@tanstack/start";
import { FetchQueryOptions, useQuery } from "@tanstack/react-query";
import superjson from "superjson";

import { database } from "@/lib/database";
import { TermCalendar } from "@/lib/database/types";

export const getTermCalendars = createServerFn("GET", async () => {
  const calendars = await database
    .selectFrom("termCalendars")
    .selectAll()
    .execute();
  return superjson.stringify(calendars);
});

export const getTermCalendarsQuery: FetchQueryOptions<TermCalendar[]> = {
  queryKey: ["term-calendars"],
  queryFn: async () => {
    const calendars = await getTermCalendars();
    return superjson.parse(calendars);
  },
};

export const useTermCalendars = () => {
  const query = useQuery(getTermCalendarsQuery);
  return query;
};
