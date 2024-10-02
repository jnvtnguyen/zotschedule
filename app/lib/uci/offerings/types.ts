export const WEBSOC_URL = "https://www.reg.uci.edu/perl/WebSoc";

export const QUARTERS = [
  "Fall",
  "Winter",
  "Spring",
  "Summer1",
  "Summer10wk",
  "Summer2",
] as const;

export const QUARTERS_TO_LABELS: Record<Quarter, string> = {
  Fall: "Fall",
  Winter: "Winter",
  Spring: "Spring",
  Summer1: "Summer Session 1",
  Summer10wk: "Summer 10 Week",
  Summer2: "Summer Session 2",
};

export type Term = {
  year: string;
  quarter: Quarter;
};

export const SECTION_TYPES = [
  "Act",
  "Col",
  "Dis",
  "Fld",
  "Lab",
  "Lec",
  "Qiz",
  "Res",
  "Sem",
  "Stu",
  "Tap",
  "Tut",
] as const;

export const FULL_COURSE_OPTIONS = [
  "SkipFull",
  "SkipFullWaitlist",
  "FullOnly",
  "Overenrolled",
] as const;

export const CANCELLED_COURSE_OPTIONS = ["Exclude", "Include", "Only"] as const;

export const GE_CODES = [
  "GE-1A",
  "GE-1B",
  "GE-2",
  "GE-3",
  "GE-4",
  "GE-5A",
  "GE-5B",
  "GE-6",
  "GE-7",
  "GE-8",
] as const;

export const GE_CATEGORIES = [
  "GE Ia: Lower Division Writing",
  "GE Ib: Upper Division Writing",
  "GE II: Science and Technology",
  "GE III: Social & Behavioral Sciences",
  "GE IV: Arts and Humanities",
  "GE Va: Quantitative Literacy",
  "GE Vb: Formal Reasoning",
  "GE VI: Language Other Than English",
  "GE VII: Multicultural Studies",
  "GE VIII: International/Global Issues",
] as const;

export const DIVISION_CODES = ["LowerDiv", "UpperDiv", "Graduate"] as const;

export const COURSE_LEVELS = [
  "Lower Division (1-99)",
  "Upper Division (100-199)",
  "Graduate/Professional Only (200+)",
] as const;

export const anyArray = ["ANY"] as const;

export type Any = (typeof anyArray)[number];

export type Quarter = (typeof QUARTERS)[number];

export type SectionType = Any | (typeof SECTION_TYPES)[number];

export type FullCourses = Any | (typeof FULL_COURSE_OPTIONS)[number];

export type CancelledCourses = (typeof CANCELLED_COURSE_OPTIONS)[number];

export type GE = Any | (typeof GE_CODES)[number];

export type Division = Any | (typeof DIVISION_CODES)[number];

export type CourseLevel = (typeof COURSE_LEVELS)[number];

type RequireAtLeastOne<T, R extends keyof T = keyof T> = Omit<T, R> &
  { [P in R]: Required<Pick<T, P>> & Partial<Omit<T, P>> }[R];

type RequiredOptions = RequireAtLeastOne<{
  ge?: GE;
  department?: string;
  sectionCodes?: string;
  instructorName?: string;
}>;

type BuildingRoomOptions =
  | {
      building?: never;
      room?: never;
    }
  | {
      building: string;
      room?: never;
    }
  | {
      building: string;
      room: string;
    };

type OptionalOptions = {
  division?: Division;
  courseNumber?: string;
  courseTitle?: string;
  sectionType?: SectionType;
  units?: string;
  days?: string;
  startTime?: string;
  endTime?: string;
  maxCapacity?: string;
  fullCourses?: FullCourses;
  cancelledCourses?: CancelledCourses;
};

export type WebSocOptions = RequiredOptions &
  BuildingRoomOptions &
  OptionalOptions;

export type WebSocMeeting = {
  days: string;
  time: string;
  building: string;
  room: string;
};

export type WebSocSectionStatus = "OPEN" | "Waitl" | "FULL" | "NewOnly";

export type WebSocEnrollment = {
  max: number;
  current: number;
  waitlist: number | "n/a";
  waitlistCapacity: number;
};

export type WebSocSection = {
  code: string;
  type: string;
  number: string;
  units: string;
  modality: "In-Person" | "Online";
  finalExam?: {
    date: string;
    day: string;
    time: string;
  };
  instructors: string[];
  meetings: WebSocMeeting[];
  enrollment: WebSocEnrollment;
  restrictions: string[];
  status: WebSocSectionStatus;
};

export type WebSocCourse = {
  number: string;
  title: string;
  comment: string;
  sections: WebSocSection[];
};

export type WebSocDepartment = {
  code: string;
  name: string;
  comment: string;
  courses: WebSocCourse[];
};

export type WebSocSchool = {
  name: string;
  comment: string;
  departments: WebSocDepartment[];
};

export type WebSocResponse = {
  schools: WebSocSchool[];
};

export type OfferingTermOption = {
  value: string;
  label: string;
};
