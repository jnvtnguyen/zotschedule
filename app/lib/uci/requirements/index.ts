import { parseHTML } from "linkedom";

import { DEGREES_URL, Requirement } from "./types";
import { NewMajor, NewMinor } from "@/lib/database/types";

const normalized = (str: string) => str.normalize("NFKD") ?? "";

type WebDegree = {
  name: string;
  url: string;
};

const getRequirementsFromURL = async (url: string): Promise<Requirement[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Scraping Error: ${response.statusText} at ${url}.`);
    }
    const { document } = parseHTML(await response.text());
    const requirements: Requirement[] = [];
    const tables = document.querySelectorAll('.sc_courselist');
    tables.forEach((table) => {
      const rows = table.querySelectorAll("tr"); 
      rows.forEach((row, index) => {
        const current = requirements[requirements.length - 1];
        const comment = row.querySelector(".courselistcomment:not(.commentindent)");
        const indented = row.querySelector(".commentindent");
        const course = row.querySelector(".codecol");
        if (comment && row.querySelector(".areaheader")) {
          requirements.push({
            name: comment.textContent!.trim(),
            children: [],
          });
          return;
        }
        if (comment && comment.textContent?.trim() !== "or") {
          requirements.push({
            name: comment.textContent!.trim(),
            children: [],
          });
          return;
        }
        if (course && current) {
          if (rows[index - 1]?.textContent?.trim() === "or" || rows[index + 1]?.textContent?.trim() === "or") {
            current.children.push({
              name: `Group ${current.children.length + 1}`,
              children: [course.textContent!.trim()],
            });
          } else {
            current.children.push(course.textContent!.trim());
          }
          return;
        }
        if (indented && current) {
          current.children.push(indented.textContent!.trim());
        }
      });
    });
    return requirements;
  } catch(error) {
    throw error;
  }
};

const getDegrees = async (): Promise<{
  majors: WebDegree[];
  minors: WebDegree[];
}> => {
  try {
    const response = await fetch(DEGREES_URL);
    if (!response.ok) {
      throw new Error(`Scraping Error: ${response.statusText} at ${DEGREES_URL}.`);
    }
    const { document } = parseHTML(await response.text());
    const majors: WebDegree[] = [];
    const minors: WebDegree[] = [];
    document.querySelectorAll("a").forEach((link) => {
      const name = link.textContent!.trim();
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }
      if (!majors.some((m) => m.name === name) && ['bs/', 'ba/', 'bfa/'].some((i) => href.includes(i))) {
        majors.push({
          name,
          url: `https://catalogue.uci.edu${href}`,
        });
      }
      if (!minors.some((m) => m.name === name) && ['minor/'].some((i) => href.includes(i))) {
        minors.push({
          name,
          url: `https://catalogue.uci.edu${href}`,
        });
      }
    });
    return { majors, minors };
  } catch(error) {
    throw error;
  }
};

export const getMajorsMinors = async (): Promise<{
  majors: NewMajor[];
  minors: NewMinor[];
}> => {
  const degrees = await getDegrees();
  const majors = await Promise.all(
    degrees.majors.map(async (major) => {
      const requirements = await getRequirementsFromURL(major.url);
      return {
        name: major.name,
        requirements: JSON.stringify(requirements),
      };
    }),
  );
  const minors = await Promise.all(
    degrees.minors.map(async (minor) => {
      const requirements = await getRequirementsFromURL(minor.url);
      return {
        name: minor.name,
        requirements: JSON.stringify(requirements),
      };
    }),
  );
  return { majors, minors };
};