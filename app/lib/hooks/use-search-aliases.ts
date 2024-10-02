import { FetchQueryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";

import { database } from "@/lib/database";
import { SearchAlias } from "@/lib/database/types";

const getSearchAliases = createServerFn(
  "GET",
  async (): Promise<SearchAlias[]> => {
    try {
      const aliases = await database
        .selectFrom("searchAliases")
        .selectAll()
        .execute();

      return aliases;
    } catch (error) {
      throw error;
    }
  },
);

export const getSearchAliasesQuery: FetchQueryOptions<SearchAlias[]> = {
  queryKey: ["search-aliases"],
  queryFn: async () => await getSearchAliases(),
};

export const useSearchAliases = () => {
  const query = useQuery(getSearchAliasesQuery);
  return query;
};
