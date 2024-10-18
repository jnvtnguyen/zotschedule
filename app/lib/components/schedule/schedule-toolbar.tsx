import { useSchedules } from "@/lib/hooks/use-schedules";
import { useAuthUser } from "@/lib/hooks/use-auth-user";
import { SchedulesDropdown } from "./schedules-dropdown";
import { ScheduleTimePicker } from "./schedule-time-picker";
import { ScheduleNavigation } from "./schedule-navigation";

export function ScheduleToolbar() {
  const user = useAuthUser((state) => state.user);
  const { data: schedules, status } = useSchedules(user.id);

  if (status === "pending") {
    return <></>;
  }

  if (status === "error") {
    return <></>;
  }

  return (
    <div className="flex flex-row w-full justify-between">
      <div className="flex flex-row gap-2 items-center">
        <div className="hidden md:block">
          <SchedulesDropdown schedules={schedules} />
        </div>
        <ScheduleNavigation />
      </div>
      <div className="hidden md:block">
        <ScheduleTimePicker />
      </div>
    </div>
  );
}
