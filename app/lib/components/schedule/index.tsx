import { useState } from "react";

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
import { User } from "@/lib/database/types";

type ScheduleViewProps = {
  user: User;
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
      <div className="h-full w-full">
        <div className="hidden md:block w-full h-full">
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
            <ResizablePanel minSize={25} defaultSize={35} className="h-[calc(100vh-4rem)]">
              <ScheduleActionsPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        <div className="md:hidden w-full h-full">
        </div>
      </div>
    </ScheduleCalendarContext.Provider>
  );
}
