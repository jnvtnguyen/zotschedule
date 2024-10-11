import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const CustomScheduleEventFrequency = {
    DAILY: "DAILY",
    WEEKLY: "WEEKLY",
    MONTHLY: "MONTHLY",
    YEARLY: "YEARLY"
} as const;
export type CustomScheduleEventFrequency = (typeof CustomScheduleEventFrequency)[keyof typeof CustomScheduleEventFrequency];
export const CustomScheduleEventRepeatability = {
    NONE: "NONE",
    DAILY: "DAILY",
    WEEKLY: "WEEKLY",
    WEEKDAY: "WEEKDAY",
    MONTHLY: "MONTHLY",
    CUSTOM: "CUSTOM"
} as const;
export type CustomScheduleEventRepeatability = (typeof CustomScheduleEventRepeatability)[keyof typeof CustomScheduleEventRepeatability];
export const CustomScheduleEventDay = {
    SU: "SU",
    MO: "MO",
    TU: "TU",
    WE: "WE",
    TH: "TH",
    FR: "FR",
    SA: "SA"
} as const;
export type CustomScheduleEventDay = (typeof CustomScheduleEventDay)[keyof typeof CustomScheduleEventDay];
export type Course = {
    id: string;
    number: string;
    title: string;
    description: string;
    repeatability: string | null;
    concurrentWith: string[];
    gradingOption: string | null;
    sameAs: string[];
    restriction: string | null;
    overlapsWith: string[];
    corequisite: string | null;
    school: string | null;
    /**
     * @kyselyType(ColumnType<[number, number], string, string>)
     */
    units: ColumnType<[number, number], string, string>;
    ges: string[];
    terms: string[];
    departmentCode: string;
    /**
     * @kyselyType(ColumnType<import('@/lib/uci/prerequisites/types').PrerequisiteTree, string, string>)
     */
    prerequisiteTree: ColumnType<import('@/lib/uci/prerequisites/types').PrerequisiteTree, string, string>;
};
export type CourseScheduleEvent = {
    id: Generated<string>;
    scheduleId: string;
    sectionCode: number;
    term: string;
    color: string;
};
export type CustomScheduleEvent = {
    id: Generated<string>;
    scheduleId: string;
    title: string;
    description: string;
    start: Timestamp;
    end: Timestamp;
    frequency: CustomScheduleEventFrequency | null;
    interval: number | null;
    days: CustomScheduleEventDay[];
    weeks: string[];
    months: string[];
    color: string;
    repeatability: CustomScheduleEventRepeatability;
    repeatUntil: Timestamp | null;
};
export type Department = {
    code: string;
    title: string;
};
export type Schedule = {
    id: Generated<string>;
    name: string;
    isDefault: boolean;
    showWeekends: boolean;
    userId: string;
};
export type SearchAlias = {
    id: Generated<string>;
    alias: string;
    value: string;
};
export type TermCalendar = {
    term: string;
    scheduleOfClassesAvailable: Timestamp;
    instructionBegins: Timestamp;
    instructionEnds: Timestamp;
    finalsBegin: Timestamp;
    finalsEnd: Timestamp;
};
export type User = {
    id: Generated<string>;
    name: string;
    email: string;
    password: string;
    createdAt: Generated<Timestamp>;
    updatedAt: Timestamp;
};
export type UserSession = {
    id: Generated<string>;
    userId: string;
    expiresAt: Timestamp;
};
export type DB = {
    courseScheduleEvents: CourseScheduleEvent;
    courses: Course;
    customScheduleEvents: CustomScheduleEvent;
    departments: Department;
    schedules: Schedule;
    searchAliases: SearchAlias;
    termCalendars: TermCalendar;
    userSessions: UserSession;
    users: User;
};
