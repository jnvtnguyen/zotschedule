import { Planner } from "@/lib/database/types"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/lib/components/ui/table";
import { PlannersTablePlanner } from "./planner";

type PlannersTableProps = {
  planners: Planner[];
};

export const PlannersTable = ({ planners }: PlannersTableProps) => {
  if (planners.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="max-w-xl text-center space-y-2">
          <h3 className="text-lg font-semibold">No Planners Found</h3>
          <p className="text-sm">
            Looks like you haven't created any planners yet. Start by
            creating a new planner by clicking the plus button above. From
            there, you can start adding courses to your planner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[4%]">
          </TableHead>
          <TableHead className="w-[20%]">Name</TableHead>
          <TableHead className="w-[10%]">Range</TableHead>
          <TableHead className="w-[10%]">Year Count</TableHead>
          <TableHead className="w-[10%]">Course Count</TableHead>
        </TableRow> 
      </TableHeader>
      <TableBody>
        {planners.map((planner) => (
          <PlannersTablePlanner
            key={planner.id}
            planner={planner}
          />
        ))}
      </TableBody>
    </Table>
  );
};