import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/components/ui/dialog";
import {
  CustomRecurrence,
  CustomRecurrenceForm,
} from "./custom-recurrence-form";

type CustomReccurenceDialogProps = {
  open: boolean;
  start: Date;
  data?: CustomRecurrence;
  onClose: (data?: CustomRecurrence) => void;
};

export function CustomRecurrenceDialog({
  open,
  start,
  data,
  onClose,
}: CustomReccurenceDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-normal">Custom Recurrence</DialogTitle>
        </DialogHeader>
        <CustomRecurrenceForm start={start} onClose={onClose} data={data} />
      </DialogContent>
    </Dialog>
  );
}
