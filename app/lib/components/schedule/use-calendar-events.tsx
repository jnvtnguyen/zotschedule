import { useMemo } from "react";
import { parse } from "date-fns";
import { Schedule as RSchedule, Rule } from "./rschedule";

import { useScheduleCalendarEvents } from "@/lib/hooks/use-schedule-calendar-events";
import { useTermCalendars } from "@/lib/hooks/use-term-calendars";
import { TERM_CODE_DICTIONARY } from "@/lib/uci/courses/types";
import { WebSocMeeting } from "@/lib/uci/offerings/types";
import { isCourseScheduleEvent } from "@/lib/uci/events/types";

const SECTION_MEETING_DAYS_TO_RSCHEDULE_DAYS: Record<string, string> = {
  M: "MO",
  Tu: "TU",
  W: "WE",
  Th: "TH",
  F: "FR",
  Sa: "SA",
  Su: "SU",
};

export const getRScheduleDaysFromMeeting = (meeting: WebSocMeeting) => {
  const days = meeting.days.match(/M|Tu|W|Th|F|Sa|Su/g);
  if (!days) {
    return [];
  }
  return days.map((day) => SECTION_MEETING_DAYS_TO_RSCHEDULE_DAYS[day]);
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

export const useCalendarEvents = (scheduleId: string) => {
  const events = useScheduleCalendarEvents(scheduleId);
  const terms = useTermCalendars();

  return useMemo(() => {
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
          const days = getRScheduleDaysFromMeeting(meeting);
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
              title: (
                <CourseEventTitle
                  title={`${meeting.info.department.code} ${meeting.info.course.number}`}
                  type={meeting.info.section.type}
                  location={`${meeting.building} ${meeting.room}`}
                />
              ),
              start: start.date,
              end: occurences.end[index].date,
              resource: {
                color: meeting.color,
                event: meeting,
              },
            };
          });
        }
        return {
          title: <CustomEventTitle title={meeting.title} />,
          start: meeting.start,
          end: meeting.end,
          resource: {
            color: meeting.color,
            event: meeting,
          },
        };
      })
      .flat()
      .filter((meeting) => meeting !== undefined);
  }, [events.data, events.status, terms.data, terms.status]);
};

function CustomEventTitle({ title }: { title: string }) {
  return (
    <div className="flex flex-col text-xs flex-wrap">
      <span className="font-semibold">{title === "" ? "(No Title)" : title}</span>
    </div>
  );
}

function CourseEventTitle({
  title,
  type,
  location,
}: {
  title: string;
  type: string;
  location: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between text-xs">
        <div className="flex flex-col">
          <span className="font-semibold">{title}</span>
        </div>
        <span className="font-semibold">{type}</span>
      </div>
      <span className="text-xs">{location}</span>
    </div>
  );
}
