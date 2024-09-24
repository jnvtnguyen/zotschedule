import { parseHTML } from "linkedom";

import { NewCourse, NewDepartment } from "@/lib/database/types";
import { logger } from "@/lib/logger";
import {
  CATALOGUE_ALL_COURSES_URL,
  CATALOGUE_ALL_SCHOOLS_URL,
  CATALOGUE_BASE_URL,
  ENROLL_HISTORY_URL,
  GE_REGEXP,
} from "./types";

const getCourseUnitsFromText = (text: string): [number, number] => {
  if (text.includes("-")) {
    return text.split("-").map((unit) => parseInt(unit)) as [number, number];
  }
  return [parseInt(text), parseInt(text)];
};

const getAttribute = (body: string[], attr: string): string | undefined =>
  body
    .filter((x) => x.includes(attr))[0]
    ?.replace(attr, "")
    .trim();

const getArrayFromText = (text: string, delimiter: string): string[] =>
  text
    .replace(delimiter, "")
    .split(",")
    .map((item) => item.trim())
    .map((item) => (item.endsWith(".") ? item.slice(0, -1) : item));

const getArrayAttribute = (
  body: string[],
  attr: string,
  delimiter: string = ",",
): string[] | undefined => {
  const value = getAttribute(body, attr);
  if (value) {
    return getArrayFromText(value, delimiter);
  }
};

const normalized = (str: string) => str.normalize("NFKD") ?? "";

export const getDepartmentToURLMapping = async (): Promise<
  Map<NewDepartment, string>
> => {
  try {
    logger.info("Scraping all departments...");
    const response = await fetch(CATALOGUE_ALL_COURSES_URL);
    if (!response.ok) {
      throw new Error(
        `Scraping Error: ${response.statusText} at ${CATALOGUE_ALL_COURSES_URL}.`,
      );
    }
    const { document } = parseHTML(await response.text());
    const departmentToURLMapping = new Map<NewDepartment, string>();
    document
      .querySelectorAll("#atozindex > ul > li > a")
      .forEach((department) => {
        const departmentTextSplit = normalized(department.textContent!).split(
          "(",
        );
        const departmentTitle = departmentTextSplit[0].trim();
        const departmentCode = departmentTextSplit[1].slice(0, -1);
        departmentToURLMapping.set(
          {
            code: departmentCode,
            title: departmentTitle,
          },
          `${CATALOGUE_BASE_URL}${normalized(department.getAttribute("href")!)}`,
        );
      });
    return departmentToURLMapping;
  } catch (error) {
    throw error;
  }
};

export const getDepartmentToSchoolMapping = async (): Promise<
  Map<string, string>
> => {
  try {
    logger.info("Scraping all schools and their departments...");
    const response = await fetch(CATALOGUE_ALL_SCHOOLS_URL);
    if (!response.ok) {
      throw new Error(
        `Scraping Error: ${response.statusText} at ${CATALOGUE_ALL_SCHOOLS_URL}.`,
      );
    }
    const { document } = parseHTML(await response.text());
    const schoolURLs: string[] = [];
    document.querySelectorAll("#textcontainer > h4").forEach((school) => {
      schoolURLs.push(
        `${CATALOGUE_BASE_URL}${normalized(school.querySelector("a")!.getAttribute("href")!)}#courseinventory`,
      );
    });
    const departmentToSchoolMapping = new Map<string, string>();
    for (const url of schoolURLs) {
      const { school, departments } = await getSchoolAndDepartmentsFromURL(url);
      for (const department of departments) {
        departmentToSchoolMapping.set(department.code, school);
      }
    }
    return departmentToSchoolMapping;
  } catch (error) {
    throw error;
  }
};

export const getDepartmentsFromURL = async (
  url: string,
): Promise<NewDepartment[]> => {
  try {
    logger.info(`Scraping departments from ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Scraping Error: ${response.statusText} at ${url}.`);
    }
    const { document } = parseHTML(await response.text());
    const departments: NewDepartment[] = [];
    document
      .querySelectorAll("#courseinventorycontainer > .courses")
      .forEach((department) => {
        const header = department.querySelector("h3");
        if (!header) {
          return;
        }
        const departmentTitle = normalized(header.textContent!);
        if (departmentTitle) {
          const departmentCode = normalized(
            department.querySelector(".courseblock > .courseblocktitle")!
              .textContent!,
          )
            .split(".")[0]
            .split(" ")
            .slice(0, -1)
            .join(" ");
          departments.push({
            code: departmentCode,
            title: departmentTitle,
          });
        }
      });

    return departments;
  } catch (error) {
    throw error;
  }
};

export const getSchoolAndDepartmentsFromURL = async (
  url: string,
): Promise<{ school: string; departments: NewDepartment[] }> => {
  try {
    logger.info(`Scraping school and departments from ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Scraping Error: ${response.statusText} at ${url}.`);
    }
    const { document } = parseHTML(await response.text());
    const school = normalized(
      document.querySelector("#contentarea > h1.page-title")!.textContent!,
    );
    const departments = await getDepartmentsFromURL(url);
    return { school, departments };
  } catch (error) {
    throw error;
  }
};

