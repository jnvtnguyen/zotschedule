import { BellIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";

import { WebSocSection } from "@/lib/uci/offerings/types";
import { Button } from "@/lib/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/lib/components/ui/dropdown-menu";

type CourseOfferingsSectionActionsProps = {
  section: WebSocSection;
};

export function CourseOfferingsSectionActions({
  section,
}: CourseOfferingsSectionActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <DotsHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" align="start">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex gap-2">
          <BellIcon />
          Subscribe
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
