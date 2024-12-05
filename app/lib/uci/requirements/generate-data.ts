import { database } from "@/lib/database";
import { getMajorsMinors } from ".";

const main = async () => {
  try {
    const elements = await getMajorsMinors();
    await database
      .insertInto("majors")
      .values(elements.majors)
      .execute();
    await database
      .insertInto("minors")
      .values(elements.minors)
      .execute();
  } catch(error) {
    throw error;
  }
}

main();
