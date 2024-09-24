import { database } from "@/lib/database";
import { getCoursesAndDepartments } from ".";

const main = async () => {
  try {
    const { courses, departments } = await getCoursesAndDepartments();
    await database
      .insertInto("departments")
      .values(departments)
      .onConflict((c) => c.doNothing())
      .execute();
    for (const course of courses) {
      await database
        .insertInto("courses")
        .values(course)
        .onConflict((c) => c.doNothing())
        .execute();
    }
  } catch (error) {
    throw error;
  }
};

main();
