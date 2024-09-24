import { createServerFn } from "@tanstack/start";

import { Department } from "@/lib/database/types";
import { database } from "@/lib/database";

export const getDepartments = createServerFn(
  "GET",
  async (): Promise<Department[]> => {
    try {
      const departments = await database
        .selectFrom("departments")
        .selectAll()
        .execute();

      return departments;
    } catch (error) {
      throw error;
    }
  },
);
