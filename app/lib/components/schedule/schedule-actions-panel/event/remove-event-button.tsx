import { Trash } from "@phosphor-icons/react";

import { Button } from "@/lib/components/ui/button";
import { ScheduleEvent } from "@/lib/database/types";
import { isCourseScheduleEvent } from "@/lib/uci/events/types";
import { useEventMutations } from "./event-mutations";

export function RemoveEventButton({ event }: { event: ScheduleEvent }) {
  const { remove } = useEventMutations({ scheduleId: event.scheduleId });

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={remove.isPending}
      onClick={() => remove.mutate(event)}
    >
      <Trash className="w-5 h-5" weight="fill" />
    </Button>
  );
}
