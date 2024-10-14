import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { addMonths, format } from "date-fns";
import { z } from "zod";
import { Frequency } from "rrule";

import {
  FormControl,
  FormField,
  FormItem,
  Form,
} from "@/lib/components/ui/form";
import { Input } from "@/lib/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/lib/components/ui/radio-group";
import { Label } from "@/lib/components/ui/label";
import { Button } from "@/lib/components/ui/button";
import { DatePicker } from "@/lib/components/common/date-picker";
import { cn } from "@/lib/utils/style";
import {
  COMMON_DAYS_TO_RRULE_DAYS,
  DATE_DAY_TO_RRULE_DAY,
} from "./use-calendar-events";

const baseCustomRecurrenceFormSchema = z.object({
  frequency: z.nativeEnum(Frequency),
  interval: z.number().min(1),
  ends: z.date().optional(),
});


const dailyRecurrenceFormSchema = z.object({
  frequency: z.literal(Frequency.DAILY),
});

const weeklyRecurrenceFormSchema = z.object({
  frequency: z.literal(Frequency.WEEKLY),
  days: z.array(z.number()),
});

const monthlyRecurrenceFormSchema = z.object({
  frequency: z.literal(Frequency.MONTHLY),
});

const yearlyRecurrenceFormSchema = z.object({
  frequency: z.literal(Frequency.YEARLY),
});

const customRecurrenceFormSchema = z
  .discriminatedUnion("frequency", [
    dailyRecurrenceFormSchema,
    weeklyRecurrenceFormSchema,
    monthlyRecurrenceFormSchema,
    yearlyRecurrenceFormSchema,
  ])
  .and(baseCustomRecurrenceFormSchema);

export type CustomRecurrence = z.infer<typeof customRecurrenceFormSchema>;

type CustomRecurrenceFormProps = {
  onClose: (data?: CustomRecurrence) => void;
  start: Date;
  data?: CustomRecurrence;
};

export function CustomRecurrenceForm({
  onClose,
  start,
  data,
}: CustomRecurrenceFormProps) {
  const FORM_DEFAULTS: CustomRecurrence = {
    frequency: Frequency.WEEKLY,
    interval: 1,
    ends: addMonths(start, 1),
    days: [DATE_DAY_TO_RRULE_DAY[start.getDay()]],
  };

  const form = useForm<CustomRecurrence>({
    resolver: zodResolver(customRecurrenceFormSchema),
    defaultValues: data ? {
      ...data,
      ...FORM_DEFAULTS
    } : FORM_DEFAULTS
  });
  const [isEnding, setIsEnding] = useState<"never" | "on">(
    data?.ends ? "on" : "never",
  );

  const interval = form.watch("interval");
  const frequency = form.watch("frequency");
  const days = form.watch("days") || [];
  const frequencies = useMemo(() => {
    const isPlural = interval > 1;
    return [
      {
        label: "day" + (isPlural ? "s" : ""),
        value: Frequency.DAILY,
      },
      {
        label: "week" + (isPlural ? "s" : ""),
        value: Frequency.WEEKLY,
      },
      {
        label: "month" + (isPlural ? "s" : ""),
        value: Frequency.MONTHLY,
      },
      {
        label: "year" + (isPlural ? "s" : ""),
        value: Frequency.YEARLY,
      },
    ];
  }, [interval]);

  const onSubmit = (data: z.infer<typeof customRecurrenceFormSchema>) => {
    console.log(data)
    onClose({
      ...data,
      ends: isEnding === "never" ? undefined : data.ends,
    });
  };

  useEffect(() => {
    if (days.length === 0) {
      form.setValue("days", [DATE_DAY_TO_RRULE_DAY[start.getDay()]]);
    }
  }, [days]);

  useEffect(() => {
    if (frequency !== Frequency.WEEKLY) {
      form.setValue("days", []);
    }
  }, [frequency]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        className="grid gap-4"
      >
        <div className="flex flex-row items-center gap-2">
          <p className="text-[0.86rem] text-muted-foreground">Repeat every</p>
          <FormField
            control={form.control}
            name="interval"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="number" className="w-16" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(v: string) => {
                      field.onChange(parseInt(v));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {frequencies.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        {frequency === Frequency.WEEKLY && (
          <div className="flex flex-col gap-1">
            <p className="text-[0.86rem] text-muted-foreground">Repeats on</p>
            <div className="flex flex-row gap-2">
              {Object.entries(COMMON_DAYS_TO_RRULE_DAYS).map(
                ([key, value]) => (
                  <span key={`days-${value}`}>
                    <div
                      className={cn(
                        "inline-flex items-center justify-center text-muted-foreground bg-secondary w-6 h-6 text-[10px] leading-[1.25rem] cursor-pointer rounded-full border-none",
                        {
                          "bg-primary text-white": days.includes(value),
                        },
                      )}
                      onClick={() => {
                        if (days.includes(value)) {
                          form.setValue(
                            "days",
                            days.filter((d) => d !== value),
                          );
                          return;
                        }
                        form.setValue("days", [...days, value]);
                      }}
                    >
                      {key}
                    </div>
                  </span>
                ),
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          <p className="text-[0.86rem] text-muted-foreground">Ends</p>
          <RadioGroup
            value={isEnding}
            onValueChange={(v: "never" | "on") => setIsEnding(v)}
            className="gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="never" id="never" />
              <Label htmlFor="never" className="font-normal">
                Never
              </Label>
            </div>
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="on" id="on" />
                <Label htmlFor="on" className="font-normal w-24">
                  On
                </Label>
              </div>
              <FormField
                control={form.control}
                name="ends"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DatePicker
                        defaultMonth={field.value}
                        selected={field.value}
                        format={(date) => format(date, "MMMM d, yyyy")}
                        disabled={isEnding !== "on"}
                        onSelect={(date) => {
                          field.onChange(date);
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </RadioGroup>
        </div>
        <div className="flex flex-row gap-2 justify-end">
          <Button variant="outline" onClick={() => onClose()} type="button">
            Cancel
          </Button>
          <Button type="submit">Done</Button>
        </div>
      </form>
    </Form>
  );
}
