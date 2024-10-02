import { createFileRoute, redirect } from "@tanstack/react-router";
import { Views } from "react-big-calendar";
// @ts-ignore
import reactBigCalendarCss from "react-big-calendar/lib/css/react-big-calendar.css?url";

import {
  createScheduleCalendarStore,
  ScheduleCalendarContext,
} from "@/lib/hooks/use-schedule-calendar";
import { getSchedulesQuery, useSchedules } from "@/lib/hooks/use-schedules";
import { CreateScheduleDialog } from "@/lib/components/schedule/create-schedule-dialog";
import { createScheduleStore, ScheduleContext } from "@/lib/hooks/use-schedule";
import { getSearchAliasesQuery } from "@/lib/hooks/use-search-aliases";
import { getOfferingTermOptionsQuery } from "@/lib/hooks/use-offering-term-options";
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
import { ScheduleSideView } from "@/lib/components/schedule/side-view";
// @ts-ignore
import customReactBigCalendarCss from "@/lib/components/schedule/custom-react-big-calendar.css?url";

export const Route = createFileRoute("/schedule")({
  meta: () => [
    {
      title: "Schedule",
    },
  ],
  links: () => [
    { rel: "stylesheet", href: reactBigCalendarCss },
    { rel: "stylesheet", href: customReactBigCalendarCss },
  ],
  component: ScheduleDisplay,
  beforeLoad: async ({ context: { session, queryClient } }) => {
    if (!session.success || !session.user) {
      throw redirect({ to: "/auth/login" });
    }
    await queryClient.prefetchQuery(getSchedulesQuery(session.user.id));
    await queryClient.prefetchQuery(getOfferingTermOptionsQuery);
    await queryClient.prefetchQuery(getSearchAliasesQuery);
    return {
      session,
      queryClient,
    };
  },
});

function ScheduleDisplay() {
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
          <div className="flex-col lg:p-2 p-4 flex space-y-4 h-full w-full">
            <ResizablePanelGroup direction="horizontal" className="space-x-4">
              <ResizablePanel minSize={25}>
                <ScheduleCalendarContext.Provider
                  value={createScheduleCalendarStore(Views.WEEK)}
                >
                  <ScheduleCalendar schedules={schedules} />
                </ScheduleCalendarContext.Provider>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel minSize={25}>
                <ScheduleSideView />
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ScheduleContext.Provider>
      )}
    </AuthUserContext.Provider>
  );
}
