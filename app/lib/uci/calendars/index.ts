import { parseHTML } from "linkedom";
import { parse } from "date-fns";
import { UTCDate } from "@date-fns/utc";

import { QUARTERS } from "@/lib/uci/offerings/types";
import { logger } from "@/lib/logger";
import { CALANDERS_URL } from "./types";

const SCHEDULE_OF_CLASSES_AVAILABLE = /schedule of classes available/i;
const INSTRUCTION_BEGINS = /instruction begins/i;
const INSTRUCTION_ENDS = /instruction ends/i;
const FINALS_BEGINS = /final examinations/i;
const HYPHEN = /[-–]/;

const parseDate = (year: number, dateString: string): Date => {
  return parse(`${dateString} ${year}`, "MMM d yyyy", new Date());
};

const parseDateRange = (
  year: number,
  dateRangeString: string,
): [Date, Date] => {
  const [startDateString, endDateString] = dateRangeString.split(HYPHEN);
  const startDate = parseDate(year, startDateString);
  if (!endDateString) {
    return [startDate, startDate];
  }
  const endDate = endDateString.match(/[A-Za-z]/)
    ? parseDate(year, endDateString)
    : parseDate(year, `${startDateString.split(" ")[0]} ${endDateString}`);

  return [startDate, endDate];
};

const getCalendarUrl = (year: number) => {
  const shortYear = parseInt(year.toString().slice(2));

  return `${CALANDERS_URL}/${year}-${year + 1}/quarterly${shortYear}-${shortYear + 1}.html`;
};

export const getCalendar = async (year: number) => {
  try {
    logger.info(`Scraping calendar for ${year}.`);
    const url = getCalendarUrl(year);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Scraping Error: ${response.statusText} at ${url}.`);
    }

    const { document } = parseHTML(await response.text());
    const tables = document.querySelectorAll("table.calendartable");
    const data = Array.from(tables)
      .map((table) => {
        return table
          .textContent!.split("\n")
          .map((line) => line.trim())
          .filter((line) => line);
      })
      .flat();

    const indexes = {
      normal: {
        scheduleOfClassesAvailable:
          data.findIndex((line) => SCHEDULE_OF_CLASSES_AVAILABLE.test(line)) +
          1,
        instructionBegins:
          data.findIndex((line) => INSTRUCTION_BEGINS.test(line)) + 1,
        instructionEnds:
          data.findIndex((line) => INSTRUCTION_ENDS.test(line)) + 1,
        finalsBegins: data.findIndex((line) => FINALS_BEGINS.test(line)) + 1,
      },
      summer: {
        scheduleOfClassesAvailable:
          data.findLastIndex((line) =>
            SCHEDULE_OF_CLASSES_AVAILABLE.test(line),
          ) + 1,
        instructionBegins:
          data.findLastIndex((line) => INSTRUCTION_BEGINS.test(line)) + 1,
        instructionEnds:
          data.findLastIndex((line) => INSTRUCTION_ENDS.test(line)) + 1,
        finalsBegins:
          data.findLastIndex((line) => FINALS_BEGINS.test(line)) + 1,
      },
    };

    const term = (index: number) => {
      return `${year + Number(index > 0)} ${QUARTERS[index]}`;
    };

    const scheduleOfClassesAvailable: Record<string, Date> = Object.fromEntries(
      [
        ...data.slice(
          indexes.normal.scheduleOfClassesAvailable,
          indexes.normal.scheduleOfClassesAvailable + 3,
        ),
        ...data.slice(
          indexes.summer.scheduleOfClassesAvailable,
          indexes.summer.scheduleOfClassesAvailable + 3,
        ),
      ].map((line, index) => [
        term(index),
        parseDate(year + Number(index > 1), line),
      ]),
    );

    const instructionBegins: Record<string, Date> = Object.fromEntries(
      [
        ...data.slice(
          indexes.normal.instructionBegins,
          indexes.normal.instructionBegins + 3,
        ),
        ...data.slice(
          indexes.summer.instructionBegins,
          indexes.summer.instructionBegins + 3,
        ),
      ].map((line, index) => [
        term(index),
        parseDate(year + Number(index > 0), line),
      ]),
    );

    const instructionEnds: Record<string, Date> = Object.fromEntries(
      [
        ...data.slice(
          indexes.normal.instructionEnds,
          indexes.normal.instructionEnds + 3,
        ),
        ...data.slice(
          indexes.summer.instructionEnds,
          indexes.summer.instructionEnds + 3,
        ),
      ].map((line, index) => [
        term(index),
        parseDate(year + Number(index > 0), line),
      ]),
    );

    const finals: Record<string, [Date, Date]> = Object.fromEntries(
      [
        ...data.slice(
          indexes.normal.finalsBegins,
          indexes.normal.finalsBegins + 3,
        ),
        ...data.slice(
          indexes.summer.finalsBegins,
          indexes.summer.finalsBegins + 3,
        ),
      ].map((line, index) => [
        term(index),
        parseDateRange(year + Number(index > 0), line),
      ]),
    );

    return Object.fromEntries(
      Array(6)
        .fill(0)
        .map((_, index) => term(index))
        .map((term) => [
          term,
          {
            scheduleOfClassesAvailable: new UTCDate(
              scheduleOfClassesAvailable[term],
            ),
            instructionBegins: new UTCDate(instructionBegins[term]),
            instructionEnds: new UTCDate(instructionEnds[term]),
            finalsBegin: new UTCDate(finals[term][0]),
            finalsEnd: new UTCDate(finals[term][1]),
          },
        ]),
    );
  } catch (error) {
    throw error;
  }
};
