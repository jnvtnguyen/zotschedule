import { NotePencil } from "@phosphor-icons/react";

import { Button } from "@/lib/components/ui/button";
import { CustomScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { useScheduleCalendar } from "./context";

type EditEventButtonProps = {
  event: CustomScheduleCalendarEvent;
};

export function EditEventButton({ event }: EditEventButtonProps) {
  const setEditing = useScheduleCalendar((state) => state.setEditing);

  return (
    <Button variant="ghost" size="icon" onClick={() => setEditing(event)}>
      <NotePencil className="w-5 h-5" />
    </Button>
  );
}
