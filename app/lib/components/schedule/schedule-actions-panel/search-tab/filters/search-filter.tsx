import { useMemo, useState } from "react";
import { OramaClient } from "@oramacloud/client";
import { useDebounce } from "use-debounce";
import { Command as CommandPrimitive } from "cmdk";

import { SearchAlias } from "@/lib/database/types";
import { Input } from "@/lib/components/ui/input";
import { OramaCombinedDocument } from "@/lib/uci/courses/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/lib/components/ui/command";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/lib/components/ui/popover";
import { Skeleton } from "@/lib/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

const orama = new OramaClient({
  endpoint: process.env.COMBINED_ORAMA_ENDPOINT!,
  api_key: process.env.COMBINED_ORAMA_API_KEY!,
});

type ScheduleActionsPanelSearchFilterProps = {
  aliases: SearchAlias[];
  onSelect: (document: OramaCombinedDocument) => void;
};

export function ScheduleActionsPanelSearchFilter({
  aliases,
  onSelect,
}: ScheduleActionsPanelSearchFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [term, setTerm] = useDebounce(search, 100, {
    trailing: true,
  });
  const aliased = useMemo(() => {
    let aliased = term;
    for (const alias of aliases) {
      aliased = aliased.replace(
        new RegExp("\\b" + alias.alias + "\\b", "gi"),
        alias.value,
      );
    }
    return aliased;
  }, [term, aliases]);
  const { data: results, status } = useQuery({
    queryKey: ["schedule-actions-panel-search", aliased],
    queryFn: async () =>
      await orama.search({
        term: aliased,
        limit: 10,
      }),
    enabled: !!aliased,
  });
  const isLoading = (status === "pending" || search !== term) && search;

  const reset = () => {
    setSearch("");
    setTerm("");
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <Command shouldFilter={false}>
        <PopoverAnchor asChild>
          <CommandPrimitive.Input
            asChild
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              setIsOpen(!!value);
            }}
            onKeyDown={(e) => {
              if (/^.$/u.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
                setIsOpen(true);
              }
              if (e.key === "Escape") {
                setIsOpen(false);
              }
            }}
            onMouseDown={() => setIsOpen(!!search)}
            onFocus={() => setIsOpen(!!search)}
          >
            <Input placeholder="Search..." />
          </CommandPrimitive.Input>
        </PopoverAnchor>
        {!isOpen && !isLoading && (
          <CommandList aria-hidden="true" className="hidden" />
        )}
        <PopoverContent
          asChild
          className="w-[--radix-popover-trigger-width] p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if (
              e.target instanceof Element &&
              e.target.hasAttribute("cmdk-input")
            ) {
              e.preventDefault();
            }
          }}
        >
          <CommandList>
            {isLoading && (
              <CommandPrimitive.Loading>
                <div className="p-1 space-y-1">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CommandPrimitive.Loading>
            )}
            {!isLoading && results && results.hits.length > 0 && (
              <CommandGroup>
                {results.hits.map((hit) => (
                  <CommandItem
                    key={hit.id}
                    onSelect={() => {
                      reset();
                      onSelect(hit.document);
                    }}
                  >
                    {hit.document.type === "course" && (
                      <span>
                        {hit.document.department.code} {hit.document.number}:{" "}
                        {hit.document.title}
                      </span>
                    )}
                    {hit.document.type === "department" && (
                      <span>
                        {hit.document.code}: {hit.document.title}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {!isLoading && <CommandEmpty>No results found!</CommandEmpty>}
          </CommandList>
        </PopoverContent>
      </Command>
    </Popover>
  );
}
