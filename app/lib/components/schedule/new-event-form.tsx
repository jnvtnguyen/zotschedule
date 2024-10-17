import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { format, intervalToDuration, add } from "date-fns";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Time } from "@internationalized/date";
import { EventImpl } from "@fullcalendar/core/internal";
import { createServerFn } from "@tanstack/start";
import { useQueryClient } from "@tanstack/react-query";
import { UTCDate } from "@date-fns/utc";
import superjson from "superjson";
import { Frequency } from "rrule";
import { EventApi } from "@fullcalendar/core";

import { database } from "@/lib/database";
import { Schedule } from "@/lib/database/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/lib/components/ui/form";
import { TimePicker } from "@/lib/components/common/time-picker";
import { Input } from "@/lib/components/ui/input";
import { Button } from "@/lib/components/ui/button";
import { EventColorPicker } from "./schedule-actions-panel/event/event-color-picker";
import { useToast } from "@/lib/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import { DatePicker } from "@/lib/components/common/date-picker";
import { CustomScheduleCalendarEvent } from "@/lib/hooks/use-schedule-calendar-events";
import { FREQUENCY_TO_LABEL } from "@/lib/uci/events/types";
import { CustomScheduleEventRepeatability } from "@/lib/database/generated-types";
import { CustomRecurrenceDialog } from "./custom-recurrence-dialog";
import { CustomRecurrence } from "./custom-recurrence-form";
import {
  RRULE_DAYS_TO_LABEL,
} from "./use-calendar-events";

const newEventFormSchema = z.object({
  id: z.string(),
  color: z.string().min(1, { message: "A event color is required." }),
  title: z.string().optional(),
  start: z.date({ required_error: "A event start date is required." }),
  end: z.date({ required_error: "A event end date is required." }),
  times: z.object({
    start: z.object({
      hour: z.number(),
      minute: z.number(),
    }),
    end: z.object({
      hour: z.number(),
      minute: z.number(),
    })
  }),
  repeatability: z
    .nativeEnum(CustomScheduleEventRepeatability)
    .or(z.literal("new-custom")),
});

const save = createServerFn("POST", async (payload: string) => {
  const { data, schedule, custom } = superjson.parse<{
    data: z.infer<typeof newEventFormSchema>;
    schedule: Schedule;
    custom?: CustomRecurrence;
  }>(payload);

  if (data.id === "new") {
    await database
      .insertInto("customScheduleEvents")
      .values({
        scheduleId: schedule.id,
        color: data.color,
        title: data.title || "(No Title)",
        description: "",
        start: data.start,
        end: data.end,
        repeatability: data.repeatability as CustomScheduleEventRepeatability,
        frequency: custom?.frequency,
        interval: custom?.interval,
        days:
          custom?.frequency === Frequency.WEEKLY ? custom.days : [],
        until: custom?.ends,
        months: [],
        weeks: [],
      })
      .executeTakeFirstOrThrow();
  } else {
    await database
    .updateTable("customScheduleEvents")
    .where("id", "=", data.id)
    .set({
        color: data.color,
        title: data.title || "(No Title)",
        description: "",
        start: data.start,
        end: data.end,
        repeatability: data.repeatability as CustomScheduleEventRepeatability,
        frequency: custom?.frequency,
        interval: custom?.interval,
        days:
          custom?.frequency === Frequency.WEEKLY ? custom.days : [],
        until: custom?.ends,
        months: [],
        weeks: [],
      })
      .executeTakeFirstOrThrow();
  }
});

type NewEventFormProps = {
  event: EventImpl | EventApi;
  schedule: Schedule;
  onEventChange: (event: Partial<CustomScheduleCalendarEvent>) => void;
  onClose: () => void;
};

type RepeatabilityOption = {
  label: string;
  value: CustomScheduleEventRepeatability | "new-custom";
};

const isEmptyTitle = (title: string) => title.length === 0 || title === "(No Title)";

