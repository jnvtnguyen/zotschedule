import { Planner } from "@/lib/database/types";
import { TableCell, TableRow } from "@/lib/components/ui/table";
import { Button } from "@/lib/components/ui/button";
import { PlannersTablePlannerActions } from "./planner-actions";
import { Link } from "@tanstack/react-router";

type PlannersTablePlannerProps = {
  planner: Planner;
};

export function PlannersTablePlanner({
  planner
}: PlannersTablePlannerProps) {
  const range = planner.years.length > 0 ? (
    ""
  ) : "N/A";
  const years = planner.years.length;
  const courses = planner.years.reduce((acc, year) => {
    return acc + year.quarters.reduce((acc, quarter) => {
      return acc + quarter.courses.length;
    }, 0);
  }, 0);

  return (
    <TableRow>
      <TableCell>
        <PlannersTablePlannerActions planner={planner} />
      </TableCell>
      <TableCell>
        <Button variant="link" className="p-0" asChild>
          <Link to={"/planners/$plannerId"} params={{ plannerId: planner.id }}>
            {planner.name}
          </Link>
        </Button>
      </TableCell>
      <TableCell>{range}</TableCell>
      <TableCell>{years}</TableCell>
      <TableCell>{courses}</TableCell>
    </TableRow>
  )
}