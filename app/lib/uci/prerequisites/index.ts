import { parseHTML } from "linkedom";

import {
  Prerequisite,
  PREREQUISITES_URL,
  PrerequisiteTree,
  PrerequisiteType,
} from "./types";
import { logger } from "@/lib/logger";

const createPrerequisite = (
  type: PrerequisiteType,
  requirement: string,
  grade?: string,
  corerequisite?: boolean,
): Prerequisite => {
  const prerequisite: Prerequisite = { type };
  if (type === "course") {
    prerequisite.courseId = requirement;
  } else {
    prerequisite.examName = requirement;
  }
  if (grade) {
    prerequisite.minGrade = grade;
  }
  if (corerequisite) {
    prerequisite.isCorequisite = true;
  }
  return prerequisite;
};

const parsePrerequisite = (prerequisiteText: string): Prerequisite | null => {
  const prerequisiteWithGrade = prerequisiteText.match(
    /^([^()]+)\s+\( min ([^\s]+) = ([^\s]{1,2}) \)$/,
  );
  if (prerequisiteWithGrade) {
    if (prerequisiteWithGrade[2].trim() === "grade") {
      return createPrerequisite(
        "course",
        prerequisiteWithGrade[1].trim(),
        prerequisiteWithGrade[3].trim(),
      );
    } else {
      return createPrerequisite(
        "exam",
        prerequisiteWithGrade[1].trim(),
        prerequisiteWithGrade[3].trim(),
      );
    }
  }
  const courseCorerequisite = prerequisiteText.match(
    /^([^()]+)\s+\( coreq \)$/,
  );
  if (courseCorerequisite) {
    return createPrerequisite(
      "course",
      courseCorerequisite[1].trim(),
      undefined,
      true,
    );
  }
  const courseMatch = prerequisiteText.match(/^AP.*|^[A-Z0-9&/\s]+\d\S*$/);
  if (courseMatch) {
    if (prerequisiteText.startsWith("AP")) {
      return createPrerequisite("exam", prerequisiteText);
    } else {
      return createPrerequisite("course", prerequisiteText);
    }
  }
  return null;
};

const parseNOPrerequisite = (prerequisiteText: string): Prerequisite | null => {
  const noAPPrerequisite = prerequisiteText.match(
    /^NO\s(AP\s.+?)\sscore\sof\s(\d)\sor\sgreater$/,
  );
  if (noAPPrerequisite) {
    return createPrerequisite(
      "exam",
      noAPPrerequisite[1].trim(),
      noAPPrerequisite[2].trim(),
    );
  }
  const noCourseMatch = prerequisiteText.match(/^NO\s([A-Z0-9&/\s]+\d\S*)$/);
  if (noCourseMatch) {
    return createPrerequisite("course", noCourseMatch[1].trim());
  }
  return null;
};

const buildORLeaf = (
  prerequisiteTree: PrerequisiteTree,
  prerequisiteText: string,
): void => {
  let prerequisite: Prerequisite | null;
  if (prerequisiteText.startsWith("NO")) {
    prerequisite = parseNOPrerequisite(prerequisiteText);
  } else {
    prerequisite = parsePrerequisite(prerequisiteText);
  }
  if (prerequisite) {
    prerequisiteTree.OR?.push(prerequisite);
  }
};

const buildANDLeaf = (
  prerequisiteTree: PrerequisiteTree,
  prerequisiteText: string,
): void => {
  if (prerequisiteText.startsWith("NO")) {
    const prerequisite = parseNOPrerequisite(prerequisiteText);
    if (prerequisite) {
      prerequisiteTree.NOT?.push(prerequisite);
    }
  } else {
    const prerequisite = parsePrerequisite(prerequisiteText);
    if (prerequisite) {
      prerequisiteTree.AND?.push(prerequisite);
    }
  }
};

