import { useSearchAliases } from "@/lib/hooks/use-search-aliases";
import { SideViewSearchTermsFilter } from "./terms-filter";
import { SideViewSearchFilter } from "./search-filter";
import { OramaCombinedDocument } from "@/lib/uci/courses/types";
import { useSideViewContext } from "@/lib/components/schedule/side-view/context";

export type SideViewSearchValues = {
  term: string;
  department: string;
  course?: string;
};

type SideViewSearchFiltersProps = {
  onSearch: (search: SideViewSearchValues) => void;
};

export function SideViewSearchFilters({
  onSearch,
}: SideViewSearchFiltersProps) {
  const { data: aliases, status } = useSearchAliases();
  const term = useSideViewContext((state) => state.term);

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
      <SideViewSearchTermsFilter />
      <SideViewSearchFilter aliases={aliases} onSelect={onSelect} />
    </div>
  );
}
