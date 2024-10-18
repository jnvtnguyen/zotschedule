import { useNavigate } from "@tanstack/react-router";
import { useTheme } from "next-themes";
import { createServerFn } from "@tanstack/start";
import { getEvent, setCookie } from "vinxi/http";

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

import { toast } from "@/lib/hooks/use-toast";
import { User } from "@/lib/database/types";
import { validateCurrentSession } from "@/lib/auth";
import { database } from "@/lib/database";
import { Avatar, AvatarFallback, AvatarImage } from "@/lib/components/ui/avatar";

export const logoutCurrentSession = createServerFn("POST", async () => {
  const { session } = await validateCurrentSession();
  if (!session) {
    return {
      success: false,
    };
  }

  await database
    .deleteFrom("userSessions")
    .where("userSessions.id", "=", session.id)
    .execute();
  const event = getEvent();
  setCookie(event, "session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
  return {
    success: true,
  };
});

type UserDropdownProps = {
  user: User;
};

export function UserDropdown({ user }: UserDropdownProps) {
  const { setTheme, theme } = useTheme();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await logoutCurrentSession();
      navigate({ to: "/auth" });
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
      <DropdownMenuTrigger>
        <Avatar>
          <img src={user.picture} alt={user.name} />
          <AvatarFallback>
            {user.name[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
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
