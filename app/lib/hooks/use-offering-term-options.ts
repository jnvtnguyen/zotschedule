import { FetchQueryOptions, useQuery } from "@tanstack/react-query";

import { getOfferingTermOptions } from "@/lib/uci/offerings";
import { OfferingTermOption } from "@/lib/uci/offerings/types";

export const getOfferingTermOptionsQuery: FetchQueryOptions<
  OfferingTermOption[]
> = {
  queryKey: ["offering-term-options"],
  queryFn: async () => await getOfferingTermOptions(),
};

export const useOfferingTermOptions = () => {
  const query = useQuery(getOfferingTermOptionsQuery);
  return query;
};
