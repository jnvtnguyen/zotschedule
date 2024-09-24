import { useState } from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { Course } from "@/lib/database/types";
import { QUARTERS_TO_LABELS } from "@/lib/uci/offerings/types";
import { Button } from "@/lib/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/lib/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/ui/popover";
import { cn, parseLetteredTerm } from "@/lib/utils";
import { ScrollArea } from "@/lib/components/ui/scroll-area";

type CourseOfferingsTermFilterProps = {
  course: Course;
  term: string;
  onTermChange: (term: string) => void;
};

function CourseTermValueLabel({
  term,
  course,
}: {
  term?: string;
  course: Course;
}) {
  if (term && course.terms.find((courseTerm) => courseTerm === term)) {
    const { year, quarter } = parseLetteredTerm(term);
    return `${QUARTERS_TO_LABELS[quarter]} ${year}`;
  }
  return "Select term...";
}

export function CourseOfferingsTermFilter({
  course,
  term,
  onTermChange,
}: CourseOfferingsTermFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[260px] justify-between"
        >
          <CourseTermValueLabel term={term} course={course} />
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search terms..." className="h-9" />
          <CommandList className="overflow-hidden">
            <ScrollArea type="scroll" className="max-h-72 flex-col flex">
              <CommandEmpty>No terms found.</CommandEmpty>
              <CommandGroup>
                {course.terms.map((courseTerm) => {
                  const { year, quarter } = parseLetteredTerm(courseTerm);
                  return (
                    <CommandItem
                      key={courseTerm}
                      value={courseTerm}
                      keywords={[QUARTERS_TO_LABELS[quarter], year]}
                      onSelect={(value) => {
                        onTermChange?.(value);
                        setIsOpen(false);
                      }}
                    >
                      {QUARTERS_TO_LABELS[quarter]} {year}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          term === courseTerm ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
