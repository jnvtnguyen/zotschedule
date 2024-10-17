import { CustomScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { ScheduleActionsPanelEventsListEvent } from "./event";

type ScheduleActionsPanelCustomEventsListProps = {
  events: CustomScheduleCalendarEvent[];
}

export function ScheduleActionsPanelCustomEventsList({
  events
}: ScheduleActionsPanelCustomEventsListProps) {
  const filtered = events.filter((event) => event.id !== "new");

  if (filtered.length === 0) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="max-w-xl text-center space-y-2">
          <h3 className="text-lg font-semibold">No Custom Events</h3>
          <p className="text-sm">
            Looks like you haven't saved any custom events yet. Click the plus button above or
            click somewhere on the calendar to create a new event.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
      {filtered.map((event) => (
        <ScheduleActionsPanelEventsListEvent
          key={event.id}
          event={event}
        />
      ))}
    </div>
  );
};