import { Insertable, Selectable } from "kysely";

import {
  Course as DatabaseCourse,
  Department as DatabaseDepartment,
  User as DatabaseUser,
  Schedule as DatabaseSchedule,
  CourseScheduleEvent as DatabaseCourseScheduleEvent,
  CustomScheduleEvent as DatabaseCustomScheduleEvent,
  SearchAlias as DatabaseSearchAlias,
  TermCalendar as DatabaseTermCalendar,
  UserSession as DatabaseUserSession,
  Major as DatabaseMajor,
  Minor as DatabaseMinor,
  Planner as DatabasePlanner
} from "./generated-types";

export type NewDepartment = Insertable<DatabaseDepartment>;
export type Department = Selectable<DatabaseDepartment>;
export type Course = Selectable<DatabaseCourse> & {
  department: Department;
};
export type NewCourse = Insertable<DatabaseCourse>;
export type User = Selectable<DatabaseUser>;
export type Schedule = Selectable<DatabaseSchedule>;
export type CourseScheduleEvent = Selectable<DatabaseCourseScheduleEvent>;
export type CustomScheduleEvent = Selectable<DatabaseCustomScheduleEvent>;
export type NewCustomScheduleEvent = Insertable<DatabaseCustomScheduleEvent>;
export type NewCourseScheduleEvent = Insertable<DatabaseCourseScheduleEvent>;
export type NewScheduleEvent = NewCourseScheduleEvent | NewCustomScheduleEvent;
export type ScheduleEvent = CourseScheduleEvent | CustomScheduleEvent;
export type SearchAlias = Selectable<DatabaseSearchAlias>;
export type TermCalendar = Selectable<DatabaseTermCalendar>;
export type UserSession = Selectable<DatabaseUserSession>;
export type Major = Selectable<DatabaseMajor>;
export type Minor = Selectable<DatabaseMinor>;
export type NewMajor = Insertable<DatabaseMajor>;
export type NewMinor = Insertable<DatabaseMinor>;
export type Planner = Selectable<DatabasePlanner>;