import { CaretSortIcon } from "@radix-ui/react-icons";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/lib/components/ui/collapsible";

type SideViewOfferingCollapsibleProps = {
  title: string;
  comments: string;
};

export function SideViewOfferingCollapsible({
  title,
  comments,
}: SideViewOfferingCollapsibleProps) {
  return (
    <Collapsible className="flex flex-col p-3 bg-secondary rounded-lg border space-y-2">
      {comments ? (
        <>
          <CollapsibleTrigger className="text-lg font-normal w-full flex items-center justify-between">
            {title}
            <CaretSortIcon className="w-5 h-5" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className="text-md font-normal">Comments:</p>
            <div
              className="text-[0.8rem] [&>p]:my-2 [&_a]:text-blue-500 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: comments }}
            />
          </CollapsibleContent>
        </>
      ) : (
        <div className="text-lg font-normal">{title}</div>
      )}
    </Collapsible>
  );
}
