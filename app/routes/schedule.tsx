import { createFileRoute, redirect } from "@tanstack/react-router";
import { Views } from "react-big-calendar";
import reactBigCalendarCSS from "react-big-calendar/lib/css/react-big-calendar.css?url";
import reactBigCalendarDragAndDropCSS from "react-big-calendar/lib/addons/dragAndDrop/styles.css?url";

import {
  createScheduleCalendarStore,
  ScheduleCalendarContext,
} from "@/lib/hooks/use-schedule-calendar";
import { getSchedulesQuery, useSchedules } from "@/lib/hooks/use-schedules";
import { getTermCalendarsQuery } from "@/lib/hooks/use-term-calendars";
import { CreateScheduleDialog } from "@/lib/components/schedule/create-schedule-dialog";
import { createScheduleStore, ScheduleContext } from "@/lib/hooks/use-schedule";
import { getSearchAliasesQuery } from "@/lib/hooks/use-search-aliases";
import { getWebSocTermOptionsQuery } from "@/lib/hooks/use-websoc-term-options";
import { ScheduleCalendar } from "@/lib/components/schedule/schedule-calendar";
import {
  AuthUserContext,
  createAuthUserStore,
} from "@/lib/hooks/use-auth-user";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/lib/components/ui/resizable";
import { ScheduleActionsPanel } from "@/lib/components/schedule/schedule-actions-panel";
import { getScheduleCalendarEventsQuery } from "@/lib/hooks/use-schedule-calendar-events";
import customReactBigCalendarCSS from "@/lib/components/schedule/custom-react-big-calendar.css?url";

export const Route = createFileRoute("/schedule")({
  meta: () => [
    {
      title: "Schedule",
    },
  ],
  links: () => [
    { rel: "stylesheet", href: reactBigCalendarCSS },
    { rel: "stylesheet", href: customReactBigCalendarCSS },
    { rel: "stylesheet", href: reactBigCalendarDragAndDropCSS },
  ],
  component: Schedule,
  beforeLoad: async ({ context: { session, queryClient } }) => {
    if (!session.isLoggedIn || !session.user) {
      throw redirect({ to: "/auth/login" });
    }
    await queryClient.prefetchQuery(getSchedulesQuery(session.user.id));
    await queryClient.prefetchQuery(getWebSocTermOptionsQuery);
    await queryClient.prefetchQuery(getSearchAliasesQuery);
    await queryClient.prefetchQuery(getTermCalendarsQuery);

    const schedules = await queryClient.ensureQueryData(
      getSchedulesQuery(session.user.id),
    );
    const schedule = schedules.find((schedule) => schedule.isDefault);
    if (schedule) {
      await queryClient.prefetchQuery(
        getScheduleCalendarEventsQuery(schedule.id),
      );
    }

    return {
      session,
    };
  },
});

function Schedule() {
  const { session } = Route.useRouteContext();
  const { data: schedules, status } = useSchedules(session.user.id);

  if (status === "pending") {
    return <></>;
  }

  if (status === "error") {
    return <></>;
  }

  return (
    <AuthUserContext.Provider value={createAuthUserStore(session.user)}>
      {schedules.length === 0 ? (
        <CreateScheduleDialog isOpen={true} isCloseable={false} />
      ) : (
        <ScheduleContext.Provider
          value={createScheduleStore(
            schedules.find((schedule) => schedule.isDefault),
          )}
        >
          <div className="lg:p-2 p-4 space-y-4 h-full w-full">
            <ResizablePanelGroup direction="horizontal" className="space-x-4">
              <ResizablePanel
                minSize={25}
                defaultSize={65}
                className="h-[calc(100vh-4.8rem)]"
              >
                <ScheduleCalendarContext.Provider
                  value={createScheduleCalendarStore(Views.WEEK, new Date())}
                >
                  <ScheduleCalendar />
                </ScheduleCalendarContext.Provider>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel
                minSize={25}
                defaultSize={35}
                className="h-[calc(100vh-4.8rem)] pb-2"
              >
                <ScheduleActionsPanel />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ScheduleContext.Provider>
      )}
    </AuthUserContext.Provider>
  );
}
