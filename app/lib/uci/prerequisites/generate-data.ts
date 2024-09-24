import { database } from "@/lib/database";
import { getPrerequisites } from ".";

const main = async () => {
  try {
    const prerequisites = await getPrerequisites();
    const courseToPrerequisiteTree = Array.from(prerequisites.values())
      .map((prerequisite) => {
        return Array.from(prerequisite.entries());
      })
      .flat();
    for (const [course, prerequisiteTree] of courseToPrerequisiteTree) {
      await database
        .updateTable("courses")
        .where("id", "=", course)
        .set("prerequisiteTree", JSON.stringify(prerequisiteTree))
        .execute();
    }
  } catch (error) {
    throw error;
  }
};

main();
