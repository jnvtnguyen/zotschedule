import { useMemo } from "react";
import { addMonths, addWeeks, parse } from "date-fns";
import { EventInput } from "@fullcalendar/core";
import { Schedule as RSchedule, Rule } from "./rschedule";

import { useScheduleCalendarEvents } from "@/lib/hooks/use-schedule-calendar-events";
import { useTermCalendars } from "@/lib/hooks/use-term-calendars";
import { TERM_CODE_DICTIONARY } from "@/lib/uci/courses/types";
import { WebSocMeeting } from "@/lib/uci/offerings/types";
import { isCourseScheduleEvent } from "@/lib/uci/events/types";
import { View } from "@/lib/hooks/use-schedule-calendar";
import { CustomScheduleEventDay, CustomScheduleEventFrequency } from "@/lib/database/generated-types";

export const COMMON_DAYS_TO_RSCHEDULE_DAYS: Record<string, CustomScheduleEventDay> = {
  Su: CustomScheduleEventDay.SU,
  M: CustomScheduleEventDay.MO,
  Tu: CustomScheduleEventDay.TU,
  W: CustomScheduleEventDay.WE,
  Th: CustomScheduleEventDay.TH,
  F: CustomScheduleEventDay.FR,
  Sa: CustomScheduleEventDay.SA,
};

export const RSCHEDULE_DAYS_TO_LABEL: Record<CustomScheduleEventDay, string> = {
  SU: "Sunday",
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday",
};

export const DATE_DAY_TO_RSCHEDULE_DAY: Record<number, CustomScheduleEventDay> = {
  0: CustomScheduleEventDay.SU,
  1: CustomScheduleEventDay.MO,
  2: CustomScheduleEventDay.TU,
  3: CustomScheduleEventDay.WE,
  4: CustomScheduleEventDay.TH,
  5: CustomScheduleEventDay.FR,
  6: CustomScheduleEventDay.SA,
};

export const RSCHEDULE_DAYS_ORDER: CustomScheduleEventDay[] = [
  CustomScheduleEventDay.SU,
  CustomScheduleEventDay.MO,
  CustomScheduleEventDay.TU,
  CustomScheduleEventDay.WE,
  CustomScheduleEventDay.TH,
  CustomScheduleEventDay.FR,
  CustomScheduleEventDay.SA,
];

