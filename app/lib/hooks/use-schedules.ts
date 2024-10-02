import { FetchQueryOptions, useQuery } from "@tanstack/react-query";

import { Schedule } from "@/lib/database/types";
import { createServerFn } from "@tanstack/start";
import { database } from "@/lib/database";

const getSchedules = createServerFn(
  "GET",
  async (userId: string): Promise<Schedule[]> => {
    const schedules = await database
      .selectFrom("schedules")
      .where("userId", "=", userId)
      .selectAll()
      .orderBy("isDefault", "desc")
      .execute();
    return schedules;
  },
);

export const getSchedulesQuery = (
  userId: string,
): FetchQueryOptions<Schedule[]> => ({
  queryKey: ["schedules", userId],
  queryFn: async () => await getSchedules(userId),
});

export const useSchedules = (userId: string) => {
  const query = useQuery(getSchedulesQuery(userId));
  return query;
};
