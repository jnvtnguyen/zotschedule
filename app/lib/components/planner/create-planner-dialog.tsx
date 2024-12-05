import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/lib/components/ui/dialog";
import { CreatePlannerForm } from "./create-planner-form";

type CreatePlannerDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreatePlannerDialog({
  isOpen,
  onClose,
}: CreatePlannerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Planner</DialogTitle>
          <DialogDescription>
            Create a new planner to plan your academic journey.
          </DialogDescription>
        </DialogHeader>
        <CreatePlannerForm
          onPlannerCreate={() => {
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
