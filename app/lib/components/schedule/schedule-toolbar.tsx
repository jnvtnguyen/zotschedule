import { Schedule } from "@/lib/database/types";
import { SchedulesDropdown } from "./schedules-dropdown";
import { ScheduleTimePicker } from "./schedule-time-picker";

type ScheduleToolbarProps = {
  schedules: Schedule[];
};

export function ScheduleToolbar({ schedules }: ScheduleToolbarProps) {
  return (
    <div className="flex flex-row w-full justify-between">
      <SchedulesDropdown schedules={schedules} />
      <ScheduleTimePicker />
    </div>
  );
}
