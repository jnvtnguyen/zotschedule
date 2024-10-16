import { Button } from "@/lib/components/ui/button";
import { ArrowLeftIcon, ReloadIcon } from "@radix-ui/react-icons";

type ScheduleActionsPanelOfferingsHeaderProps = {
  onBack: () => void;
  onReload: () => void;
};

export function ScheduleActionsPanelOfferingsHeader({
  onBack,
  onReload,
}: ScheduleActionsPanelOfferingsHeaderProps) {
  return (
    <div className="flex gap-2 sticky top-0 z-50 py-2">
      <Button onClick={onBack}>
        <ArrowLeftIcon className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Button variant="outline" onClick={onReload}>
        <ReloadIcon className="w-4 h-4 mr-2" />
        Reload
      </Button>
    </div>
  );
}
