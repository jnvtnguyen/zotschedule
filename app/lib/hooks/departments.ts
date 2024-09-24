import { FetchQueryOptions, useQuery } from "@tanstack/react-query";

import { Department } from "@/lib/database/types";
import { getDepartments } from "@/lib/database/logic/departments";

export const getDepartmentsQuery: FetchQueryOptions<Department[]> = {
  queryKey: ["departments"],
  queryFn: async () => await getDepartments(),
};

export const useDepartments = () => {
  const query = useQuery(getDepartmentsQuery);
  return query;
};
