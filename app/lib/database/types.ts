import { Insertable, Selectable } from "kysely";

import {
  Course as DatabaseCourse,
  Department as DatabaseDepartment,
  User as DatabaseUser,
  Schedule as DatabaseSchedule,
  ScheduleEvent as DatabaseScheduleEvent,
  SearchAlias as DatabaseSearchAlias,
} from "./generated-types";

export type NewDepartment = Insertable<DatabaseDepartment>;
export type Department = Selectable<DatabaseDepartment>;
export type Course = Selectable<DatabaseCourse> & {
  department: Department;
};
export type NewCourse = Insertable<DatabaseCourse>;
export type User = Selectable<DatabaseUser>;
export type Schedule = Selectable<DatabaseSchedule>;
export type ScheduleEvent = Selectable<DatabaseScheduleEvent>;
export type SearchAlias = Selectable<DatabaseSearchAlias>;
