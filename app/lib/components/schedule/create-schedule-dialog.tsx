import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/components/ui/dialog";
import { CreateScheduleForm } from "./create-schedule-form";
import { AuthUser } from "@/lib/auth";

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
