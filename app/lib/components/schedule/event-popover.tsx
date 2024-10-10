import { useEffect } from "react";
import { X } from "@phosphor-icons/react";
import {
  autoPlacement,
  autoUpdate,
  offset,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from "@floating-ui/react";

import { Button } from "@/lib/components/ui/button";
import { useSchedule } from "@/lib/hooks/use-schedule";

export type EventPopoverProps = {
  anchor: HTMLAnchorElement;
  title: string;
  onClose: () => void;
  isDragging: boolean;
  children: React.ReactNode;
};

export function EventPopover({
  anchor,
  title,
  onClose,
  isDragging,
  children,
}: EventPopoverProps) {
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }
  const { refs, floatingStyles, context } = useFloating({
    strategy: "fixed",
    elements: {
      reference: anchor,
    },
    middleware: [
      offset(5),
      autoPlacement({
        crossAxis: true,
        boundary: document.querySelector(
          ".fc-scrollgrid-section-body",
        ) as HTMLElement,
      }),
    ],
    whileElementsMounted: autoUpdate,
    open: true,
  });

  const dismiss = useDismiss(context, {
    outsidePress: (e: MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest(".fc-event") &&
        document.querySelector(".fc-event.new-event")
      ) {
        return false;
      }
      e.preventDefault();
      onClose();
      return true;
    },
  });
  const { getFloatingProps } = useInteractions([dismiss]);
  const { isMounted, styles } = useTransitionStyles(context);

  useEffect(() => {
    refs.setPositionReference(anchor);
  }, [anchor]);

  if (isDragging || !isMounted) {
    return;
  }

  return (
    <div
      ref={refs.setFloating}
      style={{
        ...styles,
        ...floatingStyles,
      }}
      {...getFloatingProps()}
      className="z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none w-80"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-row justify-between items-center">
          <h3 className="text-md">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="w-5 h-5"
            onClick={() => onClose()}
          >
            <X />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
