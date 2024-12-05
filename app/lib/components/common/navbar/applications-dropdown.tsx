import { DotsNine } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/lib/components/ui/dropdown-menu";
import { Button } from "@/lib/components/ui/button";

export function ApplicationsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <DotsNine className="w-7 h-7" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link to="/">Schedule</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/planners">Planners</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}