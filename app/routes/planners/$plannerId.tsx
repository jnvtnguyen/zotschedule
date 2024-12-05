import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/start';

import { database } from '@/lib/database';
import { PlannerBreadcrumbs } from '@/lib/components/planner/planner-breadcrumbs';
import { PlannerEditor } from '@/lib/components/planner';

const getPlannerById = createServerFn("GET", async ({
  plannerId,
  userId
}: {
  plannerId: string;
  userId: string;
}) => {
  const planner = await database
    .selectFrom("planners")
    .where("id", "=", plannerId)
    .where("userId", "=", userId)
    .selectAll()
    .executeTakeFirst();
  return planner;
});

export const Route = createFileRoute('/planners/$plannerId')({
  meta: () => [
    {
      title: 'Planner',
    },
  ],
  beforeLoad: async ({ params, context: { session } }) => {
    if (!session.isLoggedIn || !session.user) {
      throw redirect({ to: '/auth' });
    }
    const planner = await getPlannerById({
      plannerId: params.plannerId,
      userId: session.user.id,
    });
    if (!planner) {
      throw notFound();
    }
    return {
      planner,
    };
  },
  component: PlannerView,
});

function PlannerView() {
  const { planner }  = Route.useRouteContext();

  return (
    <div className="flex-col lg:p-16 p-4 flex space-y-4">
      <PlannerBreadcrumbs planner={planner} />
      <PlannerEditor planner={planner} />
    </div>
  );
}