export const getCustomScheduleEventDayFromMeeting = (meeting: WebSocMeeting) => {
  const days = meeting.days.match(/M|Tu|W|Th|F|Sa|Su/g);
  if (!days) {
    return [];
  }
  return days.map((day) => COMMON_DAYS_TO_RSCHEDULE_DAYS[day]);
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

type RRule = {
  frequency?: CustomScheduleEventFrequency;
  interval?: number;
  byDayOfWeek?: CustomScheduleEventDay[];
  byMonthDay?: number[];
  byHourOfDay?: number[];
  byMinuteOfHour?: number[];
}

const DAILY_REPEATABILITY = (date: Date): RRule => ({
  frequency: "DAILY",
  interval: 1,
  byHourOfDay: [date.getHours()],
  byMinuteOfHour: [date.getMinutes()],
});

const WEEKLY_REPEATABILITY = (date: Date): RRule => ({
  frequency: "WEEKLY",
  interval: 1,
  byDayOfWeek: [DATE_DAY_TO_RSCHEDULE_DAY[date.getDay()]],
  byHourOfDay: [date.getHours()],
  byMinuteOfHour: [date.getMinutes()],
});

const MONTHLY_REPEATABILITY = (date: Date): RRule => ({
  frequency: "MONTHLY",
  interval: 1,
  byMonthDay: [date.getDate()],
  byHourOfDay: [date.getHours()],
  byMinuteOfHour: [date.getMinutes()],
});

export const useCalendarEvents = (scheduleId: string, view: View, date: Date) => {
  const events = useScheduleCalendarEvents(scheduleId);
  const terms = useTermCalendars();

  return useMemo<EventInput[]>(() => {
    if (
      events.status === "pending" ||
      events.status === "error" ||
      terms.status === "pending" ||
      terms.status === "error"
    ) {
      return [];
    }
    const meetings = events.data
      .filter((event) => {
        if (isCourseScheduleEvent(event)) {
          return event.info.section.meetings.length > 0;
        }
        return true;
      })
      .map((event) => {
        if (isCourseScheduleEvent(event)) {
          return event.info.section.meetings.map((meeting) => {
            return {
              ...meeting,
              ...event,
            };
          });
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
          const range = {
            begin: new RSchedule({
              rrules: [
                new Rule({
                  start: term.instructionBegins,
                  end: term.instructionEnds,
                  // @ts-expect-error
                  frequency: "WEEKLY",
                  byHourOfDay: [start.getHours()],
                  byMinuteOfHour: [start.getMinutes()],
                  byDayOfWeek: days,
                }),
              ],
            }),
            end: new RSchedule({
              rrules: [
                new Rule({
                  start: term.instructionBegins,
                  end: term.instructionEnds,
                  // @ts-expect-error
                  frequency: "WEEKLY",
                  byHourOfDay: [end.getHours()],
                  byMinuteOfHour: [end.getMinutes()],
                  byDayOfWeek: days,
                }),
              ],
            }),
          };
          const occurences = {
            begin: range.begin.occurrences().toArray(),
            end: range.end.occurrences().toArray(),
          };
          return occurences.begin.map((start, index) => {
            return {
              title: `${meeting.info.department.code} ${meeting.info.course.number}`,
              start: start.date,
              end: occurences.end[index].date,
              color: meeting.color,
              event: meeting,
              building: meeting.building,
              room: meeting.room,
              startEditable: false,
              durationEditable: false,
              frequency: "WEEKLY",
              days: days,
            };
          });
        }

        if (meeting.repeatability !== "NONE" && meeting.id !== "new") {
          let end = meeting.repeatUntil;
          if (!end) {
            if (view === "dayGridMonth") {
              end = addMonths(date, 1);
            }
            if (view === "timeGridWeek") {
              end = addWeeks(date, 1);
            }
            if (view === "timeGridDay") {
              end = date;
            }
          }

          let rules: {
            begin: {
              start: Date;
              end: Date;
            } & RRule;
            end: {
              start: Date;
              end: Date;
            } & RRule;
            days: CustomScheduleEventDay[];
          } = {
            begin: {
              start: meeting.start,
              end: end!
            },
            end: {
              start: meeting.start,
              end: end!
            },
            days: []
          }
           
          if (meeting.repeatability === "DAILY") {
            rules.begin = {
              ...rules.begin,
              ...DAILY_REPEATABILITY(meeting.start)
            }
            rules.end = {
              ...rules.end,
              ...DAILY_REPEATABILITY(meeting.start)
            }
          }

          if (meeting.repeatability === "WEEKLY") {
            rules.begin = {
              ...rules.begin,
              ...WEEKLY_REPEATABILITY(meeting.start)
            }
            rules.end = {
              ...rules.end,
              ...WEEKLY_REPEATABILITY(meeting.start)
            }
            rules.days.push(DATE_DAY_TO_RSCHEDULE_DAY[meeting.start.getDay()]);
          }

          if (meeting.repeatability === "MONTHLY") {
            rules.begin = {
              ...rules.begin,
              ...MONTHLY_REPEATABILITY(meeting.start)
            }
            rules.end = {
              ...rules.end,
              ...MONTHLY_REPEATABILITY(meeting.start)
            }
          }

          if (meeting.repeatability === "CUSTOM") {
            rules.begin = {
              ...rules.begin,
              frequency: meeting.frequency!,
              interval: meeting.interval!,
              byHourOfDay: [meeting.start.getHours()],
              byMinuteOfHour: [meeting.start.getMinutes()],
            };
            rules.end = {
              ...rules.end,
              frequency: meeting.frequency!,
              interval: meeting.interval!,
              byHourOfDay: [meeting.end.getHours()],
              byMinuteOfHour: [meeting.end.getMinutes()],
            };
            if (meeting.frequency === "WEEKLY") {
              rules.days = meeting.days;
              rules.begin.byDayOfWeek = meeting.days;
              rules.end.byDayOfWeek = meeting.days;
            }
          }

          const range = {
            begin: new RSchedule({
              rrules: [
                new Rule(rules.begin),
              ],
            }),
            end: new RSchedule({
              rrules: [
                new Rule(rules.end),
              ],
            }),
          };

          const occurences = {
            begin: range.begin.occurrences().toArray(),
            end: range.end.occurrences().toArray(),
          };

          return occurences.begin.map((start, index) => {
            return {
              title: meeting.title,
              start: start.date,
              end: occurences.end[index].date,
              color: meeting.color,
              event: meeting,
              frequency: rules.begin.frequency,
              days: rules.days,
              repeatsUntil: meeting.repeatUntil,
              editable: true,
            };
          });
        }

        return {
          title: meeting.title,
          start: meeting.start,
          end: meeting.end,
          color: meeting.color,
          event: meeting,
          editable: true,
        };
      })
      .flat()
      .filter((meeting) => meeting !== undefined);
  }, [events.data, events.status, terms.data, terms.status, date, view]);
};
