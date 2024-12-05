import { createServerFn } from "@tanstack/start";
import { useQueryClient } from "@tanstack/react-query";

import { database } from "@/lib/database";
import { Planner } from "@/lib/database/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/lib/components/ui/alert-dialog";
import { useToast } from "@/lib/hooks/use-toast";

type DeletePlannerDialogProps = {
  planner: Planner;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const deletePlanner = createServerFn("POST", async (planner: Planner) => {
  await database
    .deleteFrom("planners")
    .where("id", "=", planner.id)
    .executeTakeFirstOrThrow();
});

export function DeletePlannerDialog({ planner, isOpen, onOpenChange }: DeletePlannerDialogProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const onDelete = async () => {
    try {
      await deletePlanner(planner);
      await queryClient.invalidateQueries({
        queryKey: ["planners", planner.userId],
      });
      toast({
        description: `The planner "${planner.name}" has been successfully deleted.`,
      });
    } catch (error) {
      toast({
        description: `Failed to delete the planner "${planner.name}". Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Planner</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Are you sure you want to delete the planner "{planner.name}"?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}