import { useMemo } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  isEqual,
  parse,
  subDays,
} from "date-fns";
import { EventInput } from "@fullcalendar/core";

import {
  useScheduleCalendarCourseEvents,
  useScheduleCalendarCustomEvents,
} from "@/lib/hooks/use-schedule-calendar-events";
import { useTermCalendars } from "@/lib/hooks/use-term-calendars";
import { TERM_CODE_DICTIONARY } from "@/lib/uci/courses/types";
import { WebSocMeeting } from "@/lib/uci/offerings/types";
import { isCourseScheduleEvent } from "@/lib/types/event";
import { useScheduleCalendar, View } from "@/lib/components/schedule/context";
import { Frequency, RRule } from "rrule";

export const COMMON_DAYS_TO_RRULE_DAYS: Record<string, number> = {
  M: 0,
  Tu: 1,
  W: 2,
  Th: 3,
  F: 4,
  Sa: 5,
  Su: 6,
};

export const RRULE_DAYS_TO_LABEL: Record<number, string> = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

export const DATE_DAY_TO_RRULE_DAY: Record<number, number> = {
  0: 6,
  1: 0,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
};

const RRULE_WEEKDAYS: number[] = [0, 1, 2, 3, 4];

export const getCustomScheduleEventDayFromMeeting = (
  meeting: WebSocMeeting,
) => {
  const days = meeting.days.match(/M|Tu|W|Th|F|Sa|Su/g);
  if (!days) {
    return [];
  }
  return days.map((day) => COMMON_DAYS_TO_RRULE_DAYS[day]);
};

const parseTimeRange = (range: string, date: Date = new Date()) => {
  let [start, end] = range.split("-");
  const meridiems = {
    start: start.match(/[a|p]/)?.at(0),
    end: end.match(/[a|p]/)?.at(0),
  };
  if (!meridiems.start && meridiems.end) {
    start = `${start}${meridiems.end}`;
  }
  if (meridiems.start && !meridiems.end) {
    end = `${end}${meridiems.start}`;
  }
  if (!meridiems.start && !meridiems.end) {
    start = `${start}a`;
    end = `${end}a`;
  }
  return [parse(start, "h:mmb", date), parse(end, "h:mmb", date)];
};

const DAILY_REPEATABILITY = (date: Date) => ({
  freq: Frequency.DAILY,
  interval: 1,
  byhour: [date.getHours()],
  byminute: [date.getMinutes()],
});

const WEEKLY_REPEATABILITY = (date: Date) => ({
  freq: Frequency.WEEKLY,
  interval: 1,
  byweekday: [DATE_DAY_TO_RRULE_DAY[date.getDay()]],
  byhour: [date.getHours()],
  byminute: [date.getMinutes()],
});

const WEEKDAY_REPEATABILITY = (date: Date) => ({
  freq: Frequency.WEEKLY,
  interval: 1,
  byweekday: RRULE_WEEKDAYS,
  byhour: [date.getHours()],
  byminute: [date.getMinutes()],
});

const MONTHLY_REPEATABILITY = (date: Date) => ({
  freq: Frequency.MONTHLY,
  interval: 1,
  bymonth: [date.getDate()],
  byhour: [date.getHours()],
  byminute: [date.getMinutes()],
});

const setPartsToUTCDate = (date: Date) =>
  new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    ),
  );

const setUTCPartsToDate = (date: Date) =>
  new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  );