export function NewEventForm({
  event,
  schedule,
  onEventChange,
  onClose,
}: NewEventFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCustomRecurrenceOpen, setIsCustomRecurrenceOpen] = useState(false);
  const [custom, setCustom] = useState<
    CustomRecurrence | undefined
  >(
    event.extendedProps.event.repeatability ===
      CustomScheduleEventRepeatability.CUSTOM
      ? {
          frequency: event.extendedProps.event.frequency,
          interval: event.extendedProps.event.interval,
          days: event.extendedProps.event.days,
          ends: event.extendedProps.event.ends,
        }
      : undefined,
  );
  const [savedRepeatability, setSavedRepeatability] =
    useState<CustomScheduleEventRepeatability>(
      CustomScheduleEventRepeatability.NONE,
    );

  const form = useForm<z.infer<typeof newEventFormSchema>>({
    resolver: zodResolver(newEventFormSchema),
    defaultValues: {
      id: event.extendedProps.event.id,
      color: event.extendedProps.event.color,
      title: isEmptyTitle(event.extendedProps.event.title) ? "" : event.extendedProps.event.title,
      start: event.extendedProps.event.start,
      end: event.extendedProps.event.end,
      repeatability: event.extendedProps.event.repeatability,
      times: {
        start: {
          hour: event.extendedProps.event.start.getHours(),
          minute: event.extendedProps.event.start.getMinutes(),
        },
        end: {
          hour: event.extendedProps.event.end?.getHours(),
          minute: event.extendedProps.event.end?.getMinutes(),
        }
      },
    },
  });

  const repeatability = form.watch("repeatability");
  const start = form.watch("start");
  const end = form.watch("end");
  const repeatabilities = useMemo<RepeatabilityOption[]>(() => {
    const options: RepeatabilityOption[] = [
      {
        label: "Does not repeat",
        value: CustomScheduleEventRepeatability.NONE,
      },
      {
        label: "Daily",
        value: CustomScheduleEventRepeatability.DAILY,
      },
      {
        label: `Weekly on ${format(event.start!, "EEEE")}`,
        value: CustomScheduleEventRepeatability.WEEKLY,
      },
      {
        label: "Every weekday (Monday to Friday)",
        value: CustomScheduleEventRepeatability.WEEKDAY,
      },
    ];

    if (custom) {
      let label = FREQUENCY_TO_LABEL[custom.frequency];
      if (custom.frequency === Frequency.WEEKLY) {
        label = `${label} on ${custom.days
          .sort(
            (a, b) =>
              a - b
          )
          .map((day) => RRULE_DAYS_TO_LABEL[day])
          .join(", ")}`;
      }

      if (custom.ends) {
        label = `${label}, until ${format(custom.ends, "MMMM d, yyyy")}`;
      }

      options.push({
        label: label,
        value: CustomScheduleEventRepeatability.CUSTOM,
      });
    }

    options.push({
      label: "Custom",
      value: "new-custom",
    });

    return options;
  }, [event.start, custom]);

  useEffect(() => {
    if (custom) {
      form.setValue("repeatability", CustomScheduleEventRepeatability.CUSTOM);
    }
  }, [custom]);

  useEffect(() => {
    if (
      repeatability !== CustomScheduleEventRepeatability.CUSTOM &&
      repeatability !== "new-custom" &&
      custom
    ) {
      setCustom(undefined);
    }
    if (repeatability === "new-custom") {
      return;
    }
    setSavedRepeatability(repeatability);
    onEventChange({
      repeatability,
    });
    if (
      repeatability === CustomScheduleEventRepeatability.CUSTOM &&
      custom
    ) {
      onEventChange({
        ...custom,
        months: [],
        weeks: [],
      });
    }
  }, [repeatability]);

  useEffect(() => {
    form.setValue("start", event.extendedProps.event.start);
    form.setValue("times.start", {
      hour: event.extendedProps.event.start.getHours(),
      minute: event.extendedProps.event.start.getMinutes(),
    });
  }, [event.extendedProps.event.start]);

  useEffect(() => {
    form.setValue("end", event.extendedProps.event.end);
    form.setValue("times.end", {
      hour: event.extendedProps.event.end.getHours(),
      minute: event.extendedProps.event.end.getMinutes(),
    });
  }, [event.extendedProps.event.end]);

  const onSubmit = async (data: z.infer<typeof newEventFormSchema>) => {
    try {
      await save(
        superjson.stringify({
          data: {
            ...data,
            start: new UTCDate(data.start),
            end: new UTCDate(data.end),
          },
          schedule,
          custom: {
            ...custom,
            ends: custom?.ends
              ? new UTCDate(custom.ends)
              : undefined,
          },
        }),
      );
      await queryClient.invalidateQueries({
        queryKey: ["schedule-custom-events", schedule.id],
      });
      toast({
        description: "The event has been successfully saved.",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Uh oh! Something went wrong.",
        description:
          "Something went wrong while saving the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          autoComplete="off"
          className="grid gap-4"
        >
          <div className="flex flex-row items-start gap-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field: { onChange, ...field } }) => (
                <FormItem className="grow">
                  <FormControl>
                    <Input
                      onChange={(e) => {
                        onChange(e.target.value);
                        onEventChange({
                          title: e.target.value,
                        });
                      }}
                      {...field}
                      placeholder="Enter the event title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={() => (
                <FormItem>
                  <FormControl>
                    <EventColorPicker
                      event={event.extendedProps.event}
                      isInDatabase={false}
                      icon="circle"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormControl>
                  <DatePicker
                    defaultMonth={field.value}
                    selected={field.value}
                    format={(date) => format(date, "PPPP")}
                    onSelect={(date) => {
                      if (!date) {
                        onClose();
                        return;
                      }
                      const start = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        event.start!.getHours(),
                        event.start!.getMinutes(),
                      );
                      const end = event.end ? new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        event.end.getHours(),
                        event.end.getMinutes(),
                      ) : start;
                      field.onChange(start);
                      onEventChange({
                        start,
                        end,
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row gap-1 items-center w-full">
            <FormField
              control={form.control}
              name="times.start"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormControl>
                    <TimePicker
                      value={new Time(field.value.hour, field.value.minute)}
                      onChange={(time) => {
                        field.onChange({
                          hour: time?.hour,
                          minute: time?.minute,
                        });
                      }}
                      onBlur={() => {
                        if (!field.value) {
                          form.setValue("times.start", {
                            hour: event.start!.getHours(),
                            minute: event.start!.getMinutes(),
                          });
                          return;
                        }
                        const end = event.end ? new Date(
                          event.start!.getFullYear(),
                          event.start!.getMonth(),
                          event.start!.getDate(),
                          event.end.getHours(),
                          event.end.getMinutes(),
                        ) : event.start!;
                        
                        let added = add(
                          new Date(
                            event.start!.getFullYear(),
                            event.start!.getMonth(),
                            event.start!.getDate(),
                            field.value.hour,
                            field.value.minute,
                          ),
                          intervalToDuration({
                            start: event.start!,
                            end: end
                          }),
                        );
                        onEventChange({
                          start: new Date(
                            event.start!.getFullYear(),
                            event.start!.getMonth(),
                            event.start!.getDate(),
                            field.value.hour,
                            field.value.minute,
                          ),
                          end: added
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ArrowRightIcon className="h-8 w-8" />
            <FormField
              control={form.control}
              name="times.end"
              render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                  <FormControl>
                    <TimePicker
                      value={new Time(field.value.hour, field.value.minute)}
                      onChange={(time) => {
                        field.onChange({
                          hour: time.hour,
                          minute: time.minute,
                        });
                      }}
                      onBlur={() => {
                        const end = new Date(
                          event.start!.getFullYear(),
                          event.start!.getMonth(),
                          event.start!.getDate(),
                          field.value.hour,
                          field.value.minute,
                        );
                        if (!field.value || end < event.start!) {
                          form.setValue("end", event.end!);
                          return;
                        }
                        onEventChange({
                          end: end
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {start.getDate() !== end.getDate() && (
            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <DatePicker
                      defaultMonth={field.value}
                      selected={field.value}
                      format={(date) => format(date, "PPPP")}
                      onSelect={(date) => {
                        if (!date) {
                          onClose();
                          return;
                        }
                        const end = event.end ? new Date(
                          date.getFullYear(),
                          date.getMonth(),
                          date.getDate(),
                          event.end.getHours(),
                          event.end.getMinutes(),
                        ) : event.start!;
                        field.onChange(end);
                        onEventChange({
                          end
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="repeatability"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(
                      v: CustomScheduleEventRepeatability | "new-custom",
                    ) => {
                      field.onChange(v);
                      if (v === "new-custom") {
                        setIsCustomRecurrenceOpen(true);
                        return;
                      }
                    }}
                  >
                    <SelectTrigger className="max-w-72">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {repeatabilities.map((option) => (
                          <SelectItem
                            value={option.value}
                            key={`repeatability-${option.value}`}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => onClose()} type="button">
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
      <CustomRecurrenceDialog
        start={event.start!}
        data={custom}
        open={isCustomRecurrenceOpen}
        onClose={(data?: CustomRecurrence) => {
          setIsCustomRecurrenceOpen(false);
          if (!data) {
            form.setValue("repeatability", savedRepeatability);
            return;
          }
          setCustom(data);
        }}
      />
    </>
  );
}

function CustomTimeTextField(props: any) {
  const {
    id,
    ref,
    ownerState,
    sx,
    inputProps: { onKeyDown, ...inputProps },
    InputProps,
    error,
    onBlur,
    ...other
  } = props;

  return (
    <Input
      id={id}
      ref={ref}
      onBlur={onBlur}
      onKeyDown={(e) => {
        onKeyDown(e);
        if (e.key === "Enter") {
          e.preventDefault();
          onBlur(e);
        }
      }}
      {...inputProps}
      {...other}
    />
  );
}
