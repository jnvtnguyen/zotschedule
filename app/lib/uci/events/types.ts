import {
  CourseScheduleEvent,
  NewScheduleEvent,
  ScheduleEvent,
} from "@/lib/database/types";

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

export const FREQUENCY_TO_LABEL: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  BIWEEKLY: "Biweekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export const DAY_TO_LABEL: Record<string, string> = {
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday",
  SU: "Sunday",
};
