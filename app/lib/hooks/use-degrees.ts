import { createServerFn } from "@tanstack/start";
import { FetchQueryOptions, useQuery } from "@tanstack/react-query";

import { Major, Minor } from "@/lib/database/types";
import { database } from "@/lib/database";

export const getDegrees = createServerFn(
  "GET",
  async (): Promise<{
    majors: Major[];
    minors: Minor[];
  }> => {
    try {
      const majors = await database
        .selectFrom("majors")
        .selectAll()
        .execute();
      const minors = await database
        .selectFrom("minors")
        .selectAll()
        .execute();
      return {
        majors,
        minors
      };
    } catch (error) {
      throw error;
    }
  },
);

export const getDegreesQuery: FetchQueryOptions<{ majors: Major[]; minors: Minor[]; }> = {
  queryKey: ["degrees"],
  queryFn: async () => await getDegrees(),
};

export const useDegrees = () => {
  const query = useQuery(getDegreesQuery);
  return query;
};