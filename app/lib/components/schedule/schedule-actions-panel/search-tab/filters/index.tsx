import { useSearchAliases } from "@/lib/hooks/use-search-aliases";
import { OramaCombinedDocument } from "@/lib/uci/courses/types";
import { useScheduleActionsPanel } from "@/lib/components/schedule/schedule-actions-panel/context";
import { ScheduleActionsPanelSearchTermsFilter } from "./terms-filter";
import { ScheduleActionsPanelSearchFilter } from "./search-filter";

export type ScheduleActionsPanelSearchValues = {
  term: string;
  department: string;
  course?: string;
};

type ScheduleActionsPanelSearchFiltersProps = {
  onSearch: (search: ScheduleActionsPanelSearchValues) => void;
};

export function ScheduleActionsPanelSearchFilters({
  onSearch,
}: ScheduleActionsPanelSearchFiltersProps) {
  const { data: aliases, status } = useSearchAliases();
  const term = useScheduleActionsPanel((state) => state.term);

  if (status === "pending") {
    return <></>;
  }

  if (status === "error") {
    return <></>;
  }

  const onSelect = (document: OramaCombinedDocument) => {
    const department =
      document.type === "department" ? document.code : document.department.code;
    const course = document.type === "course" ? document.number : undefined;
    onSearch({
      term,
      department,
      course,
    });
  };

  return (
    <div className="flex flex-col p-1 space-y-4">
      <ScheduleActionsPanelSearchTermsFilter />
      <ScheduleActionsPanelSearchFilter aliases={aliases} onSelect={onSelect} />
    </div>
  );
}
