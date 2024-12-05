export const DEGREES_URL = "https://catalogue.uci.edu/undergraduatedegrees/";

export type Requirement = {
  name: string;
  children: (Requirement | string)[];
}; 