import { Expression } from "kysely";
import { jsonObjectFrom } from "kysely/helpers/postgres";

import { database } from "@/lib/database";

export const department = (departmentCode: Expression<string>) => {
  return jsonObjectFrom(
    database
      .selectFrom("departments")
      .select(["departments.code", "departments.title"])
      .where("departments.code", "=", departmentCode),
  )
    .$notNull()
    .as("department");
};
