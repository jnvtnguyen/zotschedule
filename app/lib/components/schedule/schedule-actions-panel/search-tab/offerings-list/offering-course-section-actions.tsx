import { PlusIcon } from "@radix-ui/react-icons";

import { WebSocSection } from "@/lib/uci/offerings/types";
import { Button } from "@/lib/components/ui/button";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { useScheduleCalendarEvents } from "@/lib/hooks/use-schedule-calendar-events";
import { useScheduleActionsPanel } from "@/lib/components/schedule/schedule-actions-panel/context";
import {
  DEFAULT_EVENT_COLOR,
  isCourseScheduleEvent,
} from "@/lib/uci/events/types";
import { useEventMutations } from "@/lib/components/schedule/schedule-actions-panel/event/event-mutations";
import { RemoveEventButton } from "@/lib/components/schedule/schedule-actions-panel/event/remove-event-button";

export function ScheduleActionsPanelOfferingCourseSectionActions({
  section,
}: {
  section: WebSocSection;
}) {
  const term = useScheduleActionsPanel((state) => state.term);
  const schedule = useSchedule((state) => state.schedule);

  if (!schedule) {
    return;
  }

  const events = useScheduleCalendarEvents(schedule.id);
  const { add } = useEventMutations({ scheduleId: schedule.id });

  if (events.status === "pending") return <></>;
  if (events.status === "error") return <></>;

  const event = events.data.find(
    (event) =>
      isCourseScheduleEvent(event) && event.sectionCode === section.code,
  );

  return (
    <>
      {!event ? (
        <Button
          variant="ghost"
          size="icon"
          disabled={add.isPending}
          onClick={() =>
            add.mutate({
              scheduleId: schedule.id,
              sectionCode: section.code,
              term,
              color: DEFAULT_EVENT_COLOR,
            })
          }
        >
          <PlusIcon className="w-5 h-5" />
        </Button>
      ) : (
        <RemoveEventButton event={event} />
      )}
    </>
  );
}
