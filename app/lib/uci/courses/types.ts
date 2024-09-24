import { Quarter } from "@/lib/uci/offerings/types";

export const CATALOGUE_BASE_URL = "http://catalogue.uci.edu";
export const CATALOGUE_ALL_COURSES_URL = `${CATALOGUE_BASE_URL}/allcourses`;
export const CATALOGUE_ALL_SCHOOLS_URL = `${CATALOGUE_BASE_URL}/schoolsandprograms`;
export const ENROLL_HISTORY_URL = "https://www.reg.uci.edu/perl/EnrollHist.pl";

export const GE_DICTIONARY = {
  Ia: "Lower Division Writing",
  Ib: "Upper Division Writing",
  II: "Science and Technology",
  III: "Social and Behavioral Sciences",
  IV: "Arts and Humanities",
  Va: "Quantitative Literacy",
  Vb: "Formal Reasoning",
  VI: "Language Other Than English",
  VII: "Multicultural Studies",
  VIII: "International/Global Issues",
};

export const GE_REGEXP =
  /(I[Aa])|(I[Bb])|[( ](II)[) ]|[( ](III)[) ]|(IV)|(V\.?[Aa])|(V\.?[Bb])|[( ](VI)[) ]|[( ](VII)[) ]|(VIII)/g;

export const UNITS_DICTIONARY = {
  1: "1 Unit",
  2: "2 Units",
  3: "3 Units",
  4: "4 Units",
  5: "5 Units",
  6: "6 Units",
  7: "7 Units",
  8: "8 Units",
};

export const TERM_LETTER_DICTIONARY: Record<string, Quarter> = {
  F: "Fall",
  W: "Winter",
  S: "Spring",
  Y: "Summer1",
  M: "Summer10wk",
  Z: "Summer2",
};
