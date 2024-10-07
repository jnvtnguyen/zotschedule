import { useScheduleCalendarEvents } from "@/lib/hooks/use-schedule-calendar-events";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { ScheduleActionsPanelCourseEventsList } from "./course-events-list";

export function ScheduleActionsPanelEventsTab() {
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }
  const events = useScheduleCalendarEvents(schedule.id);

  if (events.status === "pending") return <></>;
  if (events.status === "error") return <></>;

  return (
    <div className="h-full w-full space-y-4">
      <h2 className="text-2xl font-bold">Courses</h2>
      <ScheduleActionsPanelCourseEventsList
        events={events.data}
        schedule={schedule}
      />
    </div>
  );
}
