import { createServerFn } from "@tanstack/start";
import { TrashIcon } from "@radix-ui/react-icons";
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

type DeleteScheduleButtonProps = {
  schedule: Schedule;
};

const deleteSchedule = createServerFn("POST", async (schedule: Schedule) => {
  await database
    .deleteFrom("schedules")
    .where("id", "=", schedule.id)
    .executeTakeFirstOrThrow();
});

export function DeleteScheduleButton({ schedule }: DeleteScheduleButtonProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onDelete = async () => {
    try {
      await deleteSchedule(schedule);
      await queryClient.invalidateQueries({
        queryKey: ["schedules", schedule.userId],
      });
      toast({
        description: `The schedule "${schedule.name}" has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        description: `Failed to delete the schedule "${schedule.name}". Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={schedule.isDefault}>
          <TrashIcon className="w-5 h-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Are you sure you want to delete the schedule "{schedule.name}"?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