const buildPrerequisiteTree = (prerequisitesText: string): PrerequisiteTree => {
  const prerequisiteTree: PrerequisiteTree = { AND: [], NOT: [] };
  const prerequisites = prerequisitesText.split(/AND/);
  for (let prerequisite of prerequisites) {
    prerequisite = prerequisite.trim();
    if (prerequisite.startsWith("(")) {
      const orprerequisites = prerequisite.slice(1, -1).trim().split(/OR/);
      const orprerequisiteTree: PrerequisiteTree = { OR: [] };
      for (const orprerequisite of orprerequisites) {
        buildORLeaf(orprerequisiteTree, orprerequisite.trim());
      }
      if (orprerequisiteTree.OR?.length === 0) {
        delete orprerequisiteTree.OR;
      }
      if (orprerequisiteTree.OR) {
        prerequisiteTree.AND?.push(orprerequisiteTree);
      }
    } else {
      buildANDLeaf(prerequisiteTree, prerequisite);
    }
  }
  if (prerequisiteTree.AND?.length === 0) {
    delete prerequisiteTree.AND;
  }
  if (prerequisiteTree.NOT?.length === 0) {
    delete prerequisiteTree.NOT;
  }
  return prerequisiteTree;
};

export const getPrerequisitesForDepartment = async (
  department: string,
): Promise<Map<string, PrerequisiteTree>> => {
  logger.info(
    `Scraping prerequisites from ${PREREQUISITES_URL} for ${department}...`,
  );
  const prerequisites = new Map<string, PrerequisiteTree>();
  try {
    const params = new URLSearchParams({
      dept: department,
      action: "view_all",
    });
    const response = await fetch(PREREQUISITES_URL, {
      method: "POST",
      body: params,
    });
    const { document } = parseHTML(await response.text());
    document.querySelectorAll("table tr").forEach((prerequisite) => {
      let courseId = prerequisite
        .querySelector("td.course")
        ?.textContent?.replace(/\s+/g, " ")
        .trim()
        .replace(/\s/g, "");
      const prerequisitesText = prerequisite
        .querySelector("td.prereq")
        ?.textContent?.replace(/\s+/g, " ")
        .trim();
      if (!courseId || !prerequisitesText) {
        return;
      }
      if (courseId.match(/\* ([&A-Z\d ]+) since/)) {
        courseId = courseId.split("*")[0].trim();
      }
      const prerequisiteTree = buildPrerequisiteTree(prerequisitesText);
      if (Object.keys(prerequisiteTree).length > 0) {
        prerequisites.set(courseId, prerequisiteTree);
      }
    });
    return prerequisites;
  } catch (error) {
    throw error;
  }
};

export const getPrerequisites = async (): Promise<
  Map<string, Map<string, PrerequisiteTree>>
> => {
  logger.info("Scraping all course prerequisites...");
  const departmentToCoursesMapping = new Map<
    string,
    Map<string, PrerequisiteTree>
  >();
  try {
    const response = await fetch(PREREQUISITES_URL);
    const { document } = parseHTML(await response.text());
    const departmentOptions = document.querySelectorAll(
      "select[name='dept'] option",
    );
    for (const departmentOption of departmentOptions) {
      const department = departmentOption.textContent!.trim();
      const courses = await getPrerequisitesForDepartment(department);
      if (courses.size > 0) {
        departmentToCoursesMapping.set(department, courses);
      }
    }

    Object.values(departmentToCoursesMapping).forEach(
      (courses: Map<string, PrerequisiteTree>) => {
        courses.forEach((prerequisiteTree) => {
          if (prerequisiteTree.AND) {
            if (
              !prerequisiteTree.NOT &&
              prerequisiteTree.AND.length === 1 &&
              "OR" in prerequisiteTree.AND[0]
            ) {
              prerequisiteTree.OR = prerequisiteTree.AND[0].OR;
              delete prerequisiteTree.AND;
            } else if (prerequisiteTree.NOT) {
              prerequisiteTree.AND.push({ NOT: prerequisiteTree.NOT });
              delete prerequisiteTree.NOT;
            }
          }
        });
      },
    );

    return departmentToCoursesMapping;
  } catch (error) {
    throw error;
  }
};
