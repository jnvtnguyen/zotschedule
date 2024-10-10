import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { format, intervalToDuration, add } from "date-fns";
import { ArrowRightIcon, CalendarIcon } from "@radix-ui/react-icons";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/lib/components/ui/popover";
import { Button } from "@/lib/components/ui/button";
import { cn } from "@/lib/utils/style";
import { Calendar } from "@/lib/components/ui/calendar";
import { EventColorPicker } from "./schedule-actions-panel/event/event-color-picker";
import { useToast } from "@/lib/hooks/use-toast";

const newEventFormSchema = z.object({
  color: z.string().min(1, { message: "A event color is required." }),
  title: z.string().optional(),
  start: z.date({ required_error: "A event start date is required." }),
  end: z.date({ required_error: "A event end date is required." }),
});

const save = createServerFn(
  "POST",
  async ({
    data,
    schedule,
  }: {
    data: z.infer<typeof newEventFormSchema>;
    schedule: Schedule;
  }) => {
    console.log(data.start.getHours());
    /*
  await database
    .insertInto("customScheduleEvents")
    .values({
      scheduleId: schedule.id,
      color: data.color,
      title: data.title || "(No Title)",
      description: "",
      start: data.start,
      end: data.end,
      frequency: "DAILY",
      interval: 1,
      days: [],
    })
    .executeTakeFirstOrThrow();
  */
  },
);

type NewEventFormProps = {
  event: EventImpl;
  schedule: Schedule;
  onEventChange: (event: Partial<EventImpl>) => void;
  onClose: () => void;
};

export function NewEventForm({
  event,
  schedule,
  onEventChange,
  onClose,
}: NewEventFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof newEventFormSchema>>({
    resolver: zodResolver(newEventFormSchema),
    defaultValues: {
      color: event.extendedProps.event.color,
      title: event.extendedProps.event.title,
      start: event.extendedProps.event.start,
      end: event.extendedProps.event.end,
    },
  });

  useEffect(() => {
    form.setValue("start", event.extendedProps.event.start);
  }, [event.extendedProps.event.start]);

  useEffect(() => {
    form.setValue("end", event.extendedProps.event.end);
  }, [event.extendedProps.event.end]);

  const onSubmit = async (data: z.infer<typeof newEventFormSchema>) => {
    try {
      console.log(data.start.toISOString());
      await save({ data, schedule });
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
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn("pl-3 text-left font-normal")}
                    >
                      {event.start ? (
                        format(event.start, "PPPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    defaultMonth={field.value}
                    selected={field.value}
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
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
        <div className="flex flex-row justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
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
