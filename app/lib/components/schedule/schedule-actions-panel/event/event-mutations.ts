import { createServerFn } from "@tanstack/start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import superjson from "superjson";

import { database } from "@/lib/database";
import { NewScheduleEvent, ScheduleEvent } from "@/lib/database/types";
import { isCourseScheduleEvent } from "@/lib/types/event";
import { useToast } from "@/lib/hooks/use-toast";

const add = createServerFn(
  "POST",
  async ({ event }: { event: NewScheduleEvent }) => {
    if ("sectionCode" in event) {
      const exists = await database
        .selectFrom("courseScheduleEvents")
        .where("scheduleId", "=", event.scheduleId)
        .where("sectionCode", "=", event.sectionCode)
        .executeTakeFirst();
      if (exists) {
        throw new Error("Course already in schedule.");
      }
      return superjson.stringify(
        await database
          .insertInto("courseScheduleEvents")
          .values({
            scheduleId: event.scheduleId,
            sectionCode: event.sectionCode,
            term: event.term,
            color: event.color,
            declined: []
          })
          .returningAll()
          .executeTakeFirstOrThrow(),
      );
    }
    return "";
  },
);

const remove = createServerFn(
  "POST",
  async ({ event }: { event: ScheduleEvent }) => {
    if (isCourseScheduleEvent(event)) {
      await database
        .deleteFrom("courseScheduleEvents")
        .where("id", "=", event.id)
        .executeTakeFirstOrThrow();
      return;
    }
    await database
      .deleteFrom("customScheduleEvents")
      .where("id", "=", event.id)
      .executeTakeFirstOrThrow();
  },
);

export const useEventMutations = ({ scheduleId }: { scheduleId: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutations = {
    add: useMutation({
      mutationFn: async (event: NewScheduleEvent) => {
        return superjson.parse<ScheduleEvent>(await add({ event }));
      },
      onSuccess: async (event: ScheduleEvent) => {
        const key = isCourseScheduleEvent(event) ? "course" : "custom";
        await queryClient.invalidateQueries({
          queryKey: [`schedule-${key}-events`, scheduleId],
        });
        if (isCourseScheduleEvent(event)) {
          toast({
            description: `The section with code "${event.sectionCode}" has successfully been added to your schedule.`,
          });
          return;
        }
        toast({
          description: `The custom event has successfully been added to your schedule.`,
        });
      },
      onError: () => {
        toast({
          title: "Uh oh! Something went wrong.",
          description:
            "Something went wrong while trying to add this event to your schedule. Please try again.",
          variant: "destructive",
        });
      },
    }),
    remove: useMutation({
      mutationFn: async (event: ScheduleEvent) => {
        await remove({ event });
        return event;
      },
      onSuccess: async (event: ScheduleEvent) => {
        const key = isCourseScheduleEvent(event) ? "course" : "custom";
        await queryClient.invalidateQueries({
          queryKey: [`schedule-${key}-events`, event.scheduleId],
        });
        if (isCourseScheduleEvent(event)) {
          toast({
            description: `The section with code "${event.sectionCode}" has successfully been removed from your schedule.`,
          });
          return;
        }
        toast({
          description: `The custom event has successfully been removed from your schedule.`,
        });
      },
      onError: () => {
        toast({
          title: "Uh oh! Something went wrong.",
          description:
            "Something went wrong while trying to remove this event from your schedule. Please try again.",
          variant: "destructive",
        });
      },
    }),
  };

  return {
    add: mutations.add,
    remove: mutations.remove,
  };
};
