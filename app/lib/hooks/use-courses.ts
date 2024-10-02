import { FetchQueryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import NodeCache from "node-cache";

import { Course } from "@/lib/database/types";
import { database } from "@/lib/database";
import { department } from "../database/logic/courses";

const cache = new NodeCache({
  stdTTL: 1000 * 60 * 60, // 1 Hour
});

const getCourses = createServerFn("GET", async (): Promise<Course[]> => {
  try {
    const cached = cache.get<Course[]>("courses");
    if (cached) {
      return cached;
    }
    const courses = await database
      .selectFrom("courses")
      .selectAll()
      .select(({ ref }) => [department(ref("courses.departmentCode"))])
      .execute();
    cache.set("courses", courses);
    return courses;
  } catch (error) {
    throw error;
  }
});

export const courseFiltersSchema = z.object({
  search: z.string().optional(),
  department: z.array(z.string()).optional(),
  ges: z.array(z.string()).optional(),
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
