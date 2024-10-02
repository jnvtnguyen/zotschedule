import type { ColumnType } from "kysely";
export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

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
  prerequisiteTree: ColumnType<
    import("@/lib/uci/prerequisites/types").PrerequisiteTree,
    string,
    string
  >;
};
export type Department = {
  code: string;
  title: string;
};
export type Schedule = {
  id: Generated<string>;
  name: string;
  isDefault: boolean;
  userId: string;
};
export type ScheduleEvent = {
  id: Generated<string>;
  scheduleId: string;
  courseId: string;
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
  courses: Course;
  departments: Department;
  scheduleEvents: ScheduleEvent;
  schedules: Schedule;
  searchAliases: SearchAlias;
  termCalendars: TermCalendar;
  userSessions: UserSession;
  users: User;
};
