import { useState } from "react";
import { CaretSortIcon, PlusIcon, StarFilledIcon } from "@radix-ui/react-icons";

import { AuthUser } from "@/lib/auth";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/ui/popover";
import { Separator } from "@/lib/components/ui/separator";
import { Schedule } from "@/lib/database/types";
import { Button } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils/style";
import { useScheduleContext } from "@/lib/hooks/use-schedule";
import { CreateScheduleDialog } from "./create-schedule-dialog";
import { DeleteScheduleButton } from "./delete-schedule-button";
import { SetDefaultScheduleButton } from "./set-default-schedule-button";

type SchedulesDropdownProps = {
  schedules: Schedule[];
};

export function SchedulesDropdown({ schedules }: SchedulesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateScheduleDialogOpen, setIsCreateScheduleDialogOpen] =
    useState(false);
  const currentSchedule = useScheduleContext((state) => state.schedule);
  const setSchedule = useScheduleContext((state) => state.setSchedule);

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            {currentSchedule ? currentSchedule.name : "Select a schedule..."}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-2 space-y-2">
          <div className="flex flex-col space-y-1">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-between", {
                    "bg-accent text-accent-foreground":
                      schedule.id === currentSchedule?.id,
                  })}
                  onClick={() => {
                    setSchedule(schedule);
                    setIsOpen(false);
                  }}
                >
                  {schedule.name}
                  {schedule.isDefault && <StarFilledIcon className="h-4 w-4" />}
                </Button>
                <div className="flex space-x-1">
                  <DeleteScheduleButton schedule={schedule} />
                  <SetDefaultScheduleButton schedule={schedule} />
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsCreateScheduleDialogOpen(true)}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </PopoverContent>
      </Popover>
      <CreateScheduleDialog
        isOpen={isCreateScheduleDialogOpen}
        onClose={() => setIsCreateScheduleDialogOpen(false)}
      />
    </>
  );
}
