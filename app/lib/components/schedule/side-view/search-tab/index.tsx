import { useState } from "react";

import { getOfferings } from "@/lib/uci/offerings";
import { Skeleton } from "@/lib/components/ui/skeleton";
import { SideViewSearchFilters, SideViewSearchValues } from "./filters";
import { SideViewOfferingsList } from "./offerings-list";
import { SideViewOfferingsHeader } from "./offerings-header";
import { useSideViewContext } from "@/lib/components/schedule/side-view/context";

export function SideViewSearchTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState<SideViewSearchValues>();
  const offerings = useSideViewContext((state) => state.offerings);
  const setOfferings = useSideViewContext((state) => state.setOfferings);

  const onSearch = async (search: SideViewSearchValues) => {
    setSearch(search);
    setIsLoading(true);
    setOfferings(
      await getOfferings({
        term: search.term,
        options: {
          department: search.department,
          courseNumber: search.course,
        },
      }),
    );
    setIsLoading(false);
  };

  const onBack = () => {
    setSearch(undefined);
    setOfferings(undefined);
  };

  const onReload = async () => {
    if (!search) return;
    setIsLoading(true);
    setOfferings(
      await getOfferings({
        term: search.term,
        options: {
          department: search.department,
          courseNumber: search.course,
        },
      }),
    );
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col gap-2">
      {!offerings && !isLoading && (
        <SideViewSearchFilters onSearch={onSearch} />
      )}
      {(isLoading || offerings) && (
        <SideViewOfferingsHeader onBack={onBack} onReload={onReload} />
      )}
      {isLoading && (
        <div className="flex flex-col w-full h-full space-y-1">
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
      {!isLoading && offerings && (
        <SideViewOfferingsList offerings={offerings} />
      )}
    </div>
  );
}
