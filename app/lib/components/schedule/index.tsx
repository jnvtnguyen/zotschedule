import { AuthUser } from "@/lib/auth";
import { ScheduleCalendar } from "@/lib/components/schedule/schedule-calendar";
import { ScheduleActionsPanel } from "@/lib/components/schedule/schedule-actions-panel";
import { ScheduleNavbar } from "@/lib/components/schedule/navbar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/lib/components/ui/resizable";
import {
  createScheduleCalendarStore,
  ScheduleCalendarContext,
} from "@/lib/components/schedule/context";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { useState } from "react";

type ScheduleViewProps = {
  user: AuthUser;
};

const today = new Date();

export function ScheduleView({ user }: ScheduleViewProps) {
  const schedule = useSchedule((state) => state.schedule);
  const [width, setWidth] = useState(0);

  if (!schedule) {
    return <></>;
  }

  return (
    <ScheduleCalendarContext.Provider
      value={createScheduleCalendarStore(
        schedule.view,
        today,
        schedule.showWeekends,
      )}
    >
      <ScheduleNavbar user={user} />
      <div className="space-y-4 h-[calc(100vh-4rem)] w-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            minSize={25}
            defaultSize={65}
            onResize={(w) => setWidth(w)}
            className="h-full"
          >
            <ScheduleCalendar width={width} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel minSize={25} defaultSize={35} className="h-full">
            <ScheduleActionsPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </ScheduleCalendarContext.Provider>
  );
}