export const useCalendarEvents = (
  scheduleId: string,
  view: View,
  date: Date,
) => {
  const courses = useScheduleCalendarCourseEvents(scheduleId);
  const customs = useScheduleCalendarCustomEvents(scheduleId);
  const editing = useScheduleCalendar((state) => state.editing);
  const terms = useTermCalendars();

  return {
    events: useMemo<EventInput[]>(() => {
      if (
        courses.status === "pending" ||
        courses.status === "error" ||
        customs.status === "pending" ||
        customs.status === "error" ||
        terms.status === "pending" ||
        terms.status === "error"
      ) {
        return [];
      }
      const meetings = [...courses.data, ...customs.data]
        .filter((event) => {
          if (isCourseScheduleEvent(event)) {
            return event.info.section.meetings.length > 0;
          }
          return true;
        })
        .map((event) => {
          if (isCourseScheduleEvent(event)) {
            const meetings = event.info.section.meetings.map((meeting) => {
              return {
                ...meeting,
                ...event,
              };
            });
            return meetings;
          }
          return event;
        })
        .flat();
      return meetings
        .map((meeting) => {
          if (isCourseScheduleEvent(meeting)) {
            const [year, code] = meeting.term.split("-");
            const term = terms.data.find(
              (term) => term.term === `${year} ${TERM_CODE_DICTIONARY[code]}`,
            );
            if (!term) {
              return;
            }
            const days = getCustomScheduleEventDayFromMeeting(meeting);
            if (days.length === 0) {
              return;
            }
            const [start, end] = parseTimeRange(meeting.time);
            const rules = {
              begin: new RRule({
                dtstart: setPartsToUTCDate(term.instructionBegins),
                until: term.instructionEnds,
                freq: Frequency.WEEKLY,
                byhour: [start.getHours()],
                byminute: [start.getMinutes()],
                byweekday: days,
              }),
              end: new RRule({
                dtstart: setPartsToUTCDate(term.instructionBegins),
                until: term.instructionEnds,
                freq: Frequency.WEEKLY,
                byhour: [end.getHours()],
                byminute: [end.getMinutes()],
                byweekday: days,
              }),
            };
            const occurences = {
              begin: rules.begin.all().map(setUTCPartsToDate),
              end: rules.end.all().map(setUTCPartsToDate),
            };
            return occurences.begin.map((start, index) => {
              return {
                title: `${meeting.info.department.code} ${meeting.info.course.number}`,
                start: start,
                end: occurences.end[index],
                color: meeting.color,
                event: meeting,
                building: meeting.building,
                room: meeting.room,
                startEditable: false,
                durationEditable: false,
                frequency: Frequency.WEEKLY,
                days: days,
                occurence: index,
                // @ts-expect-error
                declined: meeting.declined.some((date) => isEqual(date, start)),
              };
            });
          }

          const editable = editing?.id === meeting.id || meeting.id === "new";
          if (meeting.repeatability !== "NONE" && !editable) {
            const until = meeting.recurrence?.until
              ? new Date(meeting.recurrence.until)
              : undefined;
            let greatest = addMonths(date, 1);
            if (view === "timeGridWeek") {
              greatest = addWeeks(date, 1);
            }
            if (view === "timeGridDay") {
              greatest = addDays(date, 1);
            }
            const end = until
              ? until < greatest
                ? until
                : greatest
              : greatest;

            let rules = {
              begin: new RRule({
                dtstart: subDays(setUTCPartsToDate(meeting.start), 1),
                until: end,
                bymonth: [],
                bymonthday: [],
              }),
              end: new RRule({
                dtstart: subDays(setUTCPartsToDate(meeting.end), 1),
                until: end,
                bymonth: [],
                bymonthday: [],
              }),
            };

            if (meeting.repeatability === "DAILY") {
              rules.begin.options = {
                ...rules.begin.options,
                ...DAILY_REPEATABILITY(meeting.start),
              };
              rules.end.options = {
                ...rules.end.options,
                ...DAILY_REPEATABILITY(meeting.end),
              };
            }

            if (meeting.repeatability === "WEEKLY") {
              rules.begin.options = {
                ...rules.begin.options,
                ...WEEKLY_REPEATABILITY(meeting.start),
              };
              rules.end.options = {
                ...rules.end.options,
                ...WEEKLY_REPEATABILITY(meeting.end),
              };
            }

            if (meeting.repeatability === "WEEKDAY") {
              rules.begin.options = {
                ...rules.begin.options,
                ...WEEKDAY_REPEATABILITY(meeting.start),
              };
              rules.end.options = {
                ...rules.end.options,
                ...WEEKDAY_REPEATABILITY(meeting.end),
              };
            }

            if (meeting.repeatability === "MONTHLY") {
              rules.begin.options = {
                ...rules.begin.options,
                ...MONTHLY_REPEATABILITY(meeting.start),
              };
              rules.end.options = {
                ...rules.end.options,
                ...MONTHLY_REPEATABILITY(meeting.end),
              };
            }

            if (meeting.repeatability === "CUSTOM" && meeting.recurrence) {
              rules.begin.options = {
                ...rules.begin.options,
                freq: meeting.recurrence.frequency,
                interval: meeting.recurrence.interval,
                byhour: [meeting.start.getHours()],
                byminute: [meeting.start.getMinutes()],
              };
              rules.end.options = {
                ...rules.end.options,
                freq: meeting.recurrence.frequency,
                interval: meeting.recurrence.interval,
                byhour: [meeting.end.getHours()],
                byminute: [meeting.end.getMinutes()],
              };
              if (meeting.recurrence.frequency === Frequency.WEEKLY) {
                rules.begin.options.byweekday = meeting.recurrence.days;
                rules.end.options.byweekday = meeting.recurrence.days;
              }
            }

            const occurences = {
              begin: rules.begin.all().map(setUTCPartsToDate),
              end: rules.end.all().map(setUTCPartsToDate),
            };

            return occurences.begin.map((start, index) => {
              return {
                title: meeting.title,
                start: start,
                end: occurences.end[index],
                color: meeting.color,
                event: meeting,
                frequency: rules.begin.options.freq,
                days: rules.begin.options.byweekday,
                until,
                editable,
                occurence: index,
                // @ts-expect-error
                declined: meeting.declined.some((date) => isEqual(date, start)),
              };
            });
          }
          return {
            title: meeting.title,
            start: meeting.start,
            end: meeting.end,
            color: meeting.color,
            event: meeting,
            editable,
            occurence: 0,
          };
        })
        .flat()
        .filter((meeting) => meeting !== undefined);
    }, [
      customs.data,
      customs.status,
      courses.data,
      courses.status,
      terms.data,
      terms.status,
      date,
      view,
      editing,
    ]),
    isLoading:
      customs.status === "pending" ||
      courses.status === "pending" ||
      terms.status === "pending",
  };
};
