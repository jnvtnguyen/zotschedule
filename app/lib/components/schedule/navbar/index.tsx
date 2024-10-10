import { AuthUser } from "@/lib/auth";
import { UserDropdown } from "@/lib/components/common/navbar/user-dropdown";
import { ScheduleToolbar } from "@/lib/components/schedule/schedule-toolbar";

type ScheduleNavbarProps = {
  user: AuthUser;
};

export function ScheduleNavbar({ user }: ScheduleNavbarProps) {
  return (
    <header className="top-0 flex min-h-16 h-16 items-center gap-4 border-b bg-background px-2 justify-between">
      <ScheduleToolbar />
      <UserDropdown user={user} />
    </header>
  );
}
