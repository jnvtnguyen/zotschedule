import { createServerFn } from "@tanstack/start";
import { StarFilledIcon } from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";

import { database } from "@/lib/database";
import { Schedule } from "@/lib/database/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/lib/components/ui/alert-dialog";
import { Button } from "@/lib/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";

type SetDefaultScheduleButtonProps = {
  schedule: Schedule;
};

const setDefaultSchedule = createServerFn(
  "POST",
  async (schedule: Schedule) => {
    await database.updateTable("schedules").set({ isDefault: false }).execute();
    await database
      .updateTable("schedules")
      .set({ isDefault: true })
      .where("id", "=", schedule.id)
      .execute();
  },
);

export function SetDefaultScheduleButton({
  schedule,
}: SetDefaultScheduleButtonProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onSetDefault = async () => {
    try {
      await setDefaultSchedule(schedule);
      await queryClient.invalidateQueries({
        queryKey: ["schedules", schedule.userId],
      });
      toast({
        description: `The schedule "${schedule.name}" has been successfully set as the default schedule.`,
      });
    } catch (error) {
      toast({
        description: `Failed to set the schedule "${schedule.name}" as the default schedule. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={schedule.isDefault}>
          <StarFilledIcon className="w-5 h-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Set Default Schedule</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Are you sure you want to set the schedule "{schedule.name}" as the
          default schedule?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSetDefault}>
            Set Default
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
