import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Event } from "react-big-calendar";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";

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

const newEventFormSchema = z.object({
  color: z.string().min(1, { message: "A event color is required." }),
  title: z.string().min(1, { message: "A event title is required." }),
  start: z.date({ required_error: "A event start date is required." }),
});

type NewEventFormProps = {
  event: Event;
  onEventChange: (event: Partial<Event>) => void;
  onClose: () => void;
};

export function NewEventForm({
  event,
  onEventChange,
  onClose,
}: NewEventFormProps) {
  const form = useForm<z.infer<typeof newEventFormSchema>>({
    resolver: zodResolver(newEventFormSchema),
    defaultValues: {
      color: event.resource.color,
      title: event.resource.event.title,
      start: event.start
    },
  });

  useEffect(() => {
    if (!event.start) {
      return;
    }
    form.setValue("start", event.start);
  }, [event.start]);

  const onSubmit = (data: z.infer<typeof newEventFormSchema>) => {};

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        className="grid gap-4"
      >
        <div className="flex flex-row items-center gap-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field: { onChange, ...field } }) => (
              <FormItem className="grow">
                <FormControl>
                  <Input onChange={(e) => {
                    onChange(e.target.value);
                    onEventChange({
                      title: e.target.value
                    });
                  }} {...field} placeholder="Enter the event title" />
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
                  <EventColorPicker event={event.resource.event} isInDatabase={false} icon="circle" />
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
                      className={cn(
                        "pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPPP")
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
      </form>
    </Form>
  );
}
