export type PlannerYear = {
  year: number;
  quarters: PlannerQuarter[];
};

export type PlannerQuarter = {
  quarter: 'Fall' | 'Winter' | 'Spring' | 'Summer1' | 'Summer10wk' | 'Summer2';
  courses: string[];
};