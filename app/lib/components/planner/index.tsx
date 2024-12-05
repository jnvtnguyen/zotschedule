import { Planner } from "@/lib/database/types";

type PlannerEditorProps = {
  planner: Planner;
}

export function PlannerEditor({ planner }: PlannerEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">{planner.name}</h1>
    </div>
  );
}