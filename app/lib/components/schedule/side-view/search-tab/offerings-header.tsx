import { Button } from "@/lib/components/ui/button";
import { ArrowLeftIcon, ReloadIcon } from "@radix-ui/react-icons";

type SideViewOfferingsHeaderProps = {
  onBack: () => void;
  onReload: () => void;
};

export function SideViewOfferingsHeader({
  onBack,
  onReload,
}: SideViewOfferingsHeaderProps) {
  return (
    <div className="flex gap-2">
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
