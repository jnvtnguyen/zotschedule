import { FetchQueryOptions, useQuery } from "@tanstack/react-query";

import { getWebSocTermOptions } from "@/lib/uci/offerings";
import { OfferingTermOption } from "@/lib/uci/offerings/types";

export const getWebSocTermOptionsQuery: FetchQueryOptions<
  OfferingTermOption[]
> = {
  queryKey: ["offering-term-options"],
  queryFn: async () => await getWebSocTermOptions(),
};

export const useWebSocTermOptions = () => {
  const query = useQuery(getWebSocTermOptionsQuery);
  return query;
};
