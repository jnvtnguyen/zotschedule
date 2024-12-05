import { createServerFn } from "@tanstack/start";
import { FetchQueryOptions, useQuery } from "@tanstack/react-query";

import { Planner } from "@/lib/database/types";
import { database } from "@/lib/database";

export const getPlanners = createServerFn(
  "GET",
  async (userId: string): Promise<Planner[]> => {
    try {
      const planners = await database
        .selectFrom("planners")
        .where("userId", "=", userId)
        .selectAll()
        .execute();
      return planners;
    } catch (error) {
      throw error;
    }
  }
);

export const getPlannersQuery = (userId: string): FetchQueryOptions<Planner[]> => ({
  queryKey: ["planners", userId],
  queryFn: async () => await getPlanners(userId),
});

export const usePlanners = (userId: string) => {
  const query = useQuery(getPlannersQuery(userId));
  return query;
};