import { Link } from "@tanstack/react-router";

import { AuthUser } from "@/lib/auth";
import { Button } from "@/lib/components/ui/button";
import { UserDropdown } from "./user-dropdown";

type NavbarProps = {
  user?: AuthUser;
};

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="top-0 flex min-h-16 h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
      <div></div>
      {user ? (
        <UserDropdown user={user} />
      ) : (
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/auth/signup">Signup</Link>
          </Button>
        </div>
      )}
    </header>
  );
}
