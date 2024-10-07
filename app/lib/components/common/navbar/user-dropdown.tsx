import { useNavigate } from "@tanstack/react-router";
import { PersonIcon } from "@radix-ui/react-icons";

import { AuthUser, logoutCurrentSession } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/lib/components/ui/dropdown-menu";

import { Button } from "@/lib/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";

type UserDropdownProps = {
  user: AuthUser;
};

export function UserDropdown({ user }: UserDropdownProps) {
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await logoutCurrentSession();
      navigate({ to: "/auth/login" });
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description: "Something went wrong while trying to logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <PersonIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
