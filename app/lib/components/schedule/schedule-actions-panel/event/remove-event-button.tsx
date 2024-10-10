import { Trash } from "@phosphor-icons/react";

import { Button } from "@/lib/components/ui/button";
import { ScheduleEvent } from "@/lib/database/types";
import { useEventMutations } from "./event-mutations";

type RemoveEventButtonProps = {
  event: ScheduleEvent;
  onRemove?: () => void;
};

export function RemoveEventButton({ event, onRemove }: RemoveEventButtonProps) {
  const { remove } = useEventMutations({ scheduleId: event.scheduleId });

  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={remove.isPending}
      onClick={() =>
        remove.mutate(event, {
          onSuccess: () => {
            onRemove?.();
          },
        })
      }
    >
      <Trash className="w-5 h-5" weight="fill" />
    </Button>
  );
}
