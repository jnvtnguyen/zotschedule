export const PREREQUISITES_URL = "https://www.reg.uci.edu/cob/prrqcgi";

export type PrerequisiteType = "course" | "exam";

export type Prerequisite = {
  type: PrerequisiteType;
  courseId?: string;
  examName?: string;
  minGrade?: string;
  isCorequisite?: boolean;
};

export type PrerequisiteTree = {
  AND?: (PrerequisiteTree | Prerequisite)[];
  OR?: (PrerequisiteTree | Prerequisite)[];
  NOT?: (PrerequisiteTree | Prerequisite)[];
};
