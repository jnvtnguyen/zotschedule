import { Table } from "@tanstack/react-table";

import { Course } from "@/lib/database/types";
import { CourseRow } from "./course-row";

type CourseListProps = {
  table: Table<Course>;
};

export function CourseList({ table }: CourseListProps) {
  return (
    <>
      {table.getRowModel().rows?.length ? (
        <div className="flex flex-col gap-4">
          {table.getRowModel().rows.map((row) => (
            <CourseRow key={row.id} course={row.getValue("course")} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center w-full h-64 p-4 font-semibold text-muted-foreground">
          No Courses Found.
        </div>
      )}
    </>
  );
}
