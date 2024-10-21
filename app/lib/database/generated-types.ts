import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const CustomScheduleEventRepeatability = {
    NONE: "NONE",
    DAILY: "DAILY",
    WEEKLY: "WEEKLY",
    WEEKDAY: "WEEKDAY",
    MONTHLY: "MONTHLY",
    CUSTOM: "CUSTOM"
} as const;
export type CustomScheduleEventRepeatability = (typeof CustomScheduleEventRepeatability)[keyof typeof CustomScheduleEventRepeatability];
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
    declined: Timestamp[];
};
export type CustomScheduleEvent = {
    id: Generated<string>;
    scheduleId: string;
    title: string;
    description: string;
    start: Timestamp;
    end: Timestamp;
    color: string;
    repeatability: CustomScheduleEventRepeatability;
    declined: Timestamp[];
    /**
     * @kyselyType(ColumnType<import('@/lib/uci/events/types').Recurrence, string, string>)
     */
    recurrence: ColumnType<import('@/lib/uci/events/types').Recurrence, string, string> | null;
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
    /**
     * @kyselyType(ColumnType<import('@/lib/components/schedule/context').View, string, string>)
     */
    view: ColumnType<import('@/lib/components/schedule/context').View, string, string>;
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
    googleId: string;
    name: string;
    email: string;
    picture: string;
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
