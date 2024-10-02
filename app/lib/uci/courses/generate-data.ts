import { database } from "@/lib/database";
import { getCoursesAndDepartments } from ".";

const main = async () => {
  try {
    const { courses, departments } = await getCoursesAndDepartments();
    await database
      .insertInto("departments")
      .values(departments)
      .onConflict((b) => b.doNothing())
      .execute();
    for (const course of courses) {
      await database
        .insertInto("courses")
        .values(course)
        .onConflict((b) => b.doNothing())
        .execute();
    }
  } catch (error) {
    throw error;
  }
};

main();
