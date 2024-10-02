import { parseArgs } from "util";

import { database } from "@/lib/database";
import { getCalendar } from ".";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    year: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

const main = async (year: number) => {
  try {
    const calendar = await getCalendar(year);
    Object.entries(calendar).forEach(async ([term, dates]) => {
      await database
        .insertInto("termCalendars")
        .values({
          term,
          scheduleOfClassesAvailable: dates.scheduleOfClassesAvailable,
          instructionBegins: dates.instructionBegins,
          instructionEnds: dates.instructionEnds,
          finalsBegin: dates.finalsBegin,
          finalsEnd: dates.finalsEnd,
        })
        .onConflict((b) => b.doNothing())
        .execute();
    });
  } catch (error) {
    throw error;
  }
};

if (!values.year) {
  throw new Error("Please specify a year to scrape the calendar for.");
}

main(parseInt(values.year));
