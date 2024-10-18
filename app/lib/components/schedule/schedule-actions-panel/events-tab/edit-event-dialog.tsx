import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/lib/components/ui/dialog";
import { CustomScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { NewEventForm } from "@/lib/components/schedule/new-event-form";
import { useSchedule } from "@/lib/hooks/use-schedule";

type EditEventDialogProps = {
  event: CustomScheduleCalendarEvent;
  isOpen: boolean;
  onClose: () => void;
};

export function EditEventDialog({
  event,
  isOpen,
  onClose,
}: EditEventDialogProps) {
  const [data, setData] = useState(event);
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent isCloseable>
        <DialogHeader>
          <DialogTitle>
            {data.id === "new" ? "New Event" : "Edit Event"}
          </DialogTitle>
        </DialogHeader>
        <NewEventForm
          schedule={schedule}
          event={data}
          onClose={onClose}
          isLocalColor={false}
          onEventChange={(changes) =>
            setData({
              ...data,
              ...changes,
            })
          }
        />
      </DialogContent>
    </Dialog>
  );
}
