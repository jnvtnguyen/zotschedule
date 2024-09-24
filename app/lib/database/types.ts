import { Insertable, Selectable } from "kysely";

import {
  Course as DatabaseCourse,
  Department as DatabaseDepartment,
} from "./generated-types";

export type NewDepartment = Insertable<DatabaseDepartment>;
export type Department = Selectable<DatabaseDepartment>;
export type Course = Selectable<DatabaseCourse> & {
  department: Department;
};
export type NewCourse = Insertable<DatabaseCourse>;
