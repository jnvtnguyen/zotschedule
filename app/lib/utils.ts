import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { Term } from "@/lib/uci/offerings/types";
import { TERM_LETTER_DICTIONARY } from "./uci/courses/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUnitsFromRange(units: [number, number]): string {
  if (units[0] === units[1]) {
    return `${units[0]}`;
  }

  return `${units[0]}-${units[1]}`;
}

export function parseLetteredTerm(term: string): Term {
  const year = parseInt(term.slice(1));
  return {
    quarter: TERM_LETTER_DICTIONARY[term[0]],
    year: `${(year >= 65 ? 1900 : 2000) + year}`,
  };
}
