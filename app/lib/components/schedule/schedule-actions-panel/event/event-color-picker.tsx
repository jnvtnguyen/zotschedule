import { useMemo } from "react";
import Sketch from "@uiw/react-color-sketch";
import { useQueryClient } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/start";
import { Palette } from "@phosphor-icons/react";

import { database } from "@/lib/database";
import { Button } from "@/lib/components/ui/button";
import { ScheduleEvent } from "@/lib/database/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/ui/popover";
import { useSchedule } from "@/lib/hooks/use-schedule";
import { useToast } from "@/lib/hooks/use-toast";
import {
  isCourseScheduleEvent,
  PRESET_EVENT_COLORS,
} from "@/lib/uci/events/types";

const updateEventColor = createServerFn(
  "POST",
  async ({ event, color }: { event: ScheduleEvent; color: string }) => {
    if (isCourseScheduleEvent(event)) {
      await database
        .updateTable("courseScheduleEvents")
        .set({ color })
        .where("id", "=", event.id)
        .executeTakeFirstOrThrow();
    } else {
      await database
        .updateTable("customScheduleEvents")
        .set({ color })
        .where("id", "=", event.id)
        .executeTakeFirstOrThrow();
    }
  },
);

type EventColorPickerProps = {
  event: ScheduleEvent;
  onChange?: (color: string) => void;
  icon?: "palette" | "circle";
  isInDatabase?: boolean;
  isLocal?: boolean;
};

export function EventColorPicker({
  event,
  onChange,
  icon = "palette",
  isInDatabase = true,
  isLocal = true,
}: EventColorPickerProps) {
  const { toast } = useToast();
  const color = useMemo(() => event.color, [event.color]);
  const queryClient = useQueryClient();
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }

  const onColorChange = async (color: any) => {
    onChange?.(color.hex);

    if (!isLocal) {
      return;
    }

    const key = isCourseScheduleEvent(event) ? "course" : "custom";
    queryClient.setQueryData(
      [`schedule-${key}-events`, schedule.id],
      (events: ScheduleEvent[]) => {
        return events.map((_event) => {
          if (_event.id === event.id) {
            return {
              ..._event,
              color: color.hex,
            };
          }
          return _event;
        });
      },
    );
  };

  const onBlur = async () => {
    if (!isInDatabase) {
      return;
    }
    try {
      await updateEventColor({ event, color });
      toast({
        description: "The event color has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description:
          "Something went wrong while updating the event color. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) {
          onBlur();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          {icon === "circle" ? (
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: color }}
            />
          ) : (
            <Palette className="w-5 h-5" weight="fill" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-min border-none bg-transparent">
        <Sketch
          color={event.color}
          onChange={onColorChange}
          presetColors={PRESET_EVENT_COLORS}
        />
      </PopoverContent>
    </Popover>
  );
}
