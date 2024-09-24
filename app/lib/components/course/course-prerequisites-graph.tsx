import { PrerequisiteTree } from "@/lib/uci/prerequisites/types";

type CoursePrerequisitesGraphProps = {
  prerequisiteTree: PrerequisiteTree;
};

export function CoursePrerequisitesGraph({
  prerequisiteTree,
}: CoursePrerequisitesGraphProps) {
  if (Object.keys(prerequisiteTree).length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <p className="text-muted-foreground font-semibold">
          No Prerequisites Found
        </p>
      </div>
    );
  }

  return <div className="w-full h-48"></div>;
}
