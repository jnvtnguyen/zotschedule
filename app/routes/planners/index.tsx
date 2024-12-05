import { useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router'
import { PlusIcon } from '@radix-ui/react-icons';

import { getDegreesQuery } from '@/lib/hooks/use-degrees';
import { getPlannersQuery, usePlanners } from '@/lib/hooks/use-planners';
import { PlannersTable } from '@/lib/components/planner/planners-table';
import { Button } from '@/lib/components/ui/button';
import { CreatePlannerDialog } from '@/lib/components/planner/create-planner-dialog';
import { AuthUserContext } from '@/lib/hooks/use-auth-user';
import { createAuthUserStore } from '@/lib/hooks/use-auth-user';

export const Route = createFileRoute('/planners/')({
  meta: () => [
    {
      title: "Planners"
    }
  ],
  component: Planners,
  beforeLoad: async ({ context: { session, queryClient } }) => {
    if (!session.isLoggedIn || !session.user) {
      throw redirect({ to: '/auth' });
    }
    await queryClient.prefetchQuery(getPlannersQuery(session.user.id));
    await queryClient.prefetchQuery(getDegreesQuery);

    return {
      session
    };
  }
});

function Planners() {
  const { session } = Route.useRouteContext();
  const { data: planners, status } = usePlanners(session.user.id);
  const [isCreatePlannerDialogOpen, setIsCreatePlannerDialogOpen] = useState(false);

  if (status === 'pending') {
    return <></>;
  }

  if (status === 'error') {
    return <></>;
  }

  return (
    <AuthUserContext.Provider value={createAuthUserStore(session.user)}>
      <CreatePlannerDialog isOpen={isCreatePlannerDialogOpen} onClose={() => setIsCreatePlannerDialogOpen(false)} />
      <div className="flex-col lg:p-16 p-4 flex max-w-7xl space-y-4">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Planners</h1>
          <Button variant="ghost" size="icon" onClick={() => setIsCreatePlannerDialogOpen(true)}>
            <PlusIcon className="w-5 h-5" />
          </Button>
        </div>
        <PlannersTable planners={planners} />
      </div>
    </AuthUserContext.Provider>
  );
};