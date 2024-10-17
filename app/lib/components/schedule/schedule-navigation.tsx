import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

import { Button } from "@/lib/components/ui/button";
import { useScheduleCalendar } from "@/lib/components/schedule/context";

export function ScheduleNavigation() {
  const date = useScheduleCalendar((state) => state.date);
  const setDate = useScheduleCalendar((state) => state.setDate);
  const view = useScheduleCalendar((state) => state.view);

  const onNavigateNext = () => {
    if (view === "timeGridDay") {
      setDate(addDays(date, 1));
    }

    if (view === "timeGridWeek") {
      setDate(addWeeks(date, 1));
    }

    if (view === "dayGridMonth") {
      setDate(addMonths(date, 1));
    }
  };

  const onNavigateBack = () => {
    if (view === "timeGridDay") {
      setDate(subDays(date, 1));
    }

    if (view === "timeGridWeek") {
      setDate(subWeeks(date, 1));
    }

    if (view === "dayGridMonth") {
      setDate(subMonths(date, 1));
    }
  };

  return (
    <div className="flex flex-row items-center gap-3">
      <div>
        <Button variant="ghost" size="icon" onClick={() => onNavigateBack()}>
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onNavigateNext()}>
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-lg">
        {(view === "dayGridMonth" || view === "timeGridWeek") && (
          <>{format(date, "MMMM yyyy")}</>
        )}
        {view === "timeGridDay" && <>{format(date, "EEEE, MMMM d")}</>}
      </p>
    </div>
  );
}
