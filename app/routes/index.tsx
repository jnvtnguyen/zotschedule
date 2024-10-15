import { createFileRoute, redirect } from '@tanstack/react-router'

import { getSchedulesQuery, useSchedules } from '@/lib/hooks/use-schedules'
import { getTermCalendarsQuery } from '@/lib/hooks/use-term-calendars'
import { CreateScheduleDialog } from '@/lib/components/schedule/create-schedule-dialog'
import { createScheduleStore, ScheduleContext } from '@/lib/hooks/use-schedule'
import { getSearchAliasesQuery } from '@/lib/hooks/use-search-aliases'
import { getWebSocTermOptionsQuery } from '@/lib/hooks/use-websoc-term-options'
import { AuthUserContext, createAuthUserStore } from '@/lib/hooks/use-auth-user'
import customFullCalendarCSS from '@/lib/components/schedule/custom-fullcalendar.css?url'
import { ScheduleView } from '@/lib/components/schedule'

export const Route = createFileRoute('/')({
  meta: () => [
    {
      title: 'Schedule',
    },
  ],
  links: () => [{ rel: 'stylesheet', href: customFullCalendarCSS }],
  component: Schedule,
  beforeLoad: async ({ context: { session, queryClient } }) => {
    if (!session.isLoggedIn || !session.user) {
      throw redirect({ to: '/auth/login' })
    }
    await queryClient.prefetchQuery(getSchedulesQuery(session.user.id))
    await queryClient.prefetchQuery(getWebSocTermOptionsQuery)
    await queryClient.prefetchQuery(getSearchAliasesQuery)
    await queryClient.prefetchQuery(getTermCalendarsQuery)

    return {
      session,
    }
  },
})

function Schedule() {
  const { session } = Route.useRouteContext()
  const { data: schedules, status } = useSchedules(session.user.id)

  if (status === 'pending') {
    return <></>
  }

  if (status === 'error') {
    return <></>
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
          <ScheduleView user={session.user} />
        </ScheduleContext.Provider>
      )}
    </AuthUserContext.Provider>
  )
}
