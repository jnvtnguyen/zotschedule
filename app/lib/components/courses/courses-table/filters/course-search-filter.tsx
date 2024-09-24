import { Input } from "@/lib/components/ui/input";

type CourseSearchFilterProps = {
  value?: string;
  onChange: (value: string) => void;
};

export function CourseSearchFilter({
  value,
  onChange,
}: CourseSearchFilterProps) {
  return (
    <Input
      placeholder="Filter courses..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-[200px] lg:w-[250px]"
    />
  );
}
