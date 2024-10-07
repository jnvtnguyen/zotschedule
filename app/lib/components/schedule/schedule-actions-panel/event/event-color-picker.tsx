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
  icon?: 'palette' | 'circle';
  isInDatabase?: boolean;
};

export function EventColorPicker({ event, icon = "palette", isInDatabase = true }: EventColorPickerProps) {
  const { toast } = useToast();
  const color = useMemo(() => event.color, [event.color]);
  const queryClient = useQueryClient();
  const schedule = useSchedule((state) => state.schedule);
  if (!schedule) {
    return;
  }

  const onColorChange = async (color: any) => {
    queryClient.setQueryData(
      ["schedule-events", schedule.id],
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
    <Popover>
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
          onBlur={onBlur}
          presetColors={PRESET_EVENT_COLORS}
        />
      </PopoverContent>
    </Popover>
  );
}
