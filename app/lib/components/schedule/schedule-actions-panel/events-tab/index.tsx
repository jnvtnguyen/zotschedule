import { useScheduleCalendarCourseEvents } from "@/lib/hooks/use-schedule-calendar-events";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { ScheduleActionsPanelCourseEventsList } from "./course-events-list";

export function ScheduleActionsPanelEventsTab() {
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }
  const courses = useScheduleCalendarCourseEvents(schedule.id);

  if (courses.status === "pending") return <></>;
  if (courses.status === "error") return <></>;

  return (
    <div className="h-full w-full space-y-4">
      <h2 className="text-2xl font-bold">Courses</h2>
      <ScheduleActionsPanelCourseEventsList
        events={courses.data}
        schedule={schedule}
      />
    </div>
  );
}
