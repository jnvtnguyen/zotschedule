import {
  Calendar,
  DateCellWrapperProps,
  dateFnsLocalizer,
  HeaderProps,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";

import { Schedule } from "@/lib/database/types";
import { useScheduleCalendarContext } from "@/lib/hooks/use-schedule-calendar";
import { ScheduleToolbar } from "./schedule-toolbar";
import { useScheduleContext } from "@/lib/hooks/use-schedule";
import { useScheduleEvents } from "@/lib/hooks/use-schedule-events";

type ScheduleCalendarProps = {
  schedules: Schedule[];
};

export function ScheduleCalendar({ schedules }: ScheduleCalendarProps) {
  const view = useScheduleCalendarContext((state) => state.view);
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales: {
      "en-US": enUS,
    },
  });
  const schedule = useScheduleContext((state) => state.schedule);
  if (!schedule) {
    return <></>;
  }
  const { data: events, status } = useScheduleEvents(schedule.id);

  return (
    <div className="flex flex-col w-full h-full space-y-2">
      <ScheduleToolbar schedules={schedules} />
      <Calendar
        formats={{
          timeGutterFormat: "h a",
        }}
        localizer={localizer}
        toolbar={false}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        view={view}
        startAccessor="start"
        endAccessor="end"
        components={{
          week: {
            header: WeekHeader,
          },
          month: {
            header: MonthHeader,
          },
          // @ts-ignore
          timeSlotWrapper: TimeSlotWrapper,
        }}
      />
    </div>
  );
}

function TextWrapper({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-normal uppercase text-[0.84rem]">{children}</span>
  );
}

function MonthHeader(props: HeaderProps) {
  return (
    <TextWrapper>{props.localizer.format(props.date, "EEEE")}</TextWrapper>
  );
}

function WeekHeader(props: HeaderProps) {
  return (
    <TextWrapper>{props.localizer.format(props.date, "EEE d")}</TextWrapper>
  );
}

function TimeSlotWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TextWrapper>
      <div className="min-w-[65px]">{children}</div>
    </TextWrapper>
  );
}
