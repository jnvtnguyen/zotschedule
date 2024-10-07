import { XMLParser } from "fast-xml-parser";
import { createServerFn } from "@tanstack/start";
import { parseHTML } from "linkedom";
import NodeCache from "node-cache";

import {
  Division,
  Term,
  WEBSOC_URL,
  WebSocCourse,
  WebSocDepartment,
  WebSocOptions,
  WebSocResponse,
  WebSocSection,
} from "./types";
import { TERM_LETTER_DICTIONARY } from "@/lib/uci/courses/types";
import { groupBy } from "@/lib/utils/general";

const cache = new NodeCache({
  stdTTL: 1000 * 60 * 60 * 24, // 1 day
});

const getCodedTerm = (term: Term): string => {
  switch (term.quarter) {
    case "Fall":
      return `${term.year}-92`;
    case "Winter":
      return `${term.year}-03`;
    case "Spring":
      return `${term.year}-14`;
    case "Summer10wk":
      return `${term.year}-39`;
    case "Summer1":
      return `${term.year}-25`;
    case "Summer2":
      return `${term.year}-76`;
  }
};

const getCodedDivision = (division: Division): string => {
  switch (division) {
    case "ANY":
      return "all";
    case "LowerDiv":
      return "0xx";
    case "UpperDiv":
      return "1xx";
    case "Graduate":
      return "2xx";
  }
};

const getArrayFromObject = (object: any): any[] => {
  if (Array.isArray(object)) {
    return object;
  }
  return [object];
};

export const callWebSocAPI = async ({
  term,
  options,
}: {
  term: Term | string;
  options: WebSocOptions;
}): Promise<WebSocResponse> => {
  "use server";
  const {
    ge = "ANY",
    department = "ANY",
    courseNumber = "",
    division = "ANY",
    sectionCodes = "",
    instructorName = "",
    courseTitle = "",
    sectionType = "ANY",
    units = "",
    days = "",
    startTime = "",
    endTime = "",
    maxCapacity = "",
    fullCourses = "",
    cancelledCourses = "",
    building = "",
    room = "",
  } = options;

  const params = new URLSearchParams({
    Submit: "Display XML Results",
    YearTerm: typeof term === "string" ? term : getCodedTerm(term),
    ShowComments: "on",
    ShowFinals: "on",
    Breadth: ge,
    Dept: department,
    CourseNum: courseNumber,
    Division: getCodedDivision(division),
    CourseCodes: sectionCodes,
    InstrName: instructorName,
    CourseTitle: courseTitle,
    ClassType: sectionType,
    Units: units,
    Days: days,
    StartTime: startTime,
    EndTime: endTime,
    MaxCap: maxCapacity,
    FullCourses: fullCourses,
    CancelledCourses: cancelledCourses,
    Bldg: building,
    Room: room,
  });

  try {
    const response = await fetch(WEBSOC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const parsed = new XMLParser({
      attributeNamePrefix: "@",
      ignoreAttributes: false,
      parseAttributeValue: true,
    }).parse(await response.text());
    if (!parsed["websoc_results"] || !parsed["websoc_results"]["course_list"]) {
      return {
        schools: [],
      };
    }
    const result = {
      schools: getArrayFromObject(
        parsed["websoc_results"]["course_list"]["school"],
      ).map((school) => {
        return {
          name: school["@school_name"],
          comment: school["school_comment"],
          departments: getArrayFromObject(school["department"]).map(
            (department) => {
              return {
                code: department["@dept_code"],
                name: department["@dept_name"],
                comment: department["department_comment"],
                courses: getArrayFromObject(department["course"])
                  .filter((course) => {
                    if (
                      courseNumber &&
                      !courseNumber
                        .split(",")
                        .includes(String(course["@course_number"]))
                    ) {
                      return false;
                    }
                    return true;
                  })
                  .map((course) => {
                    return {
                      comment: course["course_comment"],
                      number: course["@course_number"],
                      title: course["@course_title"],
                      sections: getArrayFromObject(course["section"]).map(
                        (section) => {
                          return {
                            code: section["course_code"],
                            type: section["sec_type"],
                            number: section["sec_num"],
                            units: section["sec_units"],
                            modality: section["sec_modality"],
                            finalExam: section["sec_final"]
                              ? {
                                  date: section["sec_final"]["sec_final_date"],
                                  day: section["sec_final"]["sec_final_day"],
                                  time: section["sec_final"]["sec_final_time"],
                                }
                              : undefined,
                            instructors: getArrayFromObject(
                              section["sec_instructors"]["instructor"],
                            ),
                            meetings: getArrayFromObject(
                              section["sec_meetings"]["sec_meet"],
                            ).map((meeting) => ({
                              days: meeting["sec_days"],
                              time: meeting["sec_time"].replace(/\s/g, ""),
                              building: meeting["sec_bldg"],
                              room: meeting["sec_room"],
                            })),
                            enrollment: {
                              max: section["sec_enrollment"]["sec_max_enroll"],
                              current:
                                section["sec_enrollment"]["sec_enrolled"],
                              waitlist:
                                section["sec_enrollment"]["sec_waitlist"] ??
                                "n/a",
                              waitlistCapacity:
                                section["sec_enrollment"]["sec_wait_cap"],
                            },
                            restrictions: section["sec_restrictions"]
                              ? section["sec_restrictions"].split(/and/)
                              : [],
                            status: section["sec_status"],
                          };
                        },
                      ),
                    };
                  }),
              };
            },
          ),
        };
      }),
    };
    return result;
  } catch (error) {
    throw error;
  }
};

export const getWebSocTermOptions = createServerFn("GET", async () => {
  try {
    const response = await fetch(WEBSOC_URL, {
      method: "GET",
    });

    const { document } = parseHTML(await response.text());
    const terms = document.querySelectorAll("select[name='YearTerm'] option");
    return Array.from(terms)
      .map((term) => ({
        value: term.getAttribute("value")!,
        label: term.textContent!,
      }))
      .filter(
        (term) => !term.label.includes("COM") && !term.label.includes("Law"),
      );
  } catch (error) {
    throw error;
  }
});

export function parseLetteredTerm(term: string): Term {
  const year = parseInt(term.slice(1));
  return {
    quarter: TERM_LETTER_DICTIONARY[term[0]],
    year: `${(year >= 65 ? 1900 : 2000) + year}`,
  };
}

export const getWebSocInfoBySectionCodes = createServerFn(
  "POST",
  async (sections: { code: number; term: string }[]) => {
    try {
      const cached = sections
        .map((section) =>
          cache.get<{
            course: WebSocCourse;
            section: WebSocSection;
            department: WebSocDepartment;
          }>(section.code),
        )
        .filter((cached) => cached !== undefined);
      const uncached = sections.filter(
        (section) =>
          !cached.some((cached) => cached.section.code === section.code),
      );
      if (uncached.length > 0) {
        const grouped = groupBy(uncached, (section) => section.term);
        for (const term in grouped) {
          const response = await callWebSocAPI({
            term: term,
            options: {
              sectionCodes: grouped[term]
                .map((section) => section.code)
                .join(","),
            },
          });
          response.schools.forEach((school) => {
            school.departments.forEach((department) => {
              department.courses.forEach((course) => {
                course.sections.forEach((section) => {
                  cache.set(section.code, {
                    course,
                    section,
                    department,
                  });
                  cached.push({
                    course,
                    section,
                    department,
                  });
                });
              });
            });
          });
        }
      }
      return cached;
    } catch (error) {
      throw error;
    }
  },
);
