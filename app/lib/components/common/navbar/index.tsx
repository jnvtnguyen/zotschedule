import { Link } from "@tanstack/react-router";

import { Button } from "@/lib/components/ui/button";
import { UserDropdown } from "./user-dropdown";
import { User } from "@/lib/database/types";

type NavbarProps = {
  user?: User;
};

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="top-0 flex min-h-16 h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
      <div></div>
      {user ? (
        <UserDropdown user={user} />
      ) : (
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/auth">Login</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
