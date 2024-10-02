import { useNavigate } from "@tanstack/react-router";
import { PersonIcon } from "@radix-ui/react-icons";

import { AuthUser, logoutSession } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/lib/components/ui/dropdown-menu";

import { Button } from "@/lib/components/ui/button";

type UserDropdownProps = {
  user: AuthUser;
};

export function UserDropdown({ user }: UserDropdownProps) {
  const navigate = useNavigate();

  const onLogout = async () => {
    await logoutSession();
    navigate({ to: "/auth/login" });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <PersonIcon className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
