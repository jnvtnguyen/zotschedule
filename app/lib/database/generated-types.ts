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
  gradingOption: string | null;
  concurrentWith: string[];
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
export type DB = {
  courses: Course;
  departments: Department;
};
