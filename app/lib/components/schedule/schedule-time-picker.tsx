import { View, Views } from "react-big-calendar";

import { useScheduleCalendarContext } from "@/lib/hooks/use-schedule-calendar";
import { Tabs, TabsList, TabsTrigger } from "@/lib/components/ui/tabs";

export function ScheduleTimePicker() {
  const view = useScheduleCalendarContext((state) => state.view);
  const setView = useScheduleCalendarContext((state) => state.setView);

  return (
    <Tabs value={view} onValueChange={(value) => setView(value as View)}>
      <TabsList>
        <TabsTrigger value={Views.DAY}>Day</TabsTrigger>
        <TabsTrigger value={Views.WEEK}>Week</TabsTrigger>
        <TabsTrigger value={Views.MONTH}>Month</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
