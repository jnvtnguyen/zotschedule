import { createServerFn } from "@tanstack/start";
import { CaretDownIcon } from "@radix-ui/react-icons";

import { database } from "@/lib/database";
import { Schedule } from "@/lib/database/types";
import { useScheduleCalendar } from "@/lib/hooks/use-schedule-calendar";
import { View } from "@/lib/hooks/use-schedule-calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/lib/components/ui/dropdown-menu";
import { Button } from "@/lib/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { useSchedule } from "@/lib/hooks/use-schedule";

const syncSchedule = createServerFn(
  "POST",
  async ({
    schedule,
    preferences
  }: {
    schedule: Schedule;
    preferences: Partial<{ showWeekends: boolean; view: View; }>;
  }) => {
    await database
      .updateTable("schedules")
      .where("id", "=", schedule.id)
      .set({ ...Object.fromEntries(Object.entries(preferences).filter(([_, v]) => v !== undefined)) })
      .executeTakeFirstOrThrow();
  },
);

const VIEW_TO_LABEL: Record<View, string> = {
  dayGridMonth: "Month",
  timeGridWeek: "Week",
  timeGridDay: "Day",
  listYear: "Schedule",
};

export function ScheduleTimePicker() {
  const { toast } = useToast();
  const view = useScheduleCalendar((state) => state.view);
  const setView = useScheduleCalendar((state) => state.setView);
  const showWeekends = useScheduleCalendar((state) => state.showWeekends);
  const setShowWeekends = useScheduleCalendar((state) => state.setShowWeekends);
  const schedule = useSchedule((state) => state.schedule);

  if (!schedule) {
    return <></>;
  }

  const onChange = async ({ showWeekends, view }: Partial<{ showWeekends: boolean; view: View; }>) => {
    const preferences = { showWeekends, view };
    if (showWeekends !== undefined) {
      setShowWeekends(showWeekends);
    }
    if (view) {
      setView(view);
    }
    try {
      await syncSchedule({ schedule, preferences });
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description:
          "Something went wrong while trying to sync your schedule preferences.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="font-normal gap-1 px-3 pr-2">
          {VIEW_TO_LABEL[view]}
          <CaretDownIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => onChange({ view: "timeGridDay" })}>
          Day
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange({ view: "timeGridWeek" })}>
          Week
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChange({ view: "dayGridMonth" })}>
          Month
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showWeekends}
          onCheckedChange={(checked) => onChange({ showWeekends: checked })}
        >
          Show weekends
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
