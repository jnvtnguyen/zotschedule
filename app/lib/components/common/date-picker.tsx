import { CalendarIcon } from "@radix-ui/react-icons";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/lib/components/ui/popover";
import { Calendar } from "@/lib/components/ui/calendar";
import { Button } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils/style";
import { SelectSingleEventHandler } from "react-day-picker";

type DatePickerProps = {
  defaultMonth?: Date;
  selected?: Date;
  disabled?: boolean;
  format: (date: Date) => string;
  onSelect: SelectSingleEventHandler;
};

export function DatePicker({
  defaultMonth,
  selected,
  onSelect,
  format,
  disabled,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant={"outline"}
          className={cn("pl-3 text-left font-normal gap-2 items-center flex")}
        >
          {selected ? format(selected) : <span>Pick a date</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          defaultMonth={defaultMonth}
          selected={selected}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
