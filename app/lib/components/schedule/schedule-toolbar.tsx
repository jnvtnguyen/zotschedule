import { SchedulesDropdown } from "./schedules-dropdown";
import { ScheduleTimePicker } from "./schedule-time-picker";
import { useSchedules } from "@/lib/hooks/use-schedules";
import { useAuthUser } from "@/lib/hooks/use-auth-user";

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
      <SchedulesDropdown schedules={schedules} />
      <ScheduleTimePicker />
    </div>
  );
}
