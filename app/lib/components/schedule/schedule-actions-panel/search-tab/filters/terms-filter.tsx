import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/lib/components/ui/select";
import { useWebSocTermOptions } from "@/lib/hooks/use-websoc-term-options";
import { useScheduleActionsPanel } from "@/lib/components/schedule/schedule-actions-panel/context";

export function ScheduleActionsPanelSearchTermsFilter() {
  const { data: terms, status } = useWebSocTermOptions();
  const term = useScheduleActionsPanel((state) => state.term);
  const setTerm = useScheduleActionsPanel((state) => state.setTerm);

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
