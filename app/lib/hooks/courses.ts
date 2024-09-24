import { FetchQueryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { Course } from "@/lib/database/types";
import { getCourses } from "@/lib/database/logic/courses";

export const courseFiltersSchema = z.object({
  search: z.string().optional(),
  department: z.array(z.string()).optional(),
  breadth: z.array(z.string()).optional(),
  units: z.array(z.number()).optional(),
});

export type CourseFiltersSchema = z.infer<typeof courseFiltersSchema>;

export const getCoursesQuery: FetchQueryOptions<Course[]> = {
  queryKey: ["courses"],
  queryFn: async () => await getCourses(),
};

export const useCourses = () => {
  const query = useQuery(getCoursesQuery);
  return query;
};
