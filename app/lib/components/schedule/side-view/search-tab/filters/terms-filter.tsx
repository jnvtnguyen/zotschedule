import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/lib/components/ui/select";
import { useOfferingTermOptions } from "@/lib/hooks/use-offering-term-options";
import { useSideViewContext } from "@/lib/components/schedule/side-view/context";

export function SideViewSearchTermsFilter() {
  const { data: terms, status } = useOfferingTermOptions();
  const term = useSideViewContext((state) => state.term);
  const setTerm = useSideViewContext((state) => state.setTerm);

  if (status === "pending") {
    return <></>;
  }

  if (status === "error") {
    return <></>;
  }

  return (
    <Select value={term} onValueChange={setTerm}>
      <SelectTrigger className="w-full">
        {terms.find((t) => t.value === term)?.label ?? "Select a term..."}
      </SelectTrigger>
      <SelectContent>
        {terms.map((term) => (
          <SelectItem key={term.value} value={term.value}>
            {term.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
