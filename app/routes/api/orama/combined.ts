import { createAPIFileRoute } from "@tanstack/start/api";
import { json } from "@tanstack/start";

import { database } from "@/lib/database";
import { department } from "@/lib/database/logic/courses";

export const Route = createAPIFileRoute("/api/orama/combined")({
  GET: async () => {
    const departments = await database
      .selectFrom("departments")
      .selectAll()
      .execute();
    const courses = await database
      .selectFrom("courses")
      .select([
        "id",
        "title",
        "description",
        "number",
        "school",
        "units",
        "ges",
      ])
      .select(({ ref }) => [department(ref("courses.departmentCode"))])
      .execute();
    return json([
      ...departments.map((department) => ({
        type: "department",
        ...department,
      })),
      ...courses.map((course) => ({
        type: "course",
        ...course,
      })),
    ]);
  },
});
