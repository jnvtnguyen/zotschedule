import { FetchQueryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import { getOfferings } from "@/lib/uci/offerings";
import { Course } from "@/lib/database/types";
import { parseLetteredTerm } from "@/lib/utils";
import { WebSocResponse } from "@/lib/uci/offerings/types";

export const courseOfferingsFiltersSchema = z.object({
  term: z.string().optional(),
});

export type CourseOfferingsFiltersSchema = z.infer<
  typeof courseOfferingsFiltersSchema
>;

export const getCourseOfferingsQuery = (
  course: Course,
  letteredTerm: string,
): FetchQueryOptions<WebSocResponse> => {
  const term = parseLetteredTerm(letteredTerm);

  return {
    queryKey: ["offerings", course.id, term.year, term.quarter],
    queryFn: async () =>
      await getOfferings({
        term,
        options: {
          department: course.department.code,
          courseNumber: course.number,
        },
      }),
  };
};

export const useCourseOfferings = (course: Course, letteredTerm: string) => {
  const query = useQuery(getCourseOfferingsQuery(course, letteredTerm));
  return query;
};
