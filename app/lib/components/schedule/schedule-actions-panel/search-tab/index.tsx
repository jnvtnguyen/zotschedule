import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { callWebSocAPI } from "@/lib/uci/offerings";
import { Skeleton } from "@/lib/components/ui/skeleton";
import { ScheduleActionsPanelSearchFilters } from "./filters";
import { ScheduleActionsPanelOfferingsList } from "./offerings-list";
import { ScheduleActionsPanelOfferingsHeader } from "./offerings-header";
import { useScheduleActionsPanel } from "../context";

export function ScheduleActionsPanelSearchTab() {
  const queryClient = useQueryClient();
  const search = useScheduleActionsPanel((state) => state.search);
  const setSearch = useScheduleActionsPanel((state) => state.setSearch);
  const offerings = useQuery({
    queryKey: ["schedule-actions-panel-offerings"],
    queryFn: async () =>
      await callWebSocAPI({
        term: search!.term,
        options: {
          department: search!.department,
          courseNumber: search!.course,
        },
      }),
    enabled: !!search,
  });

  const onBack = () => {
    setSearch(undefined);
  };

  const onReload = async () => {
    await offerings.refetch();
  };

  useEffect(() => {
    if (!search) {
      queryClient.resetQueries({
        queryKey: ["schedule-actions-panel-offerings"],
      });
    }
  }, [search]);

  return (
    <>
      {!offerings.data && !offerings.isFetching && (
        <ScheduleActionsPanelSearchFilters onSearch={setSearch} />
      )}
      {(offerings.isLoading || offerings.isFetched) && (
        <ScheduleActionsPanelOfferingsHeader
          onBack={onBack}
          onReload={onReload}
        />
      )}
      {(offerings.isLoading || offerings.isFetching) && (
        <div className="flex flex-col w-full space-y-1">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      {!offerings.isLoading && !offerings.isFetching && offerings.data && (
        <ScheduleActionsPanelOfferingsList offerings={offerings.data} />
      )}
    </>
  );
}
