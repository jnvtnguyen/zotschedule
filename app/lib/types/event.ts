import {
  CourseScheduleEvent,
  NewScheduleEvent,
  ScheduleEvent,
} from "@/lib/database/types";
import { Frequency } from "rrule";

export const DEFAULT_EVENT_COLOR = "#255799";

export const PRESET_EVENT_COLORS = [
  "#255799",
  "#D0021B",
  "#F5A623",
  "#F8E71C",
  "#8B572A",
  "#7ED321",
  "#417505",
  "#BD10E0",
  "#9013FE",
  "#4A90E2",
  "#50E3C2",
  "#B8E986",
  "#4A4A4A",
  "#9B9B9B",
];

export const isCourseScheduleEvent = (
  event: ScheduleEvent | NewScheduleEvent,
): event is CourseScheduleEvent => {
  return "sectionCode" in event;
};

export const FREQUENCY_TO_LABEL: Record<Frequency, string> = {
  [Frequency.SECONDLY]: "Secondly",
  [Frequency.MINUTELY]: "Minutely",
  [Frequency.HOURLY]: "Hourly",
  [Frequency.DAILY]: "Daily",
  [Frequency.WEEKLY]: "Weekly",
  [Frequency.MONTHLY]: "Monthly",
  [Frequency.YEARLY]: "Yearly",
};

type DailyRecurrence = {
  frequency: Frequency.DAILY;
};

type WeeklyRecurrence = {
  frequency: Frequency.WEEKLY;
  days: number[];
};

type MonthlyRecurrence = {
  frequency: Frequency.MONTHLY;
  weeks: number[];
};

type YearlyRecurrence = {
  frequency: Frequency.YEARLY;
  months: number[];
};

export type Recurrence = {
  frequency:
    | Frequency.DAILY
    | Frequency.WEEKLY
    | Frequency.MONTHLY
    | Frequency.YEARLY;
  interval: number;
  until?: Date;
} & (DailyRecurrence | WeeklyRecurrence | MonthlyRecurrence | YearlyRecurrence);
