import { XMLParser } from "fast-xml-parser";
import { createServerFn } from "@tanstack/start";

import {
  Division,
  Term,
  WEBSOC_URL,
  WebSocOptions,
  WebSocResponse,
} from "./types";

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

export const getOfferings = createServerFn(
  "POST",
  async ({
    term,
    options,
  }: {
    term: Term;
    options: WebSocOptions;
  }): Promise<WebSocResponse> => {
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
      YearTerm: getCodedTerm(term),
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
                  courses: getArrayFromObject(department["course"]).map(
                    (course) => {
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
                                    date: section["sec_final"][
                                      "sec_final_date"
                                    ],
                                    day: section["sec_final"]["sec_final_day"],
                                    time: section["sec_final"][
                                      "sec_final_time"
                                    ],
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
                                max: section["sec_enrollment"][
                                  "sec_max_enroll"
                                ],
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
                    },
                  ),
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
  },
);
