import { UserDropdown } from "@/lib/components/common/navbar/user-dropdown";
import { ScheduleToolbar } from "@/lib/components/schedule/schedule-toolbar";
import { User } from "@/lib/database/types";
import { ApplicationsDropdown } from "@/lib/components/common/navbar/applications-dropdown";

type ScheduleNavbarProps = {
  user: User;
};

export function ScheduleNavbar({ user }: ScheduleNavbarProps) {
  return (
    <header className="top-0 flex min-h-16 h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
      <ScheduleToolbar />
      <div className="flex gap-4 items-center">
        <ApplicationsDropdown />
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