export const getCoursesFromURL = async (url: string): Promise<NewCourse[]> => {
  try {
    logger.info(`Scraping courses from ${url}...`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Scraping Error: ${response.statusText} at ${url}.`);
    }
    const { document } = parseHTML(await response.text());
    const courses: NewCourse[] = [];
    const departmentCode = normalized(
      document.querySelector(".page-title")!.textContent!,
    )
      .split("(")[1]
      .slice(0, -1)
      .trim();
    const courseTerms = await getCourseTerms(departmentCode);
    document
      .querySelectorAll("#courseinventorycontainer > .courses > .courseblock")
      .forEach((courseBlock) => {
        const header: string[] = normalized(
          courseBlock.querySelector(".courseblocktitle")!.textContent!,
        )
          .split(". ")
          .map((line) => line.trim())
          .filter((line) => line);
        const courseName = header[0];
        const courseTitle = header[1];
        const courseUnits =
          header.length === 2
            ? ([0, 0] as [number, number])
            : getCourseUnitsFromText(header[2]);
        const courseBody: string[] = [];
        courseBlock
          .querySelectorAll(".courseblockdesc > p")
          .forEach((paragraph) => {
            const text = normalized(paragraph.textContent!)
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line);
            courseBody.push(...text);
          });
        const courseNameSplit = courseName.split(" ");
        const courseNumber = courseNameSplit[courseNameSplit.length - 1];
        const courseId = courseName.replace(/\s/g, "").trim();

        courses.push({
          id: courseId,
          title: courseTitle,
          number: courseNumber,
          description: courseBody[0],
          repeatability: getAttribute(courseBody, "Repeatability: "),
          gradingOption: getAttribute(courseBody, "Grading Option: "),
          concurrentWith:
            getArrayAttribute(courseBody, "Concurrent with ") ?? [],
          sameAs: getArrayAttribute(courseBody, "Same as ") ?? [],
          restriction: getAttribute(courseBody, "Restriction: "),
          overlapsWith: getArrayAttribute(courseBody, "Overlaps with ") ?? [],
          corequisite: getAttribute(courseBody, "Corequisite: "),
          units: JSON.stringify(courseUnits),
          ges: [
            ...(
              courseBody.filter((x) => x.match(/^\({1,2}[IV]/))[0] ?? ""
            ).matchAll(GE_REGEXP),
          ].map((x) => x.filter((y) => y)[1]),
          terms: [...(courseTerms.get(courseNumber) ?? [])],
          departmentCode: courseNameSplit.slice(0, -1).join(" "),
          prerequisiteTree: JSON.stringify({}),
        });
      });

    return courses;
  } catch (error) {
    throw error;
  }
};

export const getCoursesAndDepartments = async (): Promise<{
  courses: NewCourse[];
  departments: NewDepartment[];
}> => {
  logger.info("Scraping all courses...");
  const departmentToSchoolMapping = await getDepartmentToSchoolMapping();
  const departmentToURLMapping = await getDepartmentToURLMapping();
  const courses: NewCourse[] = [];
  for (const [department, url] of departmentToURLMapping) {
    const departmentCourses = await getCoursesFromURL(url);
    departmentCourses.forEach((departmentCourse) => {
      courses.push({
        ...departmentCourse,
        school: departmentToSchoolMapping.get(department.code),
      });
    });
  }
  const departments = Array.from(departmentToURLMapping.keys());
  return {
    courses,
    departments,
  };
};

export const getCourseTerms = async (
  department: string,
): Promise<Map<string, Set<string>>> => {
  logger.info(
    `Scraping course terms from ${ENROLL_HISTORY_URL} for ${department}...`,
  );
  const courseTerms = new Map<string, Set<string>>();
  let page: string;
  let pageCourseTerms: boolean;
  let ptr = -6;
  const params = new URLSearchParams({
    dept_name: department,
    action: "Submit",
    ptr: "",
  });
  try {
    do {
      const response = await fetch(ENROLL_HISTORY_URL, {
        method: "POST",
        body: params,
      });
      page = await response.text();
      if (!response.ok) {
        throw new Error(
          `Scraping Error: ${response.statusText} at ${ENROLL_HISTORY_URL}.`,
        );
      }
      const { document } = parseHTML(page);
      const warning = document.querySelector("tr td.lcRegWeb_red_message");
      if (warning?.textContent?.startsWith("No results found")) {
        return courseTerms;
      }
      pageCourseTerms = await getCourseTermsFromPage(page, courseTerms);
      ptr += 6;
      params.set("action", "Prev");
      params.set("ptr", ptr.toString());
    } while (pageCourseTerms);
  } catch (error) {
    throw error;
  }
  return courseTerms;
};

const getCourseTermsFromPage = async (
  page: string,
  courseTerms: Map<string, Set<string>>,
): Promise<boolean> => {
  let term: string = "";
  let entryFound = false;
  try {
    const { document } = parseHTML(page);
    document.querySelectorAll("table tr").forEach((course) => {
      if (course.children.length === 15) {
        const termText = course.children[0].textContent!.trim();
        if (termText === "Term") {
          return;
        }
        if (termText.length === 3) {
          term = termText;
          entryFound = true;
        }
        if (term && termText.length === 0) {
          const courseNumber = course.children[4].textContent!.trim();
          if (!courseTerms.has(courseNumber)) {
            courseTerms.set(courseNumber, new Set());
          }
          courseTerms.get(courseNumber)!.add(term);
        }
      }
      return true;
    });
    if (!document.querySelector('a:contains("Prev")')) {
      entryFound = false;
      return false;
    }
  } catch (error) {
    throw error;
  }
  return entryFound;
};
