import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { format, intervalToDuration, add } from "date-fns";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimeField } from "@mui/x-date-pickers";
import { EventImpl } from "@fullcalendar/core/internal";
import { createServerFn } from "@tanstack/start";
import { useQueryClient } from "@tanstack/react-query";

import { database } from "@/lib/database";
import { Schedule } from "@/lib/database/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/lib/components/ui/form";
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
import { FREQUENCY_TO_LABEL } from '@/lib/uci/events/types';
import { CustomScheduleEventRepeatability } from "@/lib/database/generated-types";
import { CustomRecurrenceDialog } from "./custom-recurrence-dialog";
import { CustomRecurrence } from "./custom-recurrence-form";
import { RSCHEDULE_DAYS_ORDER, RSCHEDULE_DAYS_TO_LABEL } from './use-calendar-events';

const newEventFormSchema = z.object({
  color: z.string().min(1, { message: "A event color is required." }),
  title: z.string().optional(),
  start: z.date({ required_error: "A event start date is required." }),
  end: z.date({ required_error: "A event end date is required." }),
  repeatability: z.nativeEnum(CustomScheduleEventRepeatability).or(z.literal("new-custom")),
});

const save = createServerFn(
  "POST",
  async ({
    data,
    schedule,
    customRecurrence
  }: {
    data: z.infer<typeof newEventFormSchema>;
    schedule: Schedule;
    customRecurrence?: CustomRecurrence;
  }) => {
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
        frequency: customRecurrence?.frequency,
        interval: customRecurrence?.interval,
        days: customRecurrence?.frequency === "WEEKLY" ? customRecurrence.days : [],
        repeatUntil: customRecurrence?.ends,
        months: [],
        weeks: []
      })
      .executeTakeFirstOrThrow();
  },
);

type NewEventFormProps = {
  event: EventImpl;
  schedule: Schedule;
  onEventChange: (event: Partial<CustomScheduleCalendarEvent>) => void;
  onClose: () => void;
};

type RepeatabilityOption = {
  label: string;
  value: CustomScheduleEventRepeatability | "new-custom";
};

export function NewEventForm({
  event,
  schedule,
  onEventChange,
  onClose,
}: NewEventFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCustomRecurrenceOpen, setIsCustomRecurrenceOpen] = useState(false);
  const [customRecurrence, setCustomRecurrence] = useState<CustomRecurrence | undefined>(
    event.extendedProps.event.repeatability === CustomScheduleEventRepeatability.CUSTOM ?
    {
      frequency: event.extendedProps.event.frequency,
      interval: event.extendedProps.event.interval,
      days: event.extendedProps.event.days,
      ends: event.extendedProps.event.ends
    } : undefined
  );
  const [savedRepeatability, setSavedRepeatability] = useState<CustomScheduleEventRepeatability>(
    CustomScheduleEventRepeatability.NONE,
  );

  const form = useForm<z.infer<typeof newEventFormSchema>>({
    resolver: zodResolver(newEventFormSchema),
    defaultValues: {
      color: event.extendedProps.event.color,
      title: event.extendedProps.event.title,
      start: event.extendedProps.event.start,
      end: event.extendedProps.event.end,
      repeatability: event.extendedProps.event.repeatability
    },
  });

  const repeatability = form.watch("repeatability");
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

    if (customRecurrence) {
      let label = FREQUENCY_TO_LABEL[customRecurrence.frequency];
      if (customRecurrence.frequency === "WEEKLY") {
        label = `${label} on ${customRecurrence.days
          .sort((a, b) => RSCHEDULE_DAYS_ORDER.indexOf(a) - RSCHEDULE_DAYS_ORDER.indexOf(b))
          .map((day) => RSCHEDULE_DAYS_TO_LABEL[day])
          .join(", ")}`;
      }

      if (customRecurrence.ends) {
        label = `${label}, until ${format(customRecurrence.ends, "MMMM d, yyyy")}`;
      }

      options.push({
        label: label,
        value: CustomScheduleEventRepeatability.CUSTOM
      });
    }

    options.push({
      label: "Custom",
      value: "new-custom"
    });

    return options;
  }, [event.start, customRecurrence]);

  useEffect(() => {
    if (customRecurrence) {
      form.setValue("repeatability", CustomScheduleEventRepeatability.CUSTOM);
    }
  }, [customRecurrence]);

  useEffect(() => {
    if (repeatability !== CustomScheduleEventRepeatability.CUSTOM && repeatability !== "new-custom" && customRecurrence) {
      setCustomRecurrence(undefined);
    }
    if (repeatability === "new-custom") {
      return;
    }
    setSavedRepeatability(repeatability);
    onEventChange({
      repeatability,
    });
    if (repeatability === CustomScheduleEventRepeatability.CUSTOM && customRecurrence) {
      onEventChange({
        ...customRecurrence,
        months: [],
        weeks: []
      });
    }
  }, [repeatability]);

  useEffect(() => {
    form.setValue("start", event.extendedProps.event.start);
  }, [event.extendedProps.event.start]);

  useEffect(() => {
    form.setValue("end", event.extendedProps.event.end);
  }, [event.extendedProps.event.end]);

  const onSubmit = async (data: z.infer<typeof newEventFormSchema>) => {
    try {
      await save({ data, schedule, customRecurrence });
      await queryClient.invalidateQueries({
        queryKey: ["schedule-events", schedule.id],
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
                        event.start?.getHours(),
                        event.start?.getMinutes(),
                      );
                      const end = new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        event.end?.getHours(),
                        event.end?.getMinutes(),
                      );
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
          <div className="flex flex-row gap-1 items-center">
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <TimeField
                      slots={{
                        textField: CustomTimeTextField,
                      }}
                      value={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                      }}
                      onBlur={() => {
                        if (!field.value || isNaN(field.value.getTime())) {
                          form.resetField("start");
                          return;
                        }
                        onEventChange({
                          start: field.value,
                          end: add(
                            field.value,
                            intervalToDuration({
                              start: event.start!,
                              end: event.end!,
                            }),
                          ),
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ArrowRightIcon className="h-6 w-6" />
            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <TimeField
                      slots={{
                        textField: CustomTimeTextField,
                      }}
                      value={field.value}
                      onChange={(date) => {
                        field.onChange(date);
                      }}
                      onBlur={() => {
                        if (!field.value || isNaN(field.value.getTime())) {
                          form.resetField("end");
                          return;
                        }
                        onEventChange({
                          end: field.value,
                        });
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="repeatability"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={(v: CustomScheduleEventRepeatability | "new-custom") => {
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
                          <SelectItem value={option.value} key={`repeatability-${option.value}`}>
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
        data={customRecurrence}
        open={isCustomRecurrenceOpen}
        onClose={(data?: CustomRecurrence) => {
          setIsCustomRecurrenceOpen(false);
          if (!data) {
            form.setValue("repeatability", savedRepeatability);
            return;
          }
          setCustomRecurrence(data);
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
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onBlur();
        }
        onKeyDown(e);
      }}
      onBlur={onBlur}
      {...inputProps}
      {...other}
    />
  );
}
