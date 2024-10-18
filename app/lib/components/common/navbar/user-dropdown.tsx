import { useNavigate } from "@tanstack/react-router";
import { PersonIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";

import { AuthUser, logoutCurrentSession } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/lib/components/ui/dropdown-menu";

import { Button } from "@/lib/components/ui/button";
import { toast } from "@/lib/hooks/use-toast";

type UserDropdownProps = {
  user: AuthUser;
};

export function UserDropdown({ user }: UserDropdownProps) {
  const { setTheme, theme } = useTheme();
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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={() => setTheme("system")}>
                System
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
