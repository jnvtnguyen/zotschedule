import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { DotsHorizontalIcon, EyeOpenIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";

import { Planner } from "@/lib/database/types";
import { Button } from "@/lib/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/lib/components/ui/dropdown-menu";
import { DeletePlannerDialog } from "./delete-planner-dialog";

type PlannersTablePlannerActionsProps = {
  planner: Planner;
};

export function PlannersTablePlannerActions({
  planner
}: PlannersTablePlannerActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return ( 
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <DotsHorizontalIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <Link to={`/planners/$plannerId`} params={{ plannerId: planner.id }}>
              <EyeOpenIcon className="w-4 h-4 mr-2" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Pencil1Icon className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeletePlannerDialog planner={planner} isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} />
    </>
  )
}