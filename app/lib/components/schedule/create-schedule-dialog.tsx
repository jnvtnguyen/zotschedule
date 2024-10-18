import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/lib/components/ui/dialog";
import { CreateScheduleForm } from "./create-schedule-form";

type CreateScheduleDialogProps = {
  isOpen: boolean;
  isCloseable?: boolean;
  onClose?: () => void;
};

export function CreateScheduleDialog({
  isOpen,
  isCloseable = true,
  onClose,
}: CreateScheduleDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent isCloseable={isCloseable}>
        <DialogHeader>
          <DialogTitle>Create Schedule</DialogTitle>
          <DialogDescription>
            Create a new schedule to store your classes and events.
          </DialogDescription>
        </DialogHeader>
        <CreateScheduleForm
          onScheduleCreate={() => {
            onClose?.();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
