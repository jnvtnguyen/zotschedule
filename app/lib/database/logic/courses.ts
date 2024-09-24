import { createServerFn } from "@tanstack/start";
import { Expression } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";
import NodeCache from "node-cache";

import { Course } from "@/lib/database/types";
import { database } from "@/lib/database";

const cache = new NodeCache({
  stdTTL: 1000 * 60 * 60, // 1 Hour
});

const department = (departmentCode: Expression<string>) => {
  return jsonObjectFrom(
    database
      .selectFrom("departments")
      .select(["departments.code", "departments.title"])
      .where("departments.code", "=", departmentCode),
  )
    .$notNull()
    .as("department");
};

export const getCourses = createServerFn("GET", async (): Promise<Course[]> => {
  try {
    const cachedCourses = cache.get<Course[]>("courses");
    if (cachedCourses) {
      return cachedCourses;
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

export const getCourseById = createServerFn(
  "POST",
  async (id: string): Promise<Course | undefined> => {
    try {
      const course = await database
        .selectFrom("courses")
        .selectAll()
        .select(({ ref }) => [department(ref("courses.departmentCode"))])
        .where("courses.id", "=", id)
        .executeTakeFirst();
      return course;
    } catch (error) {
      throw error;
    }
  },
);
