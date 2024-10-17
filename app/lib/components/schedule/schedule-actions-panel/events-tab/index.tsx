import { useState } from "react";
import { addHours } from "date-fns";
import { PlusIcon } from "@radix-ui/react-icons";

import { useScheduleCalendarCourseEvents, useScheduleCalendarCustomEvents } from "@/lib/hooks/use-schedule-calendar-events";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { NEW_EVENT } from '@/lib/components/schedule/schedule-calendar';
import { Button } from "@/lib/components/ui/button";
import { Separator } from "@/lib/components/ui/separator";
import { ScheduleActionsPanelCourseEventsList } from "./course-events-list";
import { ScheduleActionsPanelCustomEventsList } from "./custom-events-list";
import { EditEventDialog } from "./edit-event-dialog";

export function ScheduleActionsPanelEventsTab() {
  const [isCreating, setIsCreating] = useState(false);
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }
  const courses = useScheduleCalendarCourseEvents(schedule.id);
  const customs = useScheduleCalendarCustomEvents(schedule.id);

  if (courses.status === "pending") return <></>;
  if (courses.status === "error") return <></>;

  if (customs.status === "pending") return <></>;
  if (customs.status === "error") return <></>;

  return (
    <div className="h-full w-full space-y-2">
      <h2 className="text-xl font-semibold">Courses</h2>
      <Separator />
      <ScheduleActionsPanelCourseEventsList
        events={courses.data}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Custom</h2>
        <Button size="icon" variant="ghost" onClick={() => setIsCreating(true)}>
          <PlusIcon className="w-5 h-5" />
        </Button>
      </div>
      <Separator />
      <ScheduleActionsPanelCustomEventsList
        events={customs.data}
      />
      {isCreating && (
        <EditEventDialog isOpen={isCreating} onClose={() => setIsCreating(false)} event={NEW_EVENT(new Date(), addHours(new Date(), 1), schedule.id)} />
      )}
    </div>
  );
}
